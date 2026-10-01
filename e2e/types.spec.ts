import { expect, test, type Page } from '@playwright/test';

const shots = process.env.SHOTS_DIR;
async function snap(page: Page, name: string) {
  if (shots) await page.screenshot({ path: `${shots}/${test.info().project.name}-${name}.png` });
}

const DSL = [
  'sortuj: Posegreguj słowa. >> rzeczownik = kot, szkoła ; czasownik = biega, czyta ; przymiotnik = mały, zielona',
  'wpisz: Odmień czasownik „pisać”. >> ja piszę, ty [piszesz], oni [piszą]',
  'pary: Połącz osobę z czasownikiem. >> ja = skaczę ; ty = skaczesz ; oni = skaczą',
].join('\n');

test('sortowanie (przeciąganie), luki i pary działają i dają poprawny wynik', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Imię').fill('Kuba');
  await page.getByRole('group', { name: 'Klasa' }).getByRole('button', { name: '3', exact: true }).click();
  await page.getByRole('button', { name: 'Zaczynamy!' }).click();
  await page.getByRole('button', { name: 'Panel rodzica' }).click();
  for (let k = 0; k < 2; k++) {
    for (const d of '1234') await page.getByRole('button', { name: d, exact: true }).click();
    await page.getByRole('button', { name: 'Zatwierdź' }).click();
  }
  await page.getByRole('button', { name: 'Tematy' }).click();
  await page.getByRole('button', { name: 'Nowy temat' }).click();
  await page.getByPlaceholder('np. Czasownik — czas przeszły').fill('Test typów');
  await page.locator('textarea.textarea').fill(DSL);
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await page.getByRole('button', { name: 'Wyjdź' }).click();

  await page.getByRole('button', { name: /Język polski/ }).click();
  await page.getByRole('button', { name: /Test typów/ }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: /Graj!/ }).click();

  for (let step = 0; step < 3; step++) {
    if (await page.locator('.token').count()) {
      // Przeciągnij pierwsze słowo palcem/myszą do właściwego koszyka, resztę stuknięciami.
      const words: Record<string, number> = { kot: 0, szkoła: 0, biega: 1, czyta: 1, mały: 2, zielona: 2 };
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
    await page.getByRole('button', { name: /^(Dalej|Zakończ)$/ }).click();
  }
  await expect(page.getByText('3/3')).toBeVisible();
  await snap(page, 't5-summary');
  await page.getByRole('button', { name: 'Wróć do tematów' }).click();
  await page.waitForTimeout(300);
  await snap(page, 't6-home');
});
