import type { Page } from '@playwright/test';
import { divisionInputs, divisionLayout } from '../src/longdiv';
import { multiplicationLayout } from '../src/longmul';
import { expect, test } from './fixtures';

const shots = process.env.SHOTS_DIR;

async function snap(page: Page, name: string, fullPage = false) {
  if (shots) await page.screenshot({ path: `${shots}/${test.info().project.name}-${name}.png`, fullPage });
}

async function onboard(page: Page, name: string, grade: number) {
  await page.goto('/');
  await page.getByPlaceholder('Imię').fill(name);
  await page.getByRole('group', { name: 'Klasa' }).getByRole('button', { name: String(grade), exact: true }).click();
  await page.getByRole('button', { name: 'Zaczynamy!' }).click();
  await expect(page.getByText(`Cześć, ${name}!`)).toBeVisible();
}

async function parentLogin(page: Page) {
  await page.getByRole('button', { name: 'Panel rodzica' }).click();
  for (let k = 0; k < 2; k++) {
    for (const d of '123456') await page.getByRole('button', { name: d, exact: true }).click();
    await page.getByRole('button', { name: 'Zatwierdź' }).click();
  }
  await expect(page.getByRole('heading', { name: 'Postępy' })).toBeVisible();
}

/** Odpowiada na bieżące zadanie „jakkolwiek”. */
async function answerAny(page: Page) {
  if (await page.locator('.practice .opt').count()) {
    await page.locator('.practice .opt:not([disabled])').first().click();
  } else if (await page.locator('.word').count()) {
    await page.locator('.word').first().click();
  } else if (await page.locator('.token').count()) {
    while (await page.locator('.bank .token').count()) {
      await page.locator('.bank .token').first().click();
      await page.locator('.basket').first().click();
      await page.waitForTimeout(60);
    }
  } else if (await page.locator('.gap').count()) {
    const gaps = page.locator('.gap');
    for (let i = 0; i < (await gaps.count()); i++) await gaps.nth(i).fill('7');
  } else if (await page.locator('.match-item').count()) {
    const left = page.locator('.match-col').nth(0).locator('.match-item');
    const right = page.locator('.match-col').nth(1).locator('.match-item');
    for (let i = 0; i < (await left.count()); i++) {
      await left.nth(i).click();
      await right.nth(i).click();
    }
  }
}

/** Sprawdzian / test na start: odpowiada i przechodzi dalej aż do podsumowania. */
async function runExam(page: Page, max = 30) {
  for (let i = 0; i < max; i++) {
    const counter = await page.locator('.pr-top .muted').innerText();
    await answerAny(page);
    await page.getByRole('button', { name: /^(Dalej|Zakończ sprawdzian)$/ }).click();
    await page.waitForFunction((c) => !!document.querySelector('.summary') || document.querySelector('.pr-top .muted')?.textContent !== c, counter);
    if (await page.locator('.summary').count()) return;
  }
  throw new Error('Sprawdzian się nie skończył');
}

/** Liczy wyrażenie z ekranu (· : + −), np. „7 · 8 =”. */
function evalText(t: string): number {
  const e = t.replace(/=.*$/, '').replace(/·/g, '*').replace(/:/g, '/').replace(/−/g, '-').replace(/\s+/g, '');
  return Function(`return (${e})`)() as number;
}

test('sprawdzian: ocena, lista błędów i poprawa', async ({ page }) => {
  await onboard(page, 'Kuba', 3);
  // Karta „Dzielenie pisemne” jest tylko w klasach, które mają słupki (od 4.) — trzecioklasista jej nie widzi.
  await expect(page.locator('.division-card')).toHaveCount(0);
  await page.locator('.subject-big', { hasText: 'Język polski' }).click();
  await snap(page, 'f01-subject-challenges', true);
  await page.getByRole('button', { name: /^Sprawdzian/ }).click();
  const dlg = page.getByRole('dialog', { name: 'Sprawdzian' });
  await dlg.getByRole('group', { name: 'Liczba pytań' }).getByRole('button', { name: '10', exact: true }).click();
  await snap(page, 'f02-test-setup');
  await dlg.getByRole('button', { name: /Zaczynam sprawdzian/ }).click();
  await expect(page.getByText('Pytanie 1 z 10')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Podpowiedź' })).toHaveCount(0);
  await snap(page, 'f03-test-question');
  await runExam(page);
  await expect(page.locator('.grade-num')).toBeVisible();
  await snap(page, 'f04-test-summary', true);
  if (await page.getByRole('button', { name: 'Popraw błędy' }).count()) {
    await page.getByRole('button', { name: 'Popraw błędy' }).click();
    await expect(page.getByRole('button', { name: 'Sprawdź' })).toBeVisible();
    await answerAny(page);
    await page.getByRole('button', { name: 'Sprawdź' }).click();
    await expect(page.locator('.pr-foot.good, .pr-foot.bad')).toBeVisible();
  }
});

test('dyktando ze ściągą i test na start', async ({ page }) => {
  await onboard(page, 'Kuba', 3);
  await expect(page.getByRole('heading', { name: 'Cel tygodnia' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Test na start' })).toBeVisible();
  await snap(page, 'f05-home', true);

  await page.locator('.subject-big', { hasText: 'Język polski' }).click();
  await page.getByRole('button', { name: /Dyktando: ó, rz, ż, ch, h/ }).first().click();
  const sheet = page.getByRole('dialog');
  await expect(sheet.getByText('Słuchaj uważnie całego zdania')).toBeVisible();
  await snap(page, 'f06-topic-guide');
  await sheet.getByRole('button', { name: /Graj!/ }).click();
  await expect(page.getByRole('button', { name: /Posłuchaj/ })).toBeVisible();
  // Bez polskiego głosu (przeglądarka testowa) luka pokazuje wyraz z ukrytymi literami.
  await expect(page.locator('.gap').first()).toHaveAttribute('placeholder', /_/);
  await snap(page, 'f07-dictation');
  await page.locator('.gap').first().fill('xyz');
  await page.getByRole('button', { name: 'Sprawdź' }).click();
  await expect(page.getByText(/^Poprawnie:/)).toBeVisible();
  await page.getByRole('button', { name: 'Ściąga' }).click();
  await expect(page.getByRole('dialog', { name: /Ściąga:/ })).toBeVisible();
  await snap(page, 'f08-guide-modal');
  await page.getByRole('button', { name: 'Wracam do zadania' }).click();
  await page.getByRole('button', { name: 'Zakończ ćwiczenie' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Skończ' }).click();
  await page.getByRole('button', { name: 'Wróć', exact: true }).click();

  await page.getByRole('button', { name: /^Język polski · \d+ pytań$/ }).click();
  await expect(page.getByText(/^Pytanie 1 z \d+$/)).toBeVisible();
  await runExam(page, 40);
  await expect(page.getByRole('heading', { name: 'Test na start — gotowe!' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Co już umiesz' })).toBeVisible();
  await snap(page, 'f09-diag-summary', true);
});

test('trening bez końca i Błyskawica', async ({ page }) => {
  await page.clock.install();
  await onboard(page, 'Kuba', 3);
  await page.locator('.subject-big', { hasText: 'Matematyka' }).click();
  await page.getByRole('button', { name: /Trening bez końca i mini-gry/ }).click();
  const row = page.locator('.gen-row', { hasText: 'Tabliczka mnożenia' });
  await snap(page, 'f10-gen-modal');
  await row.getByRole('button', { name: 'Trening' }).click();

  const text = (await page.locator('.fill-text').innerText()).trim();
  await page.locator('.gap').first().fill(String(evalText(text)));
  await page.getByRole('button', { name: 'Sprawdź' }).click();
  await expect(page.locator('.pr-foot.good')).toBeVisible();
  await page.getByRole('button', { name: 'Zakończ ćwiczenie' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Skończ' }).click();

  await page.getByRole('button', { name: /Trening bez końca i mini-gry/ }).click();
  await page.locator('.gen-row', { hasText: 'Tabliczka mnożenia' }).getByRole('button', { name: /Błyskawica/ }).click();
  await expect(page.getByText('Twój rekord:')).toBeVisible();
  await snap(page, 'f11-sprint-intro');
  await page.getByRole('button', { name: /Start!/ }).click();
  for (let i = 1; i <= 3; i++) {
    const q = (await page.locator('.sprint-q').innerText()).replace('?', '').trim();
    await page.keyboard.type(String(evalText(q)));
    await expect(page.locator('.combo')).toContainText(String(i));
    await page.clock.runFor(300);
  }
  await snap(page, 'f12-sprint-play');
  await page.keyboard.type('1');
  await page.keyboard.press('Enter');
  await expect(page.locator('.sprint-reveal')).toBeVisible();
  await page.clock.runFor(61_000);
  await expect(page.getByRole('heading', { name: /Nowy rekord!|Koniec czasu!/ })).toBeVisible();
  await expect(page.locator('.summary-stats').getByText('3', { exact: true }).first()).toBeVisible();
  await snap(page, 'f13-sprint-done');
});

test('rodzic: plan, raport tygodnia, pomysły na nagrody i wspólny cel', async ({ page }) => {
  await onboard(page, 'Kuba', 3);
  await parentLogin(page);
  // Wybór ucznia widać także przy jednej osobie — wiadomo, czyje to postępy i gdzie pojawią się kolejne dzieci.
  await expect(page.getByLabel('Uczeń')).toHaveValue(/.+/);
  await expect(page.getByLabel('Uczeń').locator('option')).toHaveText([/Kuba \(klasa 3\)/]);
  await expect(page.getByText('Na liście jest na razie jedna osoba.')).toBeVisible();

  await page.getByRole('button', { name: 'Plan i sprawdziany' }).click();
  await expect(page.getByLabel('Uczeń').locator('option')).toHaveText([/Kuba \(klasa 3\)/]);
  await page.getByPlaceholder('np. Sprawdzian z ułamków').fill('Sprawdzian z czasowników');
  const d = new Date();
  d.setDate(d.getDate() + 3);
  await page.getByLabel('Termin (opcjonalnie)').fill(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  await page.locator('.check-row', { hasText: 'Czasownik — co robi?' }).locator('input').check();
  await page.locator('.check-row', { hasText: 'Czasownik: przeszły, teraźniejszy, przyszły' }).locator('input').check();
  await page.getByRole('button', { name: 'Zapisz plan (2)' }).click();
  await expect(page.getByText('Zapisano plan: Kuba.')).toBeVisible();
  await snap(page, 'f14-parent-plan', true);

  await page.getByRole('button', { name: 'Postępy' }).click();
  await expect(page.getByRole('heading', { name: /^Ten tydzień/ })).toBeVisible();
  await page.getByRole('button', { name: 'Pokaż tekst' }).click();
  await expect(page.getByLabel('Tekst raportu')).toHaveValue(/Raport tygodniowy — Kuba \(klasa 3\)/);
  await snap(page, 'f15-parent-stats', true);

  await page.getByRole('button', { name: 'Nagrody' }).click();
  await page.locator('.idea', { hasText: 'Wybieram obiad na jutro' }).getByRole('button', { name: 'Dodaj' }).click();
  await expect(page.locator('.idea', { hasText: 'Wybieram obiad na jutro' }).getByRole('button', { name: 'Dodano' })).toBeVisible();
  await page.getByPlaceholder('np. Wyjście do kina całą rodziną').fill('Kino całą rodziną');
  await page.getByRole('button', { name: /Rozpocznij wspólny cel/ }).click();
  await expect(page.getByText('Kino całą rodziną')).toBeVisible();
  await snap(page, 'f16-parent-rewards', true);
  await page.getByRole('button', { name: 'Wyjdź' }).click();

  await expect(page.getByRole('heading', { name: 'Sprawdzian z czasowników' })).toBeVisible();
  await expect(page.getByText('termin za 3 dni')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Wspólny cel' })).toBeVisible();
  await snap(page, 'f17-home-plan', true);

  await page.getByRole('button', { name: /Sprawdzian próbny/ }).click();
  await expect(page.getByText('Pytanie 1 z 15')).toBeVisible();
  await page.getByRole('button', { name: 'Przerwij sprawdzian' }).click();
  await expect(page.getByRole('heading', { name: 'Wyspa Polskiego' })).toBeVisible();
  await page.getByRole('button', { name: 'Wróć', exact: true }).click();

  await page.getByRole('button', { name: /^Nagrody/ }).click();
  await expect(page.getByText('Zamrożenie serii')).toBeVisible();
  await expect(page.getByText('Wybieram obiad na jutro')).toBeVisible();
  await snap(page, 'f18-rewards', true);
});

test('mini-gry na ekranie startowym: Pary na czas', async ({ page }) => {
  await onboard(page, 'Kuba', 3);
  await expect(page.getByRole('heading', { name: 'Mini-gry' })).toBeVisible();
  await page.getByRole('button', { name: /Pary na czas: Tabliczka mnożenia/ }).click();
  await snap(page, 'f19-pairs-intro');
  await page.getByRole('button', { name: /Start!/ }).click();
  await expect(page.locator('.pair-tile')).toHaveCount(12);
  await snap(page, 'f20-pairs-play');
  const texts = await page.locator('.pair-tile').allInnerTexts();
  for (const t of texts.filter((x) => x.includes('·'))) {
    await page.locator('.pair-tile', { hasText: t }).first().click();
    await page.locator('.pair-tile:not(.done)').filter({ hasText: new RegExp(`^${evalText(t)}$`) }).first().click();
  }
  await expect(page.getByRole('heading', { name: /Nowy rekord!|Wszystkie pary!/ })).toBeVisible();
  await snap(page, 'f21-pairs-done');
  await page.getByRole('button', { name: 'Wróć do tematów' }).click();
  await expect(page.getByRole('heading', { name: 'Wyspa Matematyki' })).toBeVisible();
  await page.getByRole('button', { name: 'Wróć', exact: true }).click();
  await page.getByRole('button', { name: /Pary na czas: Język polski/ }).click();
  await page.getByRole('button', { name: /Start!/ }).click();
  await expect(page.locator('.pair-tile')).toHaveCount(12);
  await snap(page, 'f22-pairs-polish');
});

test('wybór wyglądu pokazuje podgląd każdego motywu', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.tp')).toHaveCount(6);
  await snap(page, 'f23-onboarding-themes', true);
  await page.getByPlaceholder('Imię').fill('Kuba');
  await page.getByRole('group', { name: 'Klasa' }).getByRole('button', { name: '3', exact: true }).click();
  await page.getByRole('button', { name: 'Zaczynamy!' }).click();
  await page.getByRole('button', { name: 'Wygląd' }).click();
  const dlg = page.getByRole('dialog', { name: 'Wygląd i bohater' });
  await expect(dlg.locator('.tp')).toHaveCount(6);
  await page.waitForTimeout(400);
  await snap(page, 'f24-theme-picker', true);
  // Bohatera dziecko zmienia samo — w tym samym oknie co wygląd, bez zamykania okna.
  await expect(dlg.getByRole('button', { name: 'Bohater: lis', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await dlg.getByRole('button', { name: 'Bohater: pilot', exact: true }).click();
  await expect(dlg.getByRole('button', { name: 'Bohater: pilot', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.topbar .avatar')).toHaveText('👨‍✈️');
  // Płatnych bohaterów tu nie ma — po nich idzie się do sklepu.
  await expect(dlg.getByRole('button', { name: 'Bohater: smok' })).toHaveCount(0);
  await expect(dlg.getByRole('button', { name: 'Więcej bohaterów w sklepie' })).toBeVisible();
  await dlg.getByRole('button', { name: /Pixel Quest/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'pixel');
  // Nowe motywy: Kosmos (mapa-galaktyka) i Wyścigi (trasa z bolidem).
  await page.getByRole('button', { name: 'Wygląd' }).click();
  await page.getByRole('dialog').getByRole('button', { name: /Kosmos/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'kosmos');
  await page.locator('.subject-big', { hasText: 'Matematyka' }).click();
  await expect(page.getByRole('heading', { name: 'Galaktyka: Matematyka' })).toBeVisible();
  await page.getByRole('button', { name: 'Wygląd' }).click();
  await page.getByRole('dialog').getByRole('button', { name: /Wyścigi/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'wyscigi');
  await expect(page.getByRole('heading', { name: 'Trasa: Matematyka' })).toBeVisible();
});

test('moje błędy i mapa tabliczki mnożenia', async ({ page }) => {
  await onboard(page, 'Kuba', 3);
  await expect(page.getByText('Brak błędów do poprawy — super!')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tabliczka mnożenia' })).toBeVisible();

  // Mapa tabliczki: dwie dobre odpowiedzi i jedna zła
  await page.getByRole('button', { name: 'Zobacz mapę i ćwicz' }).click();
  await expect(page.getByRole('heading', { name: 'Tabliczka mnożenia' })).toBeVisible();
  await page.getByRole('button', { name: /Ćwicz najsłabsze/ }).click();
  for (let i = 0; i < 3; i++) {
    const text = (await page.locator('.fill-text').innerText()).trim();
    await page.locator('.gap').first().fill(i < 2 ? String(evalText(text)) : '1');
    await page.getByRole('button', { name: 'Sprawdź' }).click();
    await expect(page.locator(i < 2 ? '.pr-foot.good' : '.pr-foot.bad')).toBeVisible();
    await page.waitForTimeout(750);
    if (i < 2) await page.getByRole('button', { name: /^(Dalej|Zakończ)$/ }).click();
  }
  await page.getByRole('button', { name: 'Zakończ ćwiczenie' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Skończ' }).click();
  await expect(page.getByRole('heading', { name: 'Tabliczka mnożenia' })).toBeVisible();
  await expect(page.locator('.times-page .tg-cell.weak')).not.toHaveCount(0);
  await expect(page.locator('.times-page .tg-cell.learning')).not.toHaveCount(0);
  await snap(page, 'f25-times-map', true);
  await page.getByRole('button', { name: 'Wróć', exact: true }).click();

  // Błąd w temacie → „Moje błędy”
  await page.locator('.subject-big', { hasText: 'Język polski' }).click();
  await page.getByRole('button', { name: /Rzeczownik — kto\? co\?/ }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: /Graj!/ }).click();
  for (let i = 0; i < 12; i++) {
    if (await page.locator('.gap').count()) {
      for (const g of await page.locator('.gap').all()) await g.fill('xyz');
    } else if (await page.locator('.practice .opt').count()) {
      // ostatnia z odpowiedzi — przeważnie zła
      await page.locator('.practice .opt').last().click();
    } else {
      await answerAny(page);
    }
    await page.getByRole('button', { name: 'Sprawdź' }).click();
    await expect(page.locator('.pr-foot.good, .pr-foot.bad')).toBeVisible();
    if (await page.locator('.pr-foot.bad').count()) break;
    await page.waitForTimeout(750);
    await page.getByRole('button', { name: /^(Dalej|Zakończ)$/ }).click();
  }
  await page.getByRole('button', { name: 'Zakończ ćwiczenie' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Skończ' }).click();
  await page.getByRole('button', { name: 'Wróć', exact: true }).click();
  await expect(page.getByRole('button', { name: /Popraw moje błędy \(1\)/ })).toBeVisible();
  await snap(page, 'f26-home-mistakes', true);
  await page.getByRole('button', { name: /Popraw moje błędy/ }).click();
  await expect(page.locator('.pr-topic')).toContainText('Rzeczownik');
  await expect(page.getByText('1 / 1')).toBeVisible();
});

test('czytanie ze zrozumieniem: tekst nad pytaniami', async ({ page }) => {
  await onboard(page, 'Kuba', 3);
  await page.locator('.subject-big', { hasText: 'Język polski' }).click();
  await page.getByRole('button', { name: /Czytanie ze zrozumieniem/ }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: /Graj!/ }).click();
  await expect(page.locator('details.passage[open]')).toBeVisible();
  await expect(page.locator('.passage-title')).toHaveText(/Nowy kolega|Jeż w ogrodzie/);
  await snap(page, 'f27-reading', true);
  await answerAny(page);
  await page.getByRole('button', { name: 'Sprawdź' }).click();
  await page.waitForTimeout(750);
  await page.getByRole('button', { name: /^(Dalej|Zakończ)$/ }).click();
  // przy kolejnym pytaniu do tego samego tekstu tekst jest zwinięty, ale można go rozwinąć
  await expect(page.locator('details.passage:not([open])')).toBeVisible();
  await page.locator('.passage summary').click();
  await expect(page.locator('details.passage[open]')).toBeVisible();
});

test('plan ze zdjęcia zakresu (przez czat z Claude)', async ({ page }) => {
  await onboard(page, 'Kuba', 3);
  await parentLogin(page);
  await page.getByRole('button', { name: 'Plan i sprawdziany' }).click();
  await expect(page.getByRole('heading', { name: /Sprawdzian w szkole\? Zrób zdjęcie zakresu/ })).toBeVisible();
  await snap(page, 'f28-plan-photo', true);
  await page.getByLabel('Odpowiedź Claude z planem').fill(
    [
      'PLAN: Sprawdzian: części mowy',
      'ZAKRES: rzeczownik, czasownik i przysłówek',
      'ISTNIEJĄCE: b-rzeczownik, b-czasownik',
      'TYTUŁ: Przysłówek',
      'ZASADA: Przysłówek odpowiada na pytanie: jak?',
      'ŚCIĄGA:',
      'Przysłówek mówi, jak ktoś coś robi: szybko, cicho.',
      '```',
      'wybierz: Które słowo jest przysłówkiem? | *szybko | szybki | szybkość',
      'wybierz: Jaką częścią mowy jest wyróżnione słowo? >> Pies biegnie {szybko}. | *przysłówek | przymiotnik | czasownik',
      '```',
    ].join('\n'),
  );
  await page.getByRole('button', { name: 'Dalej: sprawdź plan' }).click();
  await expect(page.getByLabel('Nazwa planu')).toHaveValue('Sprawdzian: części mowy');
  await expect(page.locator('.plan-review .pill.good')).toHaveCount(2);
  await expect(page.getByText(/Nowy temat: Przysłówek/)).toBeVisible();
  const d = new Date();
  d.setDate(d.getDate() + 2);
  await page.getByLabel('Data sprawdzianu w planie').fill(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  await snap(page, 'f29-plan-review', true);
  await page.getByRole('button', { name: 'Zapisz plan' }).click();
  await expect(page.getByText(/gotowy: 3 tematy/)).toBeVisible();
  await page.getByRole('button', { name: 'Wyjdź' }).click();
  await expect(page.getByRole('heading', { name: 'Sprawdzian: części mowy' })).toBeVisible();
  await expect(page.locator('.plan-topic', { hasText: 'Przysłówek' })).toBeVisible();
  await expect(page.getByText('termin za 2 dni')).toBeVisible();
  await snap(page, 'f30-home-plan-photo', true);
});

test('angielski: słówka z wymową, podpowiedź z tłumaczeniem, klawisz apostrofu', async ({ page }) => {
  await onboard(page, 'Zosia', 5);
  await page.locator('.subject-big', { hasText: 'Angielski' }).click();
  await expect(page.getByRole('heading', { name: 'Wyspa Angielskiego' })).toBeVisible();
  await snap(page, 'f30-english-subject', true);

  await page.getByRole('button', { name: /To be: am, is, are/ }).first().click();
  const dlg = page.getByRole('dialog');
  // Ściągi w dwóch językach nie czytamy jednym głosem; słówka rozwija się stuknięciem.
  await dlg.locator('.words-details summary').click();
  await expect(dlg.locator('.words-details[open]')).toBeVisible();
  await expect(dlg.locator('.word-list li').first()).toContainText("I'm");
  await expect(dlg.getByRole('button', { name: 'Przeczytaj ściągę na głos' })).toHaveCount(0);
  await expect(dlg.getByRole('button', { name: "Posłuchaj: I'm", exact: true })).toBeVisible();
  await snap(page, 'f31-english-topic-words', true);
  await dlg.getByRole('button', { name: /ukryj tłumaczenia/ }).click();
  await expect(dlg.locator('.word-pl')).toHaveCount(0);
  await dlg.locator('.word-reveal').first().click();
  await expect(dlg.locator('.word-pl')).toHaveCount(1);
  await dlg.getByRole('button', { name: /Graj!/ }).click();

  let sawTranslation = false;
  let sawApostrophe = false;
  let sawGuideWords = false;
  for (let i = 0; i < 14 && !(sawTranslation && sawApostrophe && sawGuideWords); i++) {
    await expect(page.getByRole('button', { name: 'Sprawdź' })).toBeVisible();
    await page.getByRole('button', { name: 'Podpowiedź' }).click();
    await expect(page.locator('.hint-box')).toBeVisible();
    if (await page.locator('.hint-main').count()) {
      await expect(page.locator('.hint-main')).toContainText('Po polsku:');
      if (!sawTranslation) await snap(page, 'f32-english-hint', true);
      sawTranslation = true;
    }
    if (await page.locator('.gap').count()) {
      // Po angielsku zamiast polskich liter jest klawisz apostrofu.
      await expect(page.getByRole('button', { name: 'Wstaw ą' })).toHaveCount(0);
      await page.locator('.gap').first().click();
      await page.getByRole('button', { name: 'Wstaw apostrof' }).click();
      await expect(page.locator('.gap').first()).toHaveValue("'");
      if (!sawApostrophe) await snap(page, 'f33-english-apostrophe', true);
      sawApostrophe = true;
    }
    await answerAny(page);
    await page.getByRole('button', { name: 'Sprawdź' }).click();
    await page.waitForTimeout(750);
    if (!sawGuideWords && (await page.getByRole('button', { name: 'Ściąga' }).count())) {
      await page.getByRole('button', { name: 'Ściąga' }).click();
      const guide = page.getByRole('dialog');
      await guide.locator('.words-details summary').click();
      await expect(guide.locator('.word-list li').first()).toBeVisible();
      await guide.getByRole('button', { name: 'Wracam do zadania' }).click();
      sawGuideWords = true;
    }
    await page.getByRole('button', { name: /^(Dalej|Zakończ)$/ }).click();
    if (await page.locator('.summary').count()) break;
  }
  expect(sawTranslation).toBe(true);
  expect(sawApostrophe).toBe(true);
  expect(sawGuideWords).toBe(true);
});

test('angielski: czytanie ze słówkami z tekstu i plan potwierdzany sprawdzianem próbnym', async ({ page }) => {
  await onboard(page, 'Zosia', 5);
  await page.locator('.subject-big', { hasText: 'Angielski' }).click();
  await page.getByRole('button', { name: /Czytanie po angielsku/ }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: /Graj!/ }).click();
  await expect(page.locator('details.passage[open]')).toBeVisible();
  await page.locator('.passage-words summary').click();
  await expect(page.locator('.passage-words .word-list li').first()).toBeVisible();
  await snap(page, 'f34-english-reading', true);
  await page.getByRole('button', { name: 'Zakończ ćwiczenie' }).click();
  await expect(page.getByRole('heading', { name: 'Wyspa Angielskiego' })).toBeVisible();
  await page.getByRole('button', { name: 'Wróć', exact: true }).click();

  await parentLogin(page);
  await page.getByRole('button', { name: 'Plan i sprawdziany' }).click();
  await page.getByPlaceholder('np. Sprawdzian z ułamków').fill('Sprawdzian: Unit 0');
  // Cały dział jednym stuknięciem: wszystkie tematy z angielskiego.
  await page.getByRole('group', { name: 'Angielski' }).getByRole('button', { name: 'Zaznacz wszystkie (9)' }).click();
  await expect(page.locator('.check-row', { hasText: 'Have got' }).locator('input')).toBeChecked();
  await page.getByRole('button', { name: 'Zapisz plan (9)' }).click();
  await expect(page.getByText('Opanowanie materiału jeszcze niepotwierdzone.')).toBeVisible();
  await snap(page, 'f35-english-parent-plan', true);
  await page.getByRole('button', { name: 'Wyjdź' }).click();

  await expect(page.getByRole('heading', { name: 'Sprawdzian: Unit 0' })).toBeVisible();
  await expect(page.locator('.plan-check')).toContainText('Ocena 5 lub 6 potwierdzi');
  await snap(page, 'f36-english-home-plan', true);
  await page.getByRole('button', { name: /Sprawdzian próbny/ }).click();
  // Po 3 pytania z każdego z 9 tematów.
  await expect(page.getByText('Pytanie 1 z 27')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Podpowiedź' })).toHaveCount(0);
  await runExam(page);
  await expect(page.locator('.grade-num')).toBeVisible();
  await snap(page, 'f37-english-exam-summary', true);
  await page.locator('.summary .btn-primary').last().click();
  await expect(page.getByRole('heading', { name: 'Wyspa Angielskiego' })).toBeVisible();
  await page.getByRole('button', { name: 'Wróć', exact: true }).click();
  // Wynik sprawdzianu próbnego widać na karcie planu (ocena 5 lub 6 = materiał opanowany).
  await expect(page.locator('.plan-check, .plan-done')).toContainText(/Sprawdzian próbny|sprawdzian próbny/);
  await expect(page.locator('.plan-check, .plan-done')).toContainText(/\d+\/27/);

  // Powtórka z własnych błędów: zadania z planu, w których dziecko pomyliło się na sprawdzianie.
  await snap(page, 'f38-plan-after-exam', true);
  await page.getByRole('button', { name: /Popraw swoje błędy \(\d+\)/ }).click();
  await expect(page.getByRole('button', { name: 'Sprawdź' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Podpowiedź' })).toBeVisible();
});

test('rozdziały: plansza angielskiego pokazuje Unit 0, sprawdzian jest z rozdziału', async ({ page }) => {
  await onboard(page, 'Zosia', 5);
  await page.locator('.subject-big', { hasText: 'Angielski' }).click();
  const chips = page.getByRole('group', { name: 'Rozdział' });
  await expect(chips.getByRole('button', { name: /Unit 0/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(chips.getByRole('button', { name: /Unit 0/ })).toContainText('0/9');
  await snap(page, 'f40-english-units', true);
  await page.getByRole('button', { name: /^Sprawdzian: Unit 0/ }).click();
  await expect(page.getByRole('dialog', { name: 'Sprawdzian' }).locator('.check-row')).toHaveCount(9);
  await page.keyboard.press('Escape');
  // Przedmioty bez rozdziałów wyglądają jak dotąd.
  await page.getByRole('button', { name: 'Wróć', exact: true }).click();
  await page.locator('.subject-big', { hasText: 'Matematyka' }).click();
  await expect(page.getByRole('group', { name: 'Rozdział' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Sprawdzian/ })).toBeVisible();

  // W panelu rodzica rozdział widać przy temacie i w planie.
  await page.getByRole('button', { name: 'Wróć', exact: true }).click();
  await parentLogin(page);
  await page.getByRole('button', { name: 'Plan i sprawdziany' }).click();
  await expect(page.locator('.unit-group-head', { hasText: 'Unit 0' })).toBeVisible();
  await page.getByRole('button', { name: 'Tematy' }).click();
  await expect(page.locator('tr', { hasText: 'Have got' }).first()).toContainText('Unit 0');
});

test('kartkówka od rodzica: zadanie, napisanie i wynik w panelu rodzica', async ({ page }) => {
  await onboard(page, 'Zosia', 5);
  await parentLogin(page);
  await page.getByRole('button', { name: 'Plan i sprawdziany' }).click();
  await expect(page.getByText('Nie ma zadanych kartkówek.')).toBeVisible();
  await page.getByRole('button', { name: 'Zadaj kartkówkę' }).click();
  const form = page.locator('.quiz-form');
  await form.getByPlaceholder('np. Have got i can').fill('Have got na piątek');
  await form.getByRole('group', { name: 'Liczba pytań w kartkówce' }).getByRole('button', { name: '5', exact: true }).click();
  await form.locator('.check-row', { hasText: 'Have got' }).locator('input').check();
  await snap(page, 'f41-quiz-form', true);
  await form.getByRole('button', { name: 'Zadaj kartkówkę (5 pytań)' }).click();
  await expect(page.getByText('czeka na napisanie')).toBeVisible();
  await page.getByRole('button', { name: 'Wyjdź' }).click();

  const card = page.getByRole('region', { name: 'Kartkówki od rodzica' });
  await expect(card).toContainText('Have got na piątek');
  await expect(card).toContainText('5 pytań bez podpowiedzi');
  await snap(page, 'f42-quiz-home', true);
  await card.getByRole('button', { name: /Piszę kartkówkę/ }).click();
  await expect(page.getByText('Pytanie 1 z 5')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Podpowiedź' })).toHaveCount(0);
  await runExam(page);
  await expect(page.locator('.grade-num')).toBeVisible();
  await page.locator('.summary .btn-primary').last().click();
  await page.getByRole('button', { name: 'Wróć', exact: true }).click();
  // Kartkówkę pisze się raz: na ekranie startowym zostaje wynik.
  await expect(card).toContainText(/Napisana: \d\/5/);
  await expect(card.getByRole('button', { name: /Piszę kartkówkę/ })).toHaveCount(0);
  // Dziecko może wrócić do swoich błędów: pytanie, własna odpowiedź, poprawna odpowiedź i wyjaśnienie.
  const good = Number((await card.innerText()).match(/Napisana: (\d)\/5/)![1]);
  const wrong = 5 - good;
  expect(wrong).toBeGreaterThan(0);
  await card.getByRole('button', { name: `Zobacz błędy (${wrong})` }).click();
  const review = page.getByRole('dialog', { name: 'Błędy: Have got na piątek' });
  await expect(review.locator('.mistake')).toHaveCount(wrong);
  await expect(review.locator('.mistake').first()).toContainText('Twoja odpowiedź');
  await expect(review.locator('.mistake').first()).toContainText('Poprawnie');
  await expect(review.locator('.mistake-why').first()).toBeVisible();
  await expect(review.getByRole('button', { name: `Popraw błędy (${wrong})` })).toBeVisible();
  await snap(page, 'f42b-quiz-review');
  await review.getByRole('button', { name: 'Zamknij' }).click();

  await page.getByRole('button', { name: 'Panel rodzica' }).click();
  for (const d of '123456') await page.getByRole('button', { name: d, exact: true }).click();
  await page.getByRole('button', { name: 'Zatwierdź' }).click();
  await page.getByRole('button', { name: 'Plan i sprawdziany' }).click();
  const row = page.locator('tr', { hasText: 'Have got na piątek' });
  await expect(row).toContainText(/\d\/5/);
  await expect(row).not.toContainText('czeka na napisanie');
  await expect(page.locator('tr', { hasText: 'Kartkówka' }).last()).toContainText('Have got');
  await snap(page, 'f43-quiz-result', true);

  // Rodzic widzi, w których pytaniach były błędy, i jednym przyciskiem zadaje kartkówkę właśnie z nich.
  const quizzes = page.locator('section', { hasText: 'Kartkówki: Zosia' });
  await expect(quizzes.getByRole('button', { name: `Kartkówka z błędów (${wrong})` })).toBeVisible();
  await row.getByRole('button', { name: `Błędy (${wrong})` }).click();
  const detail = quizzes.locator('.detail-box');
  await expect(detail.locator('.mistake')).toHaveCount(wrong);
  await expect(detail.locator('.mistake').first()).toContainText('Odpowiedź');
  await snap(page, 'f44-quiz-mistakes-parent', true);
  await detail.getByRole('button', { name: `Zadaj kartkówkę z tych błędów (${wrong})` }).click();
  await expect(quizzes.getByRole('status')).toContainText('Zadano kartkówkę');
  const retake = quizzes.locator('tr', { hasText: 'Poprawa: Have got na piątek' });
  await expect(retake).toContainText('czeka na napisanie');
  await expect(retake).toContainText('wybrane zadania z:');
  // W historii sprawdzianów też da się rozwinąć błędy.
  const history = page.locator('section', { hasText: 'Sprawdziany i testy na start' });
  await history.getByRole('button', { name: `Pokaż (${wrong})` }).click();
  await expect(history.locator('.detail-box .mistake')).toHaveCount(wrong);
  await page.getByRole('button', { name: 'Wyjdź' }).click();

  // Dziecko dostaje kartkówkę dokładnie z tych pytań.
  const again = card.locator('.quiz-row', { hasText: 'Poprawa: Have got na piątek' });
  await expect(again).toContainText(new RegExp(`${wrong} pyta(nie|nia|ń) bez podpowiedzi`));
  await again.getByRole('button', { name: /Piszę kartkówkę/ }).click();
  await expect(page.getByText(`Pytanie 1 z ${wrong}`)).toBeVisible();
});

test('PIN rodzica: nowy ma 6 cyfr, stary 4-cyfrowy wpuszcza raz i każe ustawić nowy', async ({ page }) => {
  await onboard(page, 'Kuba', 3);
  // Urządzenie ze starszej wersji aplikacji: w ustawieniach jest 4-cyfrowy PIN (1234).
  await page.evaluate(async () => {
    const salt = 'sol';
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:1234`));
    const hash = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
    await new Promise<void>((resolve, reject) => {
      const open = indexedDB.open('wyspy-wiedzy');
      open.onsuccess = () => {
        const tx = open.result.transaction('docs', 'readwrite');
        tx.objectStore('docs').put({ k: 'settings:family', kind: 'settings', id: 'family', data: { id: 'family', parentPinHash: hash, pinSalt: salt, updatedAt: new Date().toISOString() } });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
      open.onerror = () => reject(open.error);
    });
  });
  await page.reload();
  await page.getByRole('button', { name: 'Panel rodzica' }).click();
  for (const d of '1234') await page.getByRole('button', { name: d, exact: true }).click();
  await page.getByRole('button', { name: 'Zatwierdź' }).click();
  await expect(page.getByRole('heading', { name: 'Ustaw nowy PIN (6 cyfr)' })).toBeVisible();
  // Krótszego PIN-u nie da się już ustawić.
  for (const d of '6543') await page.getByRole('button', { name: d, exact: true }).click();
  await expect(page.getByRole('button', { name: 'Zatwierdź' })).toBeDisabled();
  for (const d of '21') await page.getByRole('button', { name: d, exact: true }).click();
  await page.getByRole('button', { name: 'Zatwierdź' }).click();
  await expect(page.getByRole('heading', { name: 'Powtórz PIN' })).toBeVisible();
  for (const d of '654321') await page.getByRole('button', { name: d, exact: true }).click();
  await page.getByRole('button', { name: 'Zatwierdź' }).click();
  await expect(page.getByRole('heading', { name: 'Postępy' })).toBeVisible();

  // Od teraz obowiązuje tylko nowy PIN.
  await page.getByRole('button', { name: 'Wyjdź' }).click();
  await page.getByRole('button', { name: 'Panel rodzica' }).click();
  for (const d of '1234') await page.getByRole('button', { name: d, exact: true }).click();
  await expect(page.getByRole('button', { name: 'Zatwierdź' })).toBeDisabled();
  for (const d of '56') await page.getByRole('button', { name: d, exact: true }).click();
  await page.getByRole('button', { name: 'Zatwierdź' }).click();
  await expect(page.getByText('Zły PIN.')).toBeVisible();
  for (const d of '654321') await page.getByRole('button', { name: d, exact: true }).click();
  await page.getByRole('button', { name: 'Zatwierdź' }).click();
  await expect(page.getByRole('heading', { name: 'Postępy' })).toBeVisible();
  // W ustawieniach też tylko 6 cyfr.
  await page.getByRole('button', { name: 'Ustawienia' }).click();
  await page.getByLabel('Nowy PIN').fill('12345');
  await expect(page.getByRole('button', { name: 'Zmień PIN' })).toBeDisabled();
  await page.getByLabel('Nowy PIN').fill('123456');
  await expect(page.getByRole('button', { name: 'Zmień PIN' })).toBeEnabled();
});

test('tryb nauki: karty lekcji, pytania kontrolne, powtórka rozdziału i kroki na karcie planu', async ({ page }) => {
  await onboard(page, 'Zosia', 5);
  await page.locator('.subject-big', { hasText: 'Angielski' }).click();
  await page.getByRole('button', { name: /To be: am, is, are/ }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: /Nauka: poznaj temat krok po kroku/ }).click();

  // Karty: każda na jeden ekran, przechodzi się „Dalej”.
  const title = page.locator('.pr-prompt h1');
  const dalej = page.getByRole('button', { name: 'Dalej' });
  await expect(title).toHaveText('Najważniejsze');
  await expect(page.locator('.lesson-list li')).toHaveCount(3);
  await snap(page, 'f50-lesson-key');
  await dalej.click();
  await expect(title).toHaveText('Krok po kroku');
  await snap(page, 'f51-lesson-steps');
  await dalej.click();
  await expect(title).toHaveText('Przykład');
  await expect(page.locator('.lesson-example .result')).toContainText('Czyli:');
  await snap(page, 'f52-lesson-example');
  await dalej.click();
  await expect(title).toHaveText('Tak — nie tak');
  await expect(page.getByText('Część 1 z 2')).toBeVisible();
  await expect(page.locator('.lesson-pair')).toHaveCount(2);
  await expect(page.locator('.lp-good').first()).toHaveText('Yes, he is.');
  await expect(page.locator('.lp-bad').first()).toHaveText("Yes, he's.");
  await expect(page.locator('.lp-why').first()).toContainText(/^Bo skrót 's zapowiada/);
  await snap(page, 'f53-lesson-pairs');
  await page.getByRole('button', { name: 'Wstecz' }).click();
  await expect(title).toHaveText('Przykład');
  await dalej.click();
  await dalej.click();
  await expect(page.getByText('Część 2 z 2')).toBeVisible();
  await dalej.click();
  await expect(title).toHaveText('Jak to zapamiętać');
  await snap(page, 'f54-lesson-trick');
  await dalej.click();

  // Pytania kontrolne: wyjaśnienie od razu po odpowiedzi.
  await expect(page.getByText('Sprawdź się: pytanie 1 z 3')).toBeVisible();
  await page.locator('.opt', { hasText: /^are$/ }).click();
  await page.getByRole('button', { name: 'Sprawdź' }).click();
  await expect(page.locator('.pr-foot.good')).toContainText('My friends → they → are.');
  await dalej.click();
  await page.locator('.opt', { hasText: "Yes, she's." }).click();
  await page.getByRole('button', { name: 'Sprawdź' }).click();
  await expect(page.locator('.pr-foot.bad')).toContainText('Poprawnie: Yes, she is.');
  await snap(page, 'f55-lesson-check');
  await dalej.click();
  await page.locator('.gap').fill('aren’t');
  await page.getByRole('button', { name: 'Sprawdź' }).click();
  await expect(page.locator('.pr-foot.good')).toBeVisible();
  await page.getByRole('button', { name: 'Kończę lekcję' }).click();

  await expect(page.getByRole('heading', { name: 'Lekcja przeczytana!' })).toBeVisible();
  await expect(page.getByText('Pytania kontrolne: 2 z 3')).toBeVisible();
  await expect(page.getByText('+5 muszelek za pierwszą lekcję z tego tematu')).toBeVisible();
  await snap(page, 'f56-lesson-done');
  await page.getByRole('button', { name: 'Wróć', exact: true }).click();

  // Lekcję można powtórzyć; pytania kontrolne nie zmieniają poziomu tematu.
  await page.getByRole('button', { name: /To be: am, is, are/ }).first().click();
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Powtórz lekcję' })).toBeVisible();
  await expect(page.getByRole('dialog').locator('.level-chip')).toHaveText('Nowy');
  await page.keyboard.press('Escape');

  // Powtórka rozdziału: najważniejsze rzeczy ze wszystkich tematów na jednej stronie.
  await page.getByRole('button', { name: /^Powtórka: Unit 0/ }).click();
  await expect(page.getByRole('heading', { name: 'Powtórka: Unit 0' })).toBeVisible();
  await expect(page.locator('.sheet-topic')).toHaveCount(9);
  await expect(page.locator('.sheet-topic').first().getByRole('button', { name: 'Powtórz lekcję' })).toBeVisible();
  await expect(page.locator('.sheet-topic').nth(1).getByRole('button', { name: 'Cała lekcja' })).toBeVisible();
  await snap(page, 'f57-review-sheet', true);
  await page.getByRole('button', { name: 'Wróć', exact: true }).click();
  await page.getByRole('button', { name: 'Wróć', exact: true }).click();

  // Karta planu prowadzi po kolei: Nauka → Ćwiczenia → Sprawdzian próbny.
  await parentLogin(page);
  await page.getByRole('button', { name: 'Plan i sprawdziany' }).click();
  await page.getByPlaceholder('np. Sprawdzian z ułamków').fill('Sprawdzian: Unit 0');
  await page.getByRole('group', { name: 'Angielski' }).getByRole('button', { name: 'Zaznacz wszystkie (9)' }).click();
  await page.getByRole('button', { name: 'Zapisz plan (9)' }).click();
  await page.getByRole('button', { name: 'Postępy' }).click();
  await expect(page.locator('tr', { hasText: 'Nauka (lekcja)' })).toContainText('To be: am, is, are');
  await page.getByRole('button', { name: 'Wyjdź' }).click();

  const steps = page.getByRole('list', { name: 'Kolejność nauki' }).getByRole('listitem');
  await expect(steps).toHaveCount(3);
  await expect(steps.nth(0)).toContainText('Nauka');
  await expect(steps.nth(0)).toContainText('1/9 lekcji');
  await expect(steps.nth(0)).toHaveClass(/now/);
  await expect(steps.nth(1)).toContainText('0/9 na poziomie „Biegły”');
  await expect(steps.nth(2)).toContainText('27 pytań');
  await snap(page, 'f58-plan-steps', true);
  await page.getByRole('button', { name: 'Powtórka przed sprawdzianem' }).click();
  await expect(page.getByRole('heading', { name: 'Powtórka przed sprawdzianem: Sprawdzian: Unit 0' })).toBeVisible();
  await page.getByRole('button', { name: 'Wróć', exact: true }).click();
  // Następna lekcja z planu to pierwszy temat, którego lekcji dziecko jeszcze nie czytało.
  await page.getByRole('button', { name: /^Nauka: Kraje i narodowości/ }).click();
  await expect(page.locator('.pr-topic')).toHaveText('Nauka · Kraje i narodowości');
  await page.getByRole('button', { name: 'Zamknij lekcję' }).click();
  await expect(page.getByText('Cześć, Zosia!')).toBeVisible();
});


test('dzielenie pisemne: karta na starcie, słupki z kratkami bez reszty i z resztą, lekcja krok po kroku', async ({ page }) => {
  const phone = test.info().project.name === 'phone';
  if (phone) await page.setViewportSize({ width: 360, height: 740 });
  await onboard(page, 'Ola', 5);
  const keys = page.getByRole('group', { name: 'Cyfry do wpisania' });
  const grid = page.getByRole('group', { name: /Słupek do uzupełnienia/ });
  const quit = async () => {
    await page.getByRole('button', { name: 'Zakończ ćwiczenie' }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Skończ' }).click();
  };
  const currentDivision = async () => {
    const [, a, b] = (await grid.getAttribute('aria-label'))!.match(/(\d+) : (\d+)/)!;
    return { a: Number(a), b: Number(b), inputs: divisionInputs(divisionLayout(Number(a), Number(b))) };
  };

  // Ekran startowy: karta „Dzielenie pisemne” nad przedmiotami — cztery rodzaje słupków pod ręką.
  const card = page.locator('.division-card');
  await expect(card.getByRole('heading', { name: 'Dzielenie pisemne' })).toBeVisible();
  await expect(card.getByRole('button', { name: /^Dzielenie pisemne przez liczbę/ })).toHaveCount(4);
  const cardBox = (await card.boundingBox())!;
  const subjectsBox = (await page.locator('.subject-grid').boundingBox())!;
  expect(cardBox.y).toBeLessThan(subjectsBox.y);
  await card.scrollIntoViewIfNeeded();
  await snap(page, 'f39-division-card');

  // Bez reszty, dzielnik jednocyfrowy: od razu słupek z kratkami, seria 5 przykładów.
  await card.getByRole('button', { name: 'Dzielenie pisemne przez liczbę jednocyfrową bez reszty' }).click();
  await expect(page.locator('.pr-prompt h1')).toHaveText('Oblicz pisemnie. Wpisz cyfry w kratki.');
  await expect(page.getByText('1 / 5')).toBeVisible();
  const first = await currentDivision();
  expect(first.b).toBeLessThan(10);
  expect(first.a % first.b).toBe(0);
  await expect(page.locator('.ldiv-in')).toHaveCount(first.inputs.length);
  await expect(page.getByRole('button', { name: 'Sprawdź' })).toBeDisabled();
  if (phone) {
    // Cały słupek i klawiatura mieszczą się nad stopką.
    const foot = (await page.locator('.pr-foot').boundingBox())!;
    const kb = (await keys.boundingBox())!;
    expect(kb.y + kb.height).toBeLessThanOrEqual(foot.y + 1);
  }
  // Same jedynki: błędne kratki na czerwono, pod spodem poprawny słupek, który można przejść krok po kroku.
  for (let k = 0; k < first.inputs.length; k++) await keys.getByRole('button', { name: '1', exact: true }).click();
  await snap(page, 'f41-division-grid');
  await page.getByRole('button', { name: 'Sprawdź' }).click();
  await expect(page.locator('.pr-foot.bad')).toBeVisible();
  expect(await page.locator('.ldiv-in.bad').count()).toBeGreaterThan(0);
  const sol = page.getByRole('region', { name: 'Rozwiązanie w słupku' });
  await expect(sol.getByRole('img', { name: `Dzielenie pisemne: ${first.a} podzielić przez ${first.b}` })).toBeVisible();
  await sol.getByRole('button', { name: 'Pokaż krok po kroku' }).click();
  await expect(sol.getByText(/^Krok 1 z \d+/)).toBeVisible();
  await snap(page, 'f41-division-solution', true);
  // Trening zaczęty na starcie wraca na start — karta jest znowu pod ręką.
  await quit();
  await expect(card).toBeVisible();

  // Z resztą, dzielnik dwucyfrowy: wpisujemy poprawne cyfry w kolejności pisania; reszta zostaje na dole.
  await card.getByRole('button', { name: 'Dzielenie pisemne przez liczbę dwucyfrową z resztą' }).click();
  await expect(page.locator('.pr-prompt h1')).toContainText('na dole zostanie reszta');
  const second = await currentDivision();
  expect(second.b).toBeGreaterThanOrEqual(10);
  expect(second.a % second.b).toBeGreaterThan(0);
  await expect(page.locator('.ldiv-in')).toHaveCount(second.inputs.length);
  // Pomyłkę da się cofnąć klawiszem ⌫.
  await keys.getByRole('button', { name: second.inputs[0].ch === '9' ? '8' : '9', exact: true }).click();
  await keys.getByRole('button', { name: 'Usuń cyfrę' }).click();
  await keys.getByRole('button', { name: 'Usuń cyfrę' }).click();
  for (const c of second.inputs) await keys.getByRole('button', { name: c.ch, exact: true }).click();
  await snap(page, 'f42-division-grid-done');
  await page.getByRole('button', { name: 'Sprawdź' }).click();
  await expect(page.locator('.pr-foot.good')).toBeVisible();
  await expect(page.locator('.ldiv-in.ok')).toHaveCount(second.inputs.length);
  await expect(page.getByRole('region', { name: 'Rozwiązanie w słupku' })).toHaveCount(0);
  await quit();

  // Sprawdzenie mnożeniem pisemnym: też kratki, wpisywane od prawej strony.
  await card.getByRole('button', { name: 'Sprawdzenie: mnożenie pisemne' }).click();
  await expect(page.locator('.pr-prompt h1')).toContainText('Pomnóż pisemnie');
  const mulGrid = page.getByRole('group', { name: /Mnożenie pisemne do uzupełnienia/ });
  const [, x, y] = (await mulGrid.getAttribute('aria-label'))!.match(/(\d+) · (\d+)/)!;
  const mul = multiplicationLayout(Number(x), Number(y));
  await expect(page.locator('.ldiv-in')).toHaveCount(mul.inputs.length);
  // Najpierw z błędem w ostatniej kratce: czerwona kratka i gotowe mnożenie do porównania.
  for (const c of mul.inputs.slice(0, -1)) await keys.getByRole('button', { name: c.ch, exact: true }).click();
  await keys.getByRole('button', { name: mul.inputs[mul.inputs.length - 1].ch === '5' ? '6' : '5', exact: true }).click();
  await snap(page, 'f43-multiplication-grid');
  await page.getByRole('button', { name: 'Sprawdź' }).click();
  await expect(page.locator('.pr-foot.bad')).toBeVisible();
  await expect(page.locator('.ldiv-in.bad')).toHaveCount(1);
  await expect(page.getByRole('region', { name: 'Rozwiązanie mnożenia' }).getByRole('img', { name: `Mnożenie pisemne: ${x} razy ${y} równa się ${mul.product}` })).toBeVisible();
  await snap(page, 'f43-multiplication-solution', true);
  await quit();

  // Matematyka: zostały dwa tematy z dzieleniem pisemnym — bez reszty i z resztą; dawnych pytań i zadań z lukami już nie ma.
  await page.locator('.subject-big', { hasText: 'Matematyka' }).click();
  await expect(page.getByRole('button', { name: /Dzielenie pisemne przez liczbę/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Dzielenie pisemne z resztą/ }).first()).toBeVisible();
  await page.getByRole('button', { name: /Dzielenie pisemne bez reszty/ }).first().click();
  const sheet = page.getByRole('dialog');
  // Ściąga ma gotowy słupek 936 : 4.
  await expect(sheet.getByRole('img', { name: 'Dzielenie pisemne: 936 podzielić przez 4' })).toBeVisible();
  await sheet.getByRole('button', { name: /Nauka/ }).click();

  // Lekcja: najważniejsze → krok po kroku → słupek odsłaniany tym samym dużym przyciskiem.
  await page.getByRole('button', { name: /Dalej/ }).click();
  await page.getByRole('button', { name: /Dalej/ }).click();
  await expect(page.getByRole('heading', { name: 'Przykład krok po kroku' })).toBeVisible();
  await expect(page.getByText('936 : 4 · przykład 1 z 3')).toBeVisible();
  await expect(page.getByText('Krok 1 z 10')).toBeVisible();
  await expect(page.locator('.ldiv-quotient')).toHaveCount(0);
  await page.getByRole('button', { name: 'Następny krok' }).click();
  await expect(page.locator('.ldiv-text')).toContainText('Ile razy 4 mieści się w 9? 2 razy');
  await expect(page.locator('.ldiv-quotient')).toHaveText(['2']);
  if (phone) {
    // Na telefonie opis kroku i przyciski są widoczne bez przewijania, „Wstecz” i „Następny krok” stoją w jednym rzędzie.
    const back = (await page.getByRole('button', { name: 'Wstecz' }).boundingBox())!;
    const next = (await page.getByRole('button', { name: 'Następny krok' }).boundingBox())!;
    expect(Math.abs(back.y + back.height / 2 - (next.y + next.height / 2))).toBeLessThan(8);
    const text = (await page.locator('.ldiv-text').boundingBox())!;
    expect(text.y + text.height).toBeLessThan(next.y);
  }
  await page.getByRole('button', { name: 'Wstecz' }).click();
  await expect(page.getByText('Krok 1 z 10')).toBeVisible();
  for (let i = 0; i < 9; i++) await page.getByRole('button', { name: 'Następny krok' }).click();
  await expect(page.locator('.ldiv-quotient')).toHaveText(['2', '3', '4']);
  await expect(page.locator('.ldiv-text')).toContainText('Wynik: 936 : 4 = 234. Sprawdzenie: 234 · 4 = 936.');
  await snap(page, 'f40-division-lesson');
  // Po ostatnim kroku przycisk prowadzi do następnej karty (drugi przykład: 156 : 3).
  await page.getByRole('button', { name: /Dalej/ }).click();
  await expect(page.getByText('156 : 3 · przykład 2 z 3')).toBeVisible();
  await page.getByRole('button', { name: 'Następny krok' }).click();
  await expect(page.locator('.ldiv-text')).toContainText('bierzemy dwie cyfry: 15');
  await page.getByRole('button', { name: 'Zamknij lekcję' }).click();

  // Ćwiczenia tematu to same słupki z kratkami (temat „z resztą” — z resztą).
  await page.getByRole('button', { name: /Dzielenie pisemne z resztą/ }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: /Graj!/ }).click();
  await expect(page.locator('.pr-prompt h1')).toContainText('Oblicz pisemnie');
  const third = await currentDivision();
  expect(third.a % third.b).toBeGreaterThan(0);
  await expect(page.locator('.ldiv-in')).toHaveCount(third.inputs.length);
  await expect(page.locator('.gap')).toHaveCount(0);
  // Bez żadnej odpowiedzi wyjście nie pyta o potwierdzenie.
  await page.getByRole('button', { name: 'Zakończ ćwiczenie' }).click();

  // Wyzwania: to samo wejście co na starcie. W „Treningu bez końca” słupki nie mają gier na czas.
  await page.getByRole('button', { name: /^Dzielenie pisemne Słupki w kratkach/ }).click();
  const picker = page.getByRole('dialog');
  await expect(picker.getByRole('button', { name: /^Dzielenie pisemne przez liczbę/ })).toHaveCount(4);
  await snap(page, 'f39-division-challenge');
  await picker.getByRole('button', { name: 'Zamknij' }).click();
  await page.getByRole('button', { name: /Trening bez końca/ }).click();
  const rows = page.getByRole('dialog').locator('.gen-row', { hasText: 'Dzielenie pisemne' });
  await expect(rows).toHaveCount(4);
  await expect(rows.getByRole('button', { name: 'Trening' })).toHaveCount(4);
  await expect(rows.getByRole('button', { name: /Błyskawica|Pary/ })).toHaveCount(0);
});
