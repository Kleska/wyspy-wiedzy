// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { store } from '../src/data/store';
import { parseDsl } from '../src/dsl';
import { quizStates } from '../src/engine';
import { themeOf } from '../src/themes';
import { AppContext, type AppCtx, type Run } from '../src/ui/hooks';
import { Practice, snapshot } from '../src/ui/Practice';

let root: Root;
let host: HTMLDivElement;
let ctx: AppCtx;
let clock: number;
const at = '2026-10-22T14:00:00.000Z';
const dsl = 'wpisz: Oblicz iloczyn. >> 6 · 7 = [42]. !! 6 · 7 = 42.\nwybierz: Wskaż liczbę podzielną przez 10. | *20 | 21 | 22 !! Liczba 20 kończy się zerem.';
const items = parseDsl(dsl).exercises.map((e) => ({ topicId: 'feedback-topic', exerciseId: e.id }));

beforeEach(async () => {
  (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  window.scrollTo = vi.fn();
  window.WW_CONFIG = {};
  await store.init();
  await store.resetLocal();
  await store.saveSettings({ sounds: false, autoRead: false });
  await store.put('profile', { id: 'feedback-child', name: 'Uczennica', grade: 5, avatar: 'hero:nova', theme: 'wyspy', createdAt: at, updatedAt: at });
  await store.put('topic', { id: 'feedback-topic', title: 'Kontrola odpowiedzi', subject: 'mat', source: 'manual', order: 1, grades: [5], dsl, guide: 'Ściąga tematu.', createdAt: at, updatedAt: at });
  ctx = { profile: store.get('profile', 'feedback-child')!, theme: themeOf('wyspy'), go: vi.fn(), toast: vi.fn(), openThemes: vi.fn(), openTopic: vi.fn(), switchProfile: vi.fn() };
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  clock = Date.now();
  vi.spyOn(Date, 'now').mockImplementation(() => clock);
  vi.spyOn(Math, 'random').mockReturnValue(0.999); // Zachowaj kolejność dwóch zadanych pytań.
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
});
function button(text: string) {
  const b = [...host.querySelectorAll<HTMLButtonElement>('button')].find((el) => el.textContent?.trim() === text);
  if (!b) throw new Error(`Brak przycisku: ${text}`);
  return b;
}
async function click(text: string) { await act(async () => button(text).click()); }

describe('natychmiastowy wynik w ocenianych testach', () => {
  it.each([false, true])('pokazuje błąd i poprawny wynik, blokuje poprawki i zapisuje pierwsze odpowiedzi (kartkówka: %s)', async (quiz) => {
    const run: Run = { kind: 'test', topicIds: ['feedback-topic'], title: 'Kontrola', subjectId: 'mat', count: 2, items, ...(quiz ? { quizId: 'feedback-quiz' } : {}) };
    if (quiz) {
      await store.put('profile', { ...ctx.profile, quizzes: [{ id: 'feedback-quiz', title: 'Kontrola', topicIds: run.topicIds, items, count: 2, createdAt: at }] });
      ctx.profile = store.get('profile', ctx.profile.id)!;
    }
    await act(async () => root.render(<AppContext.Provider value={ctx}><Practice run={run} /></AppContext.Provider>));
    expect(host.textContent).toContain('Pytanie 1 z 2');
    expect(host.querySelector('[role="status"]')).toBeNull();
    expect(host.textContent).not.toContain('Podpowiedź');
    expect(button('Sprawdź').disabled).toBe(true);
    await click('4');
    await click('1'); // Celowo 41 zamiast 42.
    const check = button('Sprawdź');
    await act(async () => { check.click(); check.click(); });
    expect(host.querySelector('.pr-foot.bad')?.textContent).toContain('Błąd');
    expect(host.querySelector('[role="status"]')?.textContent).toContain('Poprawnie: 42');
    expect(host.querySelector('[role="status"]')?.textContent).toContain('6 · 7 = 42');
    expect(host.querySelector<HTMLInputElement>('.gap')?.readOnly).toBe(true);
    expect(host.textContent).not.toContain('Ściąga');
    expect(host.textContent).not.toContain('wróci jeszcze raz');
    expect(host.textContent).toContain('Pytanie 1 z 2');
    expect(store.list('attempt').filter((a) => a.profileId === ctx.profile.id)).toHaveLength(1);
    expect(ctx.go).not.toHaveBeenCalled();

    // Szybki drugi klik nie pomija informacji zwrotnej.
    await click('Dalej');
    expect(host.textContent).toContain('Pytanie 1 z 2');
    clock += 1000;
    await click('Dalej');
    expect(host.textContent).toContain('Pytanie 2 z 2');
    expect(host.querySelector('[role="status"]')).toBeNull();
    await click('20');
    await click('Sprawdź');
    expect(host.querySelector('.pr-foot.good')?.textContent).toContain('Dobrze!');
    expect(host.querySelector('[role="status"]')?.textContent).toContain('Liczba 20 kończy się zerem');
    expect([...host.querySelectorAll<HTMLButtonElement>('.opt')].every((b) => b.disabled)).toBe(true);
    expect(ctx.go).not.toHaveBeenCalled(); // Ostatni wynik też musi pozostać widoczny.
    expect(store.list('session').find((s) => s.profileId === ctx.profile.id)?.completed).toBe(false);
    clock += 1000;
    await click('Zakończ sprawdzian');

    expect(ctx.go).toHaveBeenCalledOnce();
    const screen = vi.mocked(ctx.go).mock.calls[0][0];
    if (screen.name !== 'summary') throw new Error('Brak końcowego podsumowania');
    expect(screen.result.firstTotal).toBe(2);
    expect(screen.result.firstCorrect).toBe(1);
    expect(screen.result.retryTotal).toBe(0);
    expect(screen.result.exam?.grade).toBe(3);
    expect(screen.result.exam?.mistakes).toHaveLength(1);
    expect(screen.result.exam?.mistakes[0]).toMatchObject({ given: '41', correct: '42' });
    const attempts = store.list('attempt').filter((a) => a.profileId === ctx.profile.id);
    expect(attempts).toHaveLength(2);
    expect(attempts.every((a) => !a.retry && !a.hint)).toBe(true);
    expect(attempts.filter((a) => a.correct)).toHaveLength(1);
    const sessions = store.list('session').filter((s) => s.profileId === ctx.profile.id);
    expect(sessions).toHaveLength(1);
    expect(sessions[0]).toMatchObject({ completed: true, answered: 2, correct: 1 });
    if (quiz) expect(quizStates(ctx.profile.quizzes, snapshot(ctx.profile.id))[0].result).toMatchObject({ correct: 1, total: 2, grade: 3 });
  });
});
