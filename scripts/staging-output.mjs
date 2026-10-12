import { readFileSync, writeFileSync, rmSync } from 'node:fs';

const root = 'dist-staging';
writeFileSync(`${root}/config.js`, 'window.WW_CONFIG = {};\n');
let html = readFileSync(`${root}/index.html`, 'utf8');
html = html.replace('<title>Wyspy Wiedzy</title>', '<title>Wyspy Wiedzy — wersja testowa</title>');
html = html.replace('<head>', '<head>\n<meta name="robots" content="noindex,nofollow">');
html = html.replace(/<link rel="manifest"[^>]*>/g, '');
writeFileSync(`${root}/index.html`, html);
rmSync(`${root}/sw.js`, { force: true });
rmSync(`${root}/manifest.webmanifest`, { force: true });
console.log('Podgląd testowy: osobna baza lokalna, bez konfiguracji chmury i service workera.');
