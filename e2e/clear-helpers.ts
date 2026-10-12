import type { Page } from '@playwright/test';

export async function openSubjectMore(page: Page) {
  const details = page.locator('details.subject-more');
  if ((await details.count()) && (await details.getAttribute('open')) === null) await details.locator(':scope > summary').click();
}
export async function openTopicMore(page: Page) {
  const details = page.getByRole('dialog').locator('details.topic-more');
  if ((await details.count()) && (await details.getAttribute('open')) === null) await details.locator(':scope > summary').click();
}
export async function openPlan(page: Page) {
  const details = page.locator('details.plan-card');
  if ((await details.count()) && (await details.getAttribute('open')) === null) await details.locator(':scope > summary').click();
}

export async function openParentPlan(page: Page) {
  const details = page.locator('details.parent-plan-editor');
  if ((await details.count()) && (await details.getAttribute('open')) === null) await details.locator(':scope > summary').click();
}
export async function openParentStats(page: Page) {
  const summary = page.locator('details.clear-details > summary', { hasText: 'Szczegółowe statystyki i historia' });
  if ((await summary.count()) && (await summary.locator('..').getAttribute('open')) === null) await summary.click();
}
