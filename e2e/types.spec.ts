import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const shots = process.env.SHOTS_DIR;
async function snap(page: Page, name: string) {
  if (shots) await page.screenshot({ path: `${shots}/${test.info().project.name}-${name}.png` });
}

const DSL = [
  'sortuj: Posegreguj słowa. >> rzeczownik = morze, piłka, brat ; czasownik = skacze, płacze, jedzie ; przymiotnik = głośny, mokra, wesoły',
  'wpisz: Odmień czasownik „pisać”. >> ja piszę, ty [piszesz], oni [piszą]',
  'pary: Połącz osobę z czasownikiem. >> ja = skaczę ; ty = skaczesz ; oni = skaczą',
].join('\n');

test('sortowanie (przeciąganie), luki i pary działają i dają poprawny wynik', async ({ page }) => {
  // Mały telefon (jak u dziecka): 9 słów i 3 koszyki muszą się zmieścić nad stopką bez przewijania.
  const phone = test.info().project.name === 'phone';
  if (phone) await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/');
  await page.getByPlaceholder('Imię').fill('Kuba');
  await page.getByRole('group', { name: 'Klasa' }).getByRole('button', { name: '3', exact: true }).click();
  await page.getByRole('button', { name: 'Zaczynamy!' }).click();
  await page.getByRole('button', { name: 'Panel rodzica' }).click();
  for (let k = 0; k < 2; k++) {
    for (const d of '123456') await page.getByRole('button', { name: d, exact: true }).click();
    await page.getByRole('button', { name: 'Zatwierdź' }).click();
  }
  await page.getByRole('button', { name: 'Tematy' }).click();
  await page.getByRole('button', { name: 'Nowy temat' }).click();
  await page.getByPlaceholder('np. Czasownik — czas przeszły').fill('Test typów');
  await page.locator('textarea.textarea').fill(DSL);
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await page.getByRole('button', { name: 'Wyjdź' }).click();

  await page.locator('.subject-big', { hasText: 'Język polski' }).click();
  await page.getByRole('button', { name: /Test typów/ }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: /Graj!/ }).click();

  for (let step = 0; step < 3; step++) {
    if (await page.locator('.token').count()) {
      // Przeciągnij pierwsze słowo palcem/myszą do właściwego koszyka, resztę stuknięciami.
      const words: Record<string, number> = { morze: 0, piłka: 0, brat: 0, skacze: 1, płacze: 1, jedzie: 1, głośny: 2, mokra: 2, wesoły: 2 };
      const fits = async () => {
        const foot = (await page.locator('.pr-foot').boundingBox())!;
        const last = (await page.locator('.basket').last().boundingBox())!;
        const bank = (await page.locator('.bank').boundingBox())!;
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
        expect(bank.y).toBeGreaterThanOrEqual(0);
        expect(last.y + last.height).toBeLessThanOrEqual(foot.y + 1);
        expect(foot.y + foot.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1);
      };
      await expect(page.locator('.bank .token')).toHaveCount(9);
      if (phone) {
        await snap(page, 't0-sort-start');
        await fits();
        // „Podpowiedź” i „Sprawdź” stoją w jednym rzędzie.
        const hint = (await page.getByRole('button', { name: 'Podpowiedź' }).boundingBox())!;
        const check = (await page.getByRole('button', { name: 'Sprawdź' }).boundingBox())!;
        expect(Math.abs(hint.y + hint.height / 2 - (check.y + check.height / 2))).toBeLessThan(8);
      }
      const first = page.locator('.bank .token').first();
      const text = (await first.innerText()).trim();
      const box = (await first.boundingBox())!;
      const target = (await page.locator('.basket').nth(words[text]).boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 8 });
      await snap(page, 't1-sort-drag');
      await page.mouse.up();
      while (await page.locator('.bank .token').count()) {
        const t = page.locator('.bank .token').first();
        const w = (await t.innerText()).trim();
        await t.click();
        await page.locator('.basket').nth(words[w]).click();
      }
      await snap(page, 't2-sort-ready');
      if (phone) await fits();
    } else if (await page.locator('.gap').count()) {
      await page.locator('.gap').nth(0).fill('piszesz');
      await page.locator('.gap').nth(1).fill('pisz');
      await page.getByRole('button', { name: 'Wstaw ą' }).click();
      await expect(page.locator('.gap').nth(1)).toHaveValue('piszą');
      await snap(page, 't3-fill');
    } else {
      const left = page.locator('.match-col').nth(0).locator('.match-item');
      const right = page.locator('.match-col').nth(1).locator('.match-item');
      for (const [l, r] of [
        ['ja', 'skaczę'],
        ['ty', 'skaczesz'],
        ['oni', 'skaczą'],
      ]) {
        await left.filter({ hasText: new RegExp(`^${l}$`) }).click();
        await right.filter({ hasText: new RegExp(`^${r}$`) }).click();
      }
      await snap(page, 't4-match');
    }
    await page.getByRole('button', { name: 'Sprawdź' }).click();
    await expect(page.locator('.pr-foot.good')).toBeVisible();
    await page.waitForTimeout(750);
    await page.getByRole('button', { name: /^(Dalej|Zakończ)$/ }).click();
  }
  await expect(page.getByText('3/3')).toBeVisible();
  await snap(page, 't5-summary');
  await page.getByRole('button', { name: 'Wróć do tematów' }).click();
  await page.waitForTimeout(300);
  await snap(page, 't6-home');
});

test('zadania liczbowe: klawiatura z cyframi i ułamek piętrowy zamiast polskich liter', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Imię').fill('Ola');
  await page.getByRole('group', { name: 'Klasa' }).getByRole('button', { name: '5', exact: true }).click();
  await page.getByRole('button', { name: 'Zaczynamy!' }).click();
  await page.getByRole('button', { name: 'Panel rodzica' }).click();
  for (let k = 0; k < 2; k++) {
    for (const d of '123456') await page.getByRole('button', { name: d, exact: true }).click();
    await page.getByRole('button', { name: 'Zatwierdź' }).click();
  }
  await page.getByRole('button', { name: 'Tematy' }).click();
  await page.getByRole('button', { name: 'Nowy temat' }).click();
  await page.getByPlaceholder('np. Czasownik — czas przeszły').fill('Test liczb');
  await page.getByRole('combobox').first().selectOption('mat');
  await page.locator('textarea.textarea').fill('wpisz: Skróć ułamek. >> 6/8 = [3/4]\nwpisz: Oblicz. >> 2,5 + 1,25 = [3,75]');
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await page.getByRole('button', { name: 'Wyjdź' }).click();
  await page.locator('.subject-big', { hasText: 'Matematyka' }).click();
  await page.getByRole('button', { name: /Test liczb/ }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: /Graj!/ }).click();

  for (let step = 0; step < 2; step++) {
    await expect(page.getByLabel('Klawiatura liczbowa')).toBeVisible();
    await expect(page.getByLabel('Polskie litery')).toHaveCount(0);
    if (await page.getByLabel('Licznik, luka 1').count()) {
      await page.getByLabel('Licznik, luka 1').click();
      await page.getByLabel('Klawiatura liczbowa').getByRole('button', { name: '3', exact: true }).click();
      await page.getByLabel('Mianownik, luka 1').click();
      await page.getByLabel('Klawiatura liczbowa').getByRole('button', { name: '4', exact: true }).click();
      await snap(page, 't7-fraction');
    } else {
      await page.getByLabel('Luka 1').click();
      for (const k of ['3', 'Przecinek', '7', '5']) await page.getByLabel('Klawiatura liczbowa').getByRole('button', { name: k, exact: true }).click();
      await expect(page.getByLabel('Luka 1')).toHaveValue('3,75');
      await snap(page, 't8-decimal');
      // Enter z klawiatury sprawdza odpowiedź i ZOSTAJE na informacji zwrotnej
      await page.getByLabel('Luka 1').press('Enter');
      await expect(page.locator('.pr-foot.good')).toBeVisible();
      await page.waitForTimeout(300);
      await expect(page.locator('.pr-foot.good')).toBeVisible();
      await page.waitForTimeout(600);
      await page.keyboard.press('Enter');
      if (step === 0) await expect(page.locator('.pr-foot.good')).toHaveCount(0);
      continue;
    }
    await page.getByRole('button', { name: 'Sprawdź' }).click();
    await expect(page.locator('.pr-foot.good')).toBeVisible();
    await page.waitForTimeout(750);
    await page.getByRole('button', { name: /^(Dalej|Zakończ)$/ }).click();
  }
  await expect(page.getByText('2/2')).toBeVisible();
});
