// Generuje ikony PNG z public/icon.svg (uruchom: node scripts/icons.mjs)
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
const svg = readFileSync(new URL('../public/icon.svg', import.meta.url), 'utf8');
const exe = process.env.CHROME_PATH;
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage();
async function shot(size, file, maskable = false) {
  await page.setViewportSize({ width: size, height: size });
  const inner = maskable ? Math.round(size * 0.8) : size;
  const body = maskable
    ? `<div style="width:${size}px;height:${size}px;background:#BFE6DC;display:flex;align-items:center;justify-content:center">${svg.replace('<svg', `<svg width="${inner}" height="${inner}"`).replace('rx="112"', 'rx="0"')}</div>`
    : svg.replace('<svg', `<svg width="${size}" height="${size}"`);
  await page.setContent(`<html><body style="margin:0;background:transparent">${body}</body></html>`);
  await page.screenshot({ path: new URL(`../public/${file}`, import.meta.url).pathname, omitBackground: !maskable });
}
await shot(192, 'icon-192.png');
await shot(512, 'icon-512.png');
await shot(512, 'icon-512-maskable.png', true);
await shot(180, 'apple-touch-icon.png', true);
await browser.close();
console.log('ok');
