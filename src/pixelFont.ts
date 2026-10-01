import latin600 from '@fontsource/pixelify-sans/files/pixelify-sans-latin-600-normal.woff2?url';
import latin700 from '@fontsource/pixelify-sans/files/pixelify-sans-latin-700-normal.woff2?url';
import ext600 from '@fontsource/pixelify-sans/files/pixelify-sans-latin-ext-600-normal.woff2?url';
import ext700 from '@fontsource/pixelify-sans/files/pixelify-sans-latin-ext-700-normal.woff2?url';

/*
 * Pixel Quest: litery pikselowe, ale CYFRY ze zwykłej, czytelnej czcionki (Rubik).
 * Rejestrujemy krój „Pixelify Letters” z zakresem znaków BEZ cyfr 0–9 (U+0030–0039) —
 * przeglądarka sama bierze cyfry z następnej czcionki na liście (--font-display w styles.css).
 */
const LATIN_NO_DIGITS =
  'U+0000-002F, U+003A-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const LATIN_EXT = 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1E00-1E9F, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF';

export function registerPixelLetters() {
  if (typeof FontFace === 'undefined' || typeof document === 'undefined') return;
  const faces: [string, string, string][] = [
    [latin600, '600', LATIN_NO_DIGITS],
    [ext600, '600', LATIN_EXT],
    [latin700, '700', LATIN_NO_DIGITS],
    [ext700, '700', LATIN_EXT],
  ];
  for (const [url, weight, unicodeRange] of faces) {
    const f = new FontFace('Pixelify Letters', `url(${url}) format('woff2')`, { weight, unicodeRange, display: 'swap' });
    document.fonts.add(f);
    void f.load().catch(() => undefined);
  }
}
