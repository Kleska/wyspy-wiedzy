import { expect, test, type Page } from '@playwright/test';

const shots = process.env.SHOTS_DIR;

async function snap(page: Page, name: string) {
  if (shots) await page.screenshot({ path: `${shots}/${test.info().project.name}-${name}.png`, fullPage: false });
}

/** Odpowiada na bieżące zadanie „jakkolwiek” (celem jest przejście przez wszystkie typy). */
async function answerAny(page: Page) {
  if (await page.locator('.opt').count()) {
    await page.locator('.opt:not([disabled])').first().click();
  } else if (await page.locator('.word').count()) {
    await page.locator('.word').first().click();
  } else if (await page.locator('.token').count()) {
    while (await page.locator('.bank .token').count()) {
      await page.locator('.bank .token').first().click();
      await page.locator('.basket').first().click();
      await page.waitForTimeout(80);
    }
  } else if (await page.locator('.gap').count()) {
    const gaps = page.locator('.gap');
    for (let i = 0; i < (await gaps.count()); i++) await gaps.nth(i).fill('abc');
  } else if (await page.locator('.match-item').count()) {
    const left = page.locator('.match-col').nth(0).locator('.match-item');
    const right = page.locator('.match-col').nth(1).locator('.match-item');
    const n = await left.count();
    for (let i = 0; i < n; i++) {
      await left.nth(i).click();
      await right.nth(i).click();
    }
  }
}

test('pełna ścieżka: profil → przedmiot → ćwiczenie → podsumowanie → nagrody → motywy → panel rodzica', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Witaj w Wyspach Wiedzy!' })).toBeVisible();
  await page.getByPlaceholder('Imię').fill('Kuba');
  await page.getByRole('group', { name: 'Klasa' }).getByRole('button', { name: '3', exact: true }).click();
  await snap(page, '01-onboarding');
  await page.getByRole('button', { name: 'Zaczynamy!' }).click();

  await expect(page.getByText('Cześć, Kuba!')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Co dziś ćwiczymy?' })).toBeVisible();
  await page.waitForTimeout(400);
  await snap(page, '02-start-wyspy');

  // Przedmiot → temat → ćwiczenie
  await page.getByRole('button', { name: /Język polski/ }).click();
  await expect(page.getByRole('heading', { name: 'Wyspa Polskiego' })).toBeVisible();
  await page.waitForTimeout(300);
  await snap(page, '02b-subject-wyspy');
  await page.getByRole('button', { name: /Rzeczownik — kto\? co\?/ }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await snap(page, '03-topic-sheet');
  await page.getByRole('dialog').getByRole('button', { name: /Graj!/ }).click();

  const seen = new Set<string>();
  for (let step = 0; step < 40; step++) {
    const cls = (await page.locator('.opt').count()) ? 'choice' : (await page.locator('.word').count()) ? 'tap' : (await page.locator('.token').count()) ? 'sort' : (await page.locator('.gap').count()) ? 'fill' : 'match';
    if (!seen.has(cls)) {
      seen.add(cls);
      await snap(page, `04-ex-${cls}`);
    }
    await answerAny(page);
    await page.getByRole('button', { name: 'Sprawdź' }).click();
    if (!seen.has(cls + '-fb')) {
      seen.add(cls + '-fb');
      await snap(page, `05-feedback-${cls}`);
    }
    await page.getByRole('button', { name: /^(Dalej|Zakończ)$/ }).click();
    await page.waitForFunction(() => document.querySelector('.summary') || document.querySelector('.pr-foot:not(.good):not(.bad)'));
    if (await page.locator('.summary').count()) break;
  }
  await expect(page.getByText('dobrze za pierwszym razem')).toBeVisible();
  await page.waitForTimeout(300);
  await snap(page, '06-summary');
  await page.getByRole('button', { name: 'Wróć do tematów' }).click();
  await expect(page.getByRole('heading', { name: 'Wyspa Polskiego' })).toBeVisible();
  await page.getByRole('button', { name: 'Wróć', exact: true }).click();

  // Nagrody
  await page.getByRole('button', { name: /^Nagrody/ }).click();
  await expect(page.getByRole('heading', { name: 'Nagrody', exact: true })).toBeVisible();
  await snap(page, '07-rewards');
  await page.getByRole('tab', { name: 'Odznaki' }).click();
  await expect(page.getByText('Pierwsza wyprawa')).toBeVisible();
  await page.getByRole('button', { name: 'Wróć', exact: true }).click();

  // Motywy: start + ekran przedmiotu
  for (const [name, file] of [
    ['Akademia Pilotów', 'piloci'],
    ['Pixel Quest', 'pixel'],
    ['Zeszyt', 'zeszyt'],
  ] as const) {
    await page.getByRole('button', { name: 'Wygląd' }).click();
    await page.getByRole('dialog').getByRole('button', { name: new RegExp(name) }).click();
    await page.waitForTimeout(500);
    await snap(page, `08-start-${file}`);
    await page.getByRole('button', { name: /Matematyka/ }).click();
    await page.waitForTimeout(300);
    await snap(page, `08b-subject-${file}`);
    await page.getByRole('button', { name: 'Wróć', exact: true }).click();
  }
  // Ćwiczenie w stylu Pixel
  await page.getByRole('button', { name: 'Wygląd' }).click();
  await page.getByRole('dialog').getByRole('button', { name: /Pixel Quest/ }).click();
  await page.getByRole('button', { name: /Język polski/ }).click();
  await page.getByRole('button', { name: /GRAJ/ }).last().click();
  if (await page.getByRole('dialog').count()) await page.getByRole('dialog').getByRole('button', { name: /GRAJ/ }).click();
  await answerAny(page);
  await page.getByRole('button', { name: 'Sprawdź' }).click();
  await snap(page, '09-pixel-exercise');
  await page.getByRole('button', { name: 'Zakończ ćwiczenie' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Skończ' }).click();
  await page.getByRole('button', { name: 'Wróć', exact: true }).click();

  // Panel rodzica
  await page.getByRole('button', { name: 'Wygląd' }).click();
  await page.getByRole('dialog').getByRole('button', { name: /Wyspy Wiedzy/ }).click();
  await page.getByRole('button', { name: 'Panel rodzica' }).click();
  for (const d of '1234') await page.getByRole('button', { name: d, exact: true }).click();
  await page.getByRole('button', { name: 'Zatwierdź' }).click();
  for (const d of '1234') await page.getByRole('button', { name: d, exact: true }).click();
  await page.getByRole('button', { name: 'Zatwierdź' }).click();
  await expect(page.getByRole('heading', { name: 'Postępy' })).toBeVisible();
  await snap(page, '10-parent-stats');

  await page.getByRole('button', { name: 'Tematy' }).click();
  await snap(page, '11-parent-topics');
  await page.getByRole('button', { name: 'Nowy temat' }).click();
  await page.getByPlaceholder('np. Czasownik — czas przeszły').fill('Test: czasowniki');
  await page.locator('textarea.textarea').fill('wybierz: Które słowo jest czasownikiem? | *skacze | kot\nkliknij: Kliknij czasownik. >> Ola *czyta*.\nzly: linia');
  await expect(page.getByText('1 błąd', { exact: true })).toBeVisible();
  await snap(page, '12-parent-editor');
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Zapisz' }).click();
  await expect(page.getByText('Test: czasowniki')).toBeVisible();

  await page.getByRole('button', { name: /Dodaj z AI/ }).click();
  await snap(page, '13-parent-add');
  await page.getByRole('button', { name: 'Ustawienia' }).click();
  await snap(page, '14-parent-settings');
  await page.getByRole('button', { name: 'Wyjdź' }).click();

  // Nowy temat widoczny dla ucznia
  await page.getByRole('button', { name: /Język polski/ }).click();
  await expect(page.getByText('Test: czasowniki').first()).toBeVisible();

  // Dane przetrwały przeładowanie (IndexedDB)
  await page.reload();
  await expect(page.getByText('Cześć, Kuba!')).toBeVisible();
  await page.getByRole('button', { name: /Język polski/ }).click();
  await expect(page.getByText('Test: czasowniki').first()).toBeVisible();

  expect(errors.filter((e) => !/favicon|manifest/i.test(e))).toEqual([]);
});

test('dwie osoby: każda ma swoją klasę, tematy i postępy', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Imię').fill('Kuba');
  await page.getByRole('group', { name: 'Klasa' }).getByRole('button', { name: '3', exact: true }).click();
  await page.getByRole('button', { name: 'Zaczynamy!' }).click();
  await expect(page.getByText('Cześć, Kuba!')).toBeVisible();

  // Kuba robi jedno ćwiczenie z matematyki
  await page.getByRole('button', { name: /Matematyka/ }).click();
  await expect(page.getByText('Mnożenie przez 6 i 7').first()).toBeVisible();
  await expect(page.getByText('Ułamki: skracanie i rozszerzanie')).toHaveCount(0);
  await page.getByRole('button', { name: 'Wróć', exact: true }).click();

  // Dodanie córki (klasa 5)
  await page.getByRole('button', { name: /zmień osobę/ }).click();
  await expect(page.getByRole('heading', { name: 'Kto się dziś uczy?' })).toBeVisible();
  await page.getByRole('button', { name: /Dodaj osobę/ }).click();
  await page.getByPlaceholder('Imię').fill('Ola');
  await page.getByRole('group', { name: 'Klasa' }).getByRole('button', { name: '5', exact: true }).click();
  await page.getByRole('button', { name: 'Dodaj', exact: true }).click();
  await expect(page.getByText('Cześć, Ola!')).toBeVisible();
  await snap(page, '15-start-ola');
  await page.getByRole('button', { name: /Matematyka/ }).click();
  await expect(page.getByText('Ułamki: skracanie i rozszerzanie').first()).toBeVisible();
  await expect(page.getByText('Mnożenie przez 6 i 7')).toHaveCount(0);
  await snap(page, '16-subject-ola-mat');
  await page.getByRole('button', { name: 'Wróć', exact: true }).click();
  await page.getByRole('button', { name: /Język polski/ }).click();
  await expect(page.getByText('Przypadki rzeczownika').first()).toBeVisible();
  await expect(page.getByText('Rzeczownik — kto? co?')).toHaveCount(0);

  // Po ponownym uruchomieniu aplikacja pyta, kto się uczy
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Kto się dziś uczy?' })).toBeVisible();
  await snap(page, '17-people');
  await page.getByRole('button', { name: /Kuba/ }).click();
  await expect(page.getByText('Cześć, Kuba!')).toBeVisible();
});
