// @vitest-environment jsdom
import { act, useEffect, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { store } from '../src/data/store';
import { App } from '../src/App';
import { seedPreview } from '../src/preview';
import { Home } from '../src/ui/Home';
import { Modal } from '../src/ui/bits';
import { AppContext, type AppCtx } from '../src/ui/hooks';
import { useNavigation } from '../src/ui/navigation';
import { ParentPanel } from '../src/ui/parent/ParentPanel';
import { SubjectScreen } from '../src/ui/SubjectScreen';
import { TopicSheet } from '../src/ui/TopicSheet';
import { themeOf, THEME_ORDER } from '../src/themes';

let root: Root;
let host: HTMLDivElement;
let context: AppCtx;

beforeEach(async () => {
  (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  window.scrollTo = vi.fn();
  window.WW_CONFIG = {};
  await store.init();
  await store.resetLocal();
  await seedPreview();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  context = {
    profile: store.profiles()[0],
    theme: themeOf('wyspy'),
    go: vi.fn(),
    toast: vi.fn(),
    openThemes: vi.fn(),
    openTopic: vi.fn(),
    switchProfile: vi.fn(),
  };
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
});
async function render(node: React.ReactNode) {
  await act(async () => root.render(<AppContext.Provider value={context}>{node}</AppContext.Provider>));
}
function button(text: string, scope: ParentNode = host) {
  const result = [...scope.querySelectorAll<HTMLButtonElement>('button')].find((el) => el.textContent?.trim() === text);
  if (!result) throw new Error(`Brak przycisku: ${text}`);
  return result;
}
async function click(text: string, scope: ParentNode = host) {
  await act(async () => button(text, scope).click());
}

describe('czytelny interfejs', () => {
  it('Wstecz z rzeczywistego ćwiczenia zachowuje wybrany dział przedmiotu', async () => {
    await render(<App />);
    await act(async () => host.querySelector<HTMLButtonElement>('.person')!.click());
    await act(async () => [...host.querySelectorAll<HTMLButtonElement>('.subject-big')].find((el) => el.textContent?.includes('Matematyka'))!.click());
    const nextUnit = host.querySelectorAll<HTMLButtonElement>('.unit-chips button')[1];
    const label = nextUnit.textContent;
    await act(async () => nextUnit.click());
    await act(async () => host.querySelector<HTMLButtonElement>('.clear-topic')!.click());
    await act(async () => [...host.querySelectorAll<HTMLButtonElement>('.topic-choice')].find((el) => el.textContent?.startsWith('Ćwicz'))!.click());
    expect(host.querySelector('.practice')).not.toBeNull();
    await act(async () => {
      history.back();
      await new Promise((r) => setTimeout(r, 90));
    });
    expect(host.querySelector('.unit-chips [aria-pressed="true"]')?.textContent).toBe(label);
  });
  it('cała aplikacja otwiera gry i wraca do startu, a Wstecz zamyka okno wyglądu', async () => {
    await render(<App />);
    await act(async () => host.querySelector<HTMLButtonElement>('.person')!.click());
    expect(host.querySelector('h1')?.textContent).toContain('Cześć, Odkrywca!');
    await click('Gry', host.querySelector('.student-nav')!);
    expect(host.querySelector('h1')?.textContent).toBe('Gry i treningi');
    await click('Dzisiaj', host.querySelector('.student-nav')!);
    await click('Wygląd');
    expect(host.querySelector('[role="dialog"]')).not.toBeNull();
    await act(async () => {
      history.back();
      await new Promise((r) => setTimeout(r, 40));
    });
    expect(host.querySelector('[role="dialog"]')).toBeNull();
    expect(host.querySelector('h1')?.textContent).toContain('Cześć, Odkrywca!');
  });
  it('start ma jeden polecany krok, bez kart celów i mini-gier', async () => {
    await render(<Home />);
    expect(host.querySelector('.today-card')?.textContent).toContain('Twoje zadanie na dziś');
    expect(host.querySelectorAll('.today-card > .btn-primary')).toHaveLength(1);
    expect(host.querySelectorAll('details.fold')).toHaveLength(0);
    expect(host.querySelector('.subject-big')?.textContent).not.toContain('0%');
    await click('Zaczynamy');
    expect(context.go).toHaveBeenCalledWith(expect.objectContaining({ name: 'learn', from: 'home' }));
  });
  it('cele i statystyki są dostępne w Moich postępach', async () => {
    await render(<Home section="progress" />);
    expect(host.querySelector('h1')?.textContent).toBe('Moje postępy');
    expect(host.textContent).toContain('Zadania na dziś');
    expect(host.textContent).toContain('Cel tygodnia');
    expect(host.textContent).not.toContain('Twoje zadanie na dziś');
  });
  it('karta tematu daje dwie czynności, a dodatki są zwinięte', async () => {
    const topic = store.topicsFor(context.profile.id).find((t) => t.lesson)!;
    await render(<TopicSheet topicId={topic.id} from="home" onClose={vi.fn()} />);
    expect(host.querySelectorAll('.topic-choice')).toHaveLength(2);
    expect(host.querySelector('.topic-more')?.hasAttribute('open')).toBe(false);
    const learn = host.querySelector<HTMLButtonElement>('.topic-choice')!;
    await act(async () => learn.click());
    expect(context.go).toHaveBeenCalledWith(expect.objectContaining({ name: 'learn', topicId: topic.id, from: 'home' }));
  });
  it.each(THEME_ORDER)('motyw %s zachowuje nazwę przedmiotu i układ wyboru', async (id) => {
    context = { ...context, theme: themeOf(id) };
    await render(<SubjectScreen subjectId="mat" />);
    expect(host.querySelector('h1')?.textContent).toBe('Matematyka');
    expect(host.querySelectorAll('.clear-topic').length).toBeGreaterThan(0);
    expect(host.querySelectorAll('.node-btn, .stop, .tile')).toHaveLength(0);
  });
  it('wybór dziecka zostaje po zmianie sekcji rodzica i ustawia klasę nowych zadań', async () => {
    await render(<ParentPanel pin="123456" onExit={vi.fn()} />);
    const select = host.querySelector<HTMLSelectElement>('select[aria-label="Uczeń"]')!;
    await act(async () => {
      select.value = 'demo-badaczka';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await click('Plan i sprawdziany');
    expect(host.querySelector<HTMLSelectElement>('select[aria-label="Uczeń"]')?.value).toBe('demo-badaczka');
    expect(host.textContent).toContain('Plan: Badaczka');
    await click('Tematy');
    expect(host.querySelector('[aria-label="Dla kogo"] [aria-pressed="true"]')?.textContent).toContain('Badaczka');
    await click('Dodaj z AI / zdjęcia');
    const grades = [...host.querySelectorAll<HTMLSelectElement>('select')].find((s) => [...s.options].some((o) => o.value === '8'));
    expect(grades?.value).toBe('5');
    await click('Postępy');
    expect(host.querySelector<HTMLSelectElement>('select[aria-label="Uczeń"]')?.value).toBe('demo-badaczka');
  });
});

describe('okna i historia', () => {
  it('okno przejmuje fokus, zawija Tab i oddaje fokus po Escape', async () => {
    function DialogTest() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Otwórz</button>
          {open && (
            <Modal title="Próba" onClose={() => setOpen(false)}>
              <button>Ostatni</button>
            </Modal>
          )}
        </>
      );
    }
    await render(<DialogTest />);
    button('Otwórz').focus();
    await click('Otwórz');
    const dialog = host.querySelector('[role="dialog"]')!;
    expect(dialog.contains(document.activeElement)).toBe(true);
    button('Ostatni').focus();
    await act(async () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })));
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Zamknij');
    button('Otwórz').focus();
    expect(dialog.contains(document.activeElement)).toBe(true);
    await act(async () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })));
    expect(host.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(button('Otwórz'));
  });
  it('Wstecz przywraca dział, a anulowanie zachowuje ćwiczenie i historię', async () => {
    let nav!: ReturnType<typeof useNavigation>;
    const guard = vi.fn().mockResolvedValue(false);
    function NavigationTest() {
      nav = useNavigation();
      useEffect(() => (nav.screen.name === 'practice' ? nav.registerBackGuard(guard) : undefined), [nav.screen.name, nav.registerBackGuard]);
      return <div>{JSON.stringify(nav.screen)}</div>;
    }
    await render(<NavigationTest />);
    await act(async () => nav.go({ name: 'subject', subjectId: 'mat', unit: 'Mnożenie i dzielenie' }));
    await act(async () => nav.go({ name: 'practice', nonce: 1, run: { kind: 'topic', topicId: 'example' } }));
    await act(async () => {
      history.back();
      await new Promise((r) => setTimeout(r, 60));
    });
    expect(guard).toHaveBeenCalledOnce();
    expect(nav.screen.name).toBe('practice');
    guard.mockResolvedValue(true);
    await act(async () => {
      history.back();
      await new Promise((r) => setTimeout(r, 90));
    });
    expect(nav.screen).toEqual({ name: 'subject', subjectId: 'mat', unit: 'Mnożenie i dzielenie' });
  });
});

describe('historia i wejście rodzica', () => {
  it('z wyboru profilu otwiera PIN rodzica i wraca do wyboru, bez wybierania dziecka', async () => {
    await render(<App />);
    await click('Panel rodzica');
    await act(async () => { await new Promise((r) => setTimeout(r, 20)); });
    expect(host.querySelector('.pin-pad')).not.toBeNull();
    expect(host.querySelector('.clear-start')).toBeNull();
    await click('Wróć');
    expect(host.textContent).toContain('Kto się dziś uczy?');
  });
  it('panel z wczesnego wejścia wymaga poprawnego PIN-u', async () => {
    await render(<App />); await click('Panel rodzica');
    await act(async () => { await new Promise((r) => setTimeout(r, 20)); });
    for (const digit of '123456') await click(digit);
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Zatwierdź"]')!.click());
    expect(host.querySelector('.parent-layout')).not.toBeNull();
    expect(host.querySelector('h1')?.textContent).toBe('Postępy: Odkrywca');
  });
  it('historia pokazuje oceny, a szczegóły przerwanego sprawdzianu nie nadają oceny', async () => {
    await render(<Home section="progress" />);
    await click('Sprawdziany i kartkówki');
    const incomplete = [...host.querySelectorAll<HTMLButtonElement>('.history-entry')].find((el) => el.textContent?.includes('Niedokończone'))!;
    expect(incomplete).toBeDefined();
    expect(host.textContent).toContain('Ocena 4');
    await act(async () => incomplete.click());
    const dialog = host.querySelector('[role="dialog"]')!;
    expect(dialog.textContent).toContain('Niedokończony sprawdzian nie dostaje oceny');
    expect(dialog.querySelector('.grade-num')).toBeNull();
    expect(dialog.textContent).toContain('Zobacz, co warto poprawić');
  });
  it('odbiorcy kartkówki obejmują tylko wybraną klasę', async () => {
    await render(<ParentPanel pin="123456" onExit={vi.fn()} />);
    const select = host.querySelector<HTMLSelectElement>('[aria-label="Uczeń"]')!;
    await act(async () => { select.value = 'demo-badaczka'; select.dispatchEvent(new Event('change', { bubbles: true })); });
    await click('Plan i sprawdziany'); await click('Zadaj kartkówkę');
    const fieldset = host.querySelector('.quiz-recipients')!;
    expect(fieldset.textContent).toContain('Badaczka'); expect(fieldset.textContent).toContain('Koleżanka');
    expect(fieldset.textContent).not.toContain('Odkrywca');
    expect(fieldset.querySelectorAll('input:checked')).toHaveLength(1);
    await click('Wybierz całą klasę (2)');
    expect(fieldset.querySelectorAll('input:checked')).toHaveLength(2);
    await act(async () => { fieldset.querySelectorAll<HTMLInputElement>('input').forEach((input) => input.click()); });
    expect(button('Wybierz odbiorców').disabled).toBe(true);
  });
  it('historia nie pokazuje wyników drugiego dziecka', async () => {
    await render(<Home section="progress" />); await click('Historia nauki');
    const count = host.querySelectorAll('.history-entry').length;
    expect(count).toBe(store.list('session').filter((s) => s.profileId === context.profile.id).length);
  });
});

 it('logowanie do rodzica nie omija uwierzytelnienia konta mimo lokalnych profili', async () => {
   const previous = store.state;
   const signIn = vi.spyOn(store, 'signIn').mockRejectedValue(new Error('Błędne hasło'));
   try {
     store.state = { ...previous, cloud: true, joined: true, auth: { status: 'signedOut' } };
     await render(<App />);
     const form = host.querySelector('form')!;
     const submitter = button('Zaloguj do panelu rodzica');
     await act(async () => { form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true, submitter })); });
     expect(signIn).toHaveBeenCalledOnce();
     expect(host.textContent).toContain('Błędne hasło');
     expect(host.querySelector('.pin-pad, .parent-layout')).toBeNull();
   } finally { store.state = previous; signIn.mockRestore(); }
 });
