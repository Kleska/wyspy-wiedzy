import { describe, expect, it } from 'vitest';
import { mergeDoc, sameJson } from '../src/data/merge';
import { Store } from '../src/data/store';
import type { Attempt, ExerciseReport, Profile, Session } from '../src/types';

const profile = (over: Partial<Profile>): Profile => ({ id: 'z', name: 'Zosia', avatar: '🦊', theme: 'wyspy', grade: 5, createdAt: '2026-10-01T10:00:00.000Z', updatedAt: '2026-10-01T10:00:00.000Z', ...over });
const plan = (title: string, setAt: string) => ({ topicIds: ['b-a5-u0-be'], title, setAt });

describe('scalanie zmian z dwóch urządzeń', () => {
  it('porównanie JSON nie zależy od kolejności kluczy ani od kluczy z undefined', () => {
    expect(sameJson({ a: 1, b: [1, { c: 2 }] }, { b: [1, { c: 2 }], a: 1 })).toBe(true);
    expect(sameJson({ a: 1, b: undefined }, { a: 1 })).toBe(true);
    expect(sameJson({ a: 1 }, { a: 2 })).toBe(false);
    expect(sameJson([1, 2], [2, 1])).toBe(false);
    expect(sameJson({ a: null }, { a: undefined })).toBe(true);
  });

  it('temat i ustawienia: wygrywa nowsza wersja', () => {
    const older = { id: 't', title: 'A', updatedAt: '2026-10-01T10:00:00.000Z' };
    const newer = { id: 't', title: 'B', updatedAt: '2026-10-02T10:00:00.000Z' };
    expect(mergeDoc('topic', older, newer)).toBe(newer);
    expect(mergeDoc('topic', newer, older)).toBe(newer);
    expect(mergeDoc('settings', newer, older)).toBe(newer);
  });

  it('urządzenie, które dołącza do konta, przyjmuje ustawienia rodziny z chmury (PIN, nagrody)', () => {
    const cloud = { id: 'family', parentPinHash: 'rodzic', rewards: [{ id: 'kino' }], updatedAt: '2026-10-01T10:00:00.000Z' };
    const tablet = { id: 'family', parentPinHash: 'tablet', rewards: [], updatedAt: '2026-10-02T10:00:00.000Z' };
    expect(mergeDoc('settings', tablet, cloud, { joining: true })).toBe(cloud);
    // Później, przy zwykłej zmianie ustawień, liczy się nowsza wersja.
    expect(mergeDoc('settings', tablet, cloud)).toBe(tablet);
  });

  it('osoba: zmiana wyglądu na tablecie dziecka nie kasuje planu ustawionego przez rodzica', () => {
    const parent = profile({ plan: plan('Sprawdzian: Unit 0', '2026-10-03T08:00:00.000Z'), planAt: '2026-10-03T08:00:00.000Z', updatedAt: '2026-10-03T08:00:00.000Z' });
    const tablet = profile({ theme: 'pixel', updatedAt: '2026-10-03T09:00:00.000Z' }); // nowsza, ale bez planu
    const merged = mergeDoc('profile', tablet, parent) as Profile;
    expect(merged.theme).toBe('pixel');
    expect(merged.plan?.title).toBe('Sprawdzian: Unit 0');
    expect(merged.planAt).toBe('2026-10-03T08:00:00.000Z');
    // W drugą stronę (tablet ma wersję z chmury, rodzic jest „lokalny”) wynik jest ten sam.
    expect(sameJson(mergeDoc('profile', parent, tablet), merged)).toBe(true);
  });

  it('osoba: lista „skończonych” tematów od rodzica przeżywa zmianę wyglądu na tablecie dziecka', () => {
    const parent = profile({ done: ['b-m5-kolejnosc'], doneAt: '2026-10-03T08:00:00.000Z', updatedAt: '2026-10-03T08:00:00.000Z' });
    const tablet = profile({ theme: 'kosmos', updatedAt: '2026-10-03T09:00:00.000Z' }); // nowsza, ale bez listy
    const merged = mergeDoc('profile', tablet, parent) as Profile;
    expect(merged.theme).toBe('kosmos');
    expect(merged.done).toEqual(['b-m5-kolejnosc']);
    expect(sameJson(mergeDoc('profile', parent, tablet), merged)).toBe(true);
    // Ze wspólną wersją: każda strona zachowuje swoją zmianę, a przywrócenie tematu (pusta lista) też się liczy.
    const base = profile({ done: ['b-m5-kolejnosc'], doneAt: '2026-10-03T08:00:00.000Z', updatedAt: '2026-10-03T08:00:00.000Z' });
    const parent2 = { ...base, done: [], doneAt: '2026-10-04T08:00:00.000Z', updatedAt: '2026-10-04T08:00:00.000Z' };
    const tablet2 = { ...base, theme: 'pixel' as const, updatedAt: '2026-10-04T09:00:00.000Z' };
    const m2 = mergeDoc('profile', tablet2, parent2, { base }) as Profile;
    expect(m2.done).toEqual([]);
    expect(m2.theme).toBe('pixel');
  });

  it('osoba: usunięcie planu przez rodzica też wygrywa ze starszym planem na tablecie', () => {
    const tablet = profile({ theme: 'zeszyt', plan: plan('Stary plan', '2026-10-01T08:00:00.000Z'), updatedAt: '2026-10-03T09:00:00.000Z' });
    const parent = profile({ plan: null, planAt: '2026-10-03T08:00:00.000Z', updatedAt: '2026-10-03T08:00:00.000Z' });
    const merged = mergeDoc('profile', tablet, parent) as Profile;
    expect(merged.plan).toBeNull();
    expect(merged.theme).toBe('zeszyt');
  });

  it('ze wspólną wersją wyjściową każda strona zachowuje swoje zmiany, także gdy rodzic zapisał później', () => {
    const base = profile({ plan: plan('Sprawdzian: Unit 0', '2026-10-03T08:00:00.000Z'), planAt: '2026-10-03T08:00:00.000Z', updatedAt: '2026-10-03T08:00:00.000Z' });
    const tablet = { ...base, theme: 'zeszyt' as const, updatedAt: '2026-10-03T09:00:00.000Z' }; // córka offline zmienia wygląd
    const parent = { ...base, plan: plan('Sprawdzian w piątek', '2026-10-03T09:30:00.000Z'), planAt: '2026-10-03T09:30:00.000Z', grade: 6, updatedAt: '2026-10-03T09:30:00.000Z' };
    const merged = mergeDoc('profile', tablet, parent, { base }) as Profile;
    expect(merged.theme).toBe('zeszyt');
    expect(merged.plan?.title).toBe('Sprawdzian w piątek');
    expect(merged.grade).toBe(6);
    expect(merged.updatedAt).toBe('2026-10-03T09:30:00.000Z');
    // To samo pole zmienione po obu stronach: wygrywa nowszy dokument.
    const both = mergeDoc('profile', { ...tablet, avatar: '🐼' }, { ...parent, avatar: '🦉' }, { base }) as Profile;
    expect(both.avatar).toBe('🦉');
    // Pole usunięte po jednej stronie (rodzic skasował cel dzienny) też się przenosi.
    const withGoal = { ...base, dailyGoalMinutes: 20 };
    const cleared = mergeDoc('profile', { ...withGoal, theme: 'pixel' as const, updatedAt: '2026-10-03T09:00:00.000Z' }, { ...base, updatedAt: '2026-10-03T09:30:00.000Z' }, { base: withGoal }) as Profile;
    expect(cleared.dailyGoalMinutes).toBeUndefined();
    expect(cleared.theme).toBe('pixel');
  });

  it('osoba: zgłoszenia błędów w zadaniach z obu urządzeń się sumują, a decyzja rodzica nie ginie', () => {
    const rep = (id: string, at: string, extra: Partial<ExerciseReport> = {}): ExerciseReport => ({ id, topicId: 't', exerciseId: `e-${id}`, reason: 'mine', topic: 'Temat', question: 'Pytanie', correct: 'Odpowiedź', at, ...extra });
    const base = profile({ reports: [rep('r1', '2026-10-03T08:00:00.000Z')] });
    // Rodzic wyłącza zadanie z pierwszego zgłoszenia; tablet bez internetu: dziecko zgłasza drugie zadanie i zmienia wygląd.
    const parent = { ...base, reports: [rep('r1', '2026-10-03T08:00:00.000Z', { decision: 'off', decidedAt: '2026-10-03T09:00:00.000Z' })], updatedAt: '2026-10-03T09:00:00.000Z' };
    const tablet = { ...base, theme: 'pixel' as const, reports: [...base.reports!, rep('r2', '2026-10-03T08:30:00.000Z')], updatedAt: '2026-10-03T08:30:00.000Z' };
    const merged = mergeDoc('profile', tablet, parent, { base }) as Profile;
    expect(merged.reports?.map((r) => [r.id, r.decision])).toEqual([
      ['r1', 'off'],
      ['r2', undefined],
    ]);
    expect(merged.theme).toBe('pixel');
    // Wynik nie zależy od tego, które urządzenie scala, ani od tego, czy znamy wersję wspólną.
    expect(sameJson((mergeDoc('profile', parent, tablet, { base }) as Profile).reports, merged.reports)).toBe(true);
    expect(sameJson((mergeDoc('profile', tablet, parent) as Profile).reports, merged.reports)).toBe(true);
    // Ponowne włączenie zadania (późniejsza decyzja) wygrywa z wcześniejszą.
    const reopened = { ...parent, reports: [rep('r1', '2026-10-03T08:00:00.000Z', { decision: 'ok', decidedAt: '2026-10-03T10:00:00.000Z' })], updatedAt: '2026-10-03T10:00:00.000Z' };
    expect((mergeDoc('profile', merged, reopened) as Profile).reports?.map((r) => [r.id, r.decision])).toEqual([
      ['r1', 'ok'],
      ['r2', undefined],
    ]);
    // Osoba bez zgłoszeń nie dostaje pustej listy (dokument nie zmienia się bez powodu).
    expect('reports' in (mergeDoc('profile', profile({}), profile({ updatedAt: '2026-10-05T10:00:00.000Z' })) as Profile)).toBe(false);
  });

  it('osoba: usunięcie i „Zacznij od nowa” nie cofają się', () => {
    const removed = profile({ deleted: true, resetAt: '2026-10-02T08:00:00.000Z', updatedAt: '2026-10-02T08:00:00.000Z' });
    const stale = profile({ avatar: '🐼', updatedAt: '2026-10-03T08:00:00.000Z' });
    const merged = mergeDoc('profile', stale, removed) as Profile;
    expect(merged.deleted).toBe(true);
    expect(merged.resetAt).toBe('2026-10-02T08:00:00.000Z');
    expect(merged.avatar).toBe('🐼');
  });
});

describe('łączenie dwóch profili tego samego dziecka', () => {
  it('odpowiedzi, sesje i nagrody przechodzą do drugiego profilu, a pierwszy znika z listy', async () => {
    const s = new Store();
    await s.init();
    await s.put('profile', profile({ id: 'tablet', name: 'Zosia' }));
    await s.put('profile', profile({ id: 'telefon', name: 'Zosia', createdAt: '2026-10-02T10:00:00.000Z' }));
    const att = (id: string, profileId: string): Attempt => ({ id, profileId, sessionId: `s-${profileId}`, topicId: 'b-a5-u0-be', exerciseId: id, correct: true, retry: false, hint: false, ms: 2000, at: '2026-10-02T12:00:00.000Z' });
    const ses = (profileId: string): Session => ({ id: `s-${profileId}`, profileId, topicId: 'b-a5-u0-be', mode: 'topic', startedAt: '2026-10-02T12:00:00.000Z', endedAt: '2026-10-02T12:05:00.000Z', activeSeconds: 300, answered: 2, correct: 2, completed: true });
    await s.putMany('attempt', [att('a1', 'tablet'), att('a2', 'tablet'), att('a3', 'telefon')]);
    await s.putMany('session', [ses('tablet'), ses('telefon')]);

    expect(await s.mergeProfiles('tablet', 'telefon')).toBe(3);
    expect(s.list('attempt').every((a) => a.profileId === 'telefon')).toBe(true);
    expect(s.list('session').every((x) => x.profileId === 'telefon')).toBe(true);
    expect(s.profiles().map((p) => p.id)).toEqual(['telefon']);
    // Nic nie ginie: usunięty profil zostaje w bazie jako „usunięty”.
    expect(s.get('profile', 'tablet')?.deleted).toBe(true);
    expect(await s.mergeProfiles('telefon', 'nie-ma')).toBe(0);
  });
});

describe('zadania wyłączone przez rodzica', () => {
  it('wyłączone zadanie znika z tematu (i z jego liczby zadań), a po włączeniu wraca', async () => {
    const s = new Store();
    await s.init();
    const before = s.allTopics().find((t) => t.id === 'b-rzeczownik')!;
    const ex = before.exercises[0];
    await s.saveSettings({ disabledExercises: [ex.id] });
    const after = s.allTopics().find((t) => t.id === 'b-rzeczownik')!;
    expect(after.exercises.length).toBe(before.exercises.length - 1);
    expect(after.exercises.some((e) => e.id === ex.id)).toBe(false);
    expect(s.topicsFor(null).find((t) => t.id === 'b-rzeczownik')!.exercises.some((e) => e.id === ex.id)).toBe(false);
    // Lista dla rodzica pokazuje wyłączone zadanie razem z tematem.
    expect(s.disabledExercises().map((d) => [d.topic.id, d.ex.id])).toContainEqual(['b-rzeczownik', ex.id]);
    // Pozostałe tematy to te same obiekty co przed zmianą — nic nie liczymy od nowa bez potrzeby.
    await s.saveSettings({ disabledExercises: [] });
    expect(s.allTopics().find((t) => t.id === 'b-rzeczownik')!.exercises.length).toBe(before.exercises.length);
    expect(s.disabledExercises()).toEqual([]);
  });

  it('przy łączeniu dwóch profili zgłoszenia błędów przechodzą do profilu, który zostaje', async () => {
    const s = new Store();
    await s.init();
    const rep: ExerciseReport = { id: 'r1', topicId: 'b-rzeczownik', exerciseId: 'e1', reason: 'unclear', topic: 'Rzeczownik', question: 'Pytanie', correct: 'Odpowiedź', at: '2026-10-03T08:00:00.000Z' };
    await s.put('profile', profile({ id: 'tablet', reports: [rep] }));
    await s.put('profile', profile({ id: 'telefon', createdAt: '2026-10-02T10:00:00.000Z' }));
    await s.mergeProfiles('tablet', 'telefon');
    expect(s.get('profile', 'telefon')?.reports?.map((r) => r.id)).toEqual(['r1']);
  });
});
