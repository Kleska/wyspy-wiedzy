// Składa podgląd demo (jeden plik, bez chmury) z dist-preview/index.html.
import { readFileSync, writeFileSync } from 'node:fs';
const html = readFileSync('dist-preview/index.html', 'utf8');
const styles = [...html.matchAll(/<style[^>]*>[\s\S]*?<\/style>/g)].map((m) => m[0]);
const scripts = [...html.matchAll(/<script type="module"[^>]*>[\s\S]*?<\/script>/g)].map((m) => m[0]);
if (!scripts.length) throw new Error('brak skryptu');
const out = [
  '<title>Wyspy Wiedzy</title>',
  ...styles,
  '<div id="root"></div>',
  '<script>window.WW_CONFIG = {};</script>',
  ...scripts,
].join('\n');
writeFileSync(process.argv[2] ?? 'dist-preview/wyspy-wiedzy.html', out);
console.log('ok', (out.length / 1024 / 1024).toFixed(2), 'MB');
