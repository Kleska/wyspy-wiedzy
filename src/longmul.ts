/*
 * Mnożenie pisemne — układ zapisu do wypełnienia na ekranie (np. jako sprawdzenie dzielenia):
 *
 *      4 6
 *    · 2 3
 *    -----
 *    1 3 8      ← 46 · 3
 *  + 9 2        ← 46 · 2 (przesunięte o jedno miejsce w lewo)
 *    -----
 *  1 0 5 8
 *
 * Czynniki, znaki i kreski są wydrukowane; dziecko wpisuje iloczyny częściowe i sumę — od prawej strony.
 * Kolumna 0 jest na znak („·”, „+”), cyfry stoją wyrównane do prawej.
 */

export interface MulStatic {
  row: number;
  col: number;
  ch: string;
  kind: 'factor' | 'sign';
}

export interface MulInput {
  row: number;
  col: number;
  ch: string;
  kind: 'partial' | 'sum';
}

export interface MulLayout {
  a: number;
  b: number;
  product: number;
  cols: number;
  rows: number;
  statics: MulStatic[];
  /** Kratki do wpisania w kolejności liczenia: w każdym wierszu od prawej do lewej. */
  inputs: MulInput[];
  rules: { row: number; colFrom: number; colTo: number }[];
}

export function multiplicationLayout(a: number, b: number): MulLayout {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a <= 0 || b <= 0) throw new Error(`Mnożenie pisemne: złe liczby ${a} · ${b}`);
  const product = a * b;
  const cols = String(product).length + 1;
  const last = cols - 1;
  const statics: MulStatic[] = [];
  const inputs: MulInput[] = [];
  const rules: MulLayout['rules'] = [];
  const print = (row: number, value: number, endCol: number) =>
    String(value)
      .split('')
      .forEach((ch, i, all) => statics.push({ row, col: endCol - all.length + 1 + i, ch, kind: 'factor' }));
  const boxes = (row: number, value: number, endCol: number, kind: MulInput['kind']) => {
    const s = String(value);
    // Od prawej: tak się liczy (jedności, potem dziesiątki…).
    for (let i = s.length - 1; i >= 0; i--) inputs.push({ row, col: endCol - s.length + 1 + i, ch: s[i], kind });
    return endCol - s.length + 1;
  };

  print(0, a, last);
  print(1, b, last);
  statics.push({ row: 1, col: last - String(b).length, ch: '·', kind: 'sign' });
  rules.push({ row: 2, colFrom: 1, colTo: last });

  const digits = String(b).split('').map(Number).reverse();
  let row = 3;
  let start = last;
  digits.forEach((d, i) => {
    start = boxes(row, a * d, last - i, 'partial');
    row++;
  });
  if (digits.length > 1) {
    statics.push({ row: row - 1, col: Math.max(0, start - 1), ch: '+', kind: 'sign' });
    rules.push({ row, colFrom: 1, colTo: last });
    boxes(row + 1, product, last, 'sum');
    row += 2;
  }
  return { a, b, product, cols, rows: row, statics, inputs, rules };
}

/** Iloczyn odczytany z kratek (ostatni wiersz) albo null, gdy nie wszystkie kratki są wypełnione. */
export function multiplicationEntry(layout: MulLayout, values: string[]): string | null {
  if (layout.inputs.some((_, i) => !values[i])) return null;
  const lastRow = Math.max(...layout.inputs.map((c) => c.row));
  return layout.inputs
    .map((c, i) => ({ c, v: values[i] }))
    .filter(({ c }) => c.row === lastRow)
    .sort((x, y) => x.c.col - y.c.col)
    .map(({ v }) => v)
    .join('');
}

/** Zadanie „… Pomnóż pisemnie … >> 46 · 23 = […]” → [46, 23]; inne → null. */
export function multiplicationGridOf(ex: { type: string; prompt: string; parts?: (string | string[])[] }): [number, number] | null {
  if (ex.type !== 'fill' || !ex.parts || !/Pomnóż pisemnie/.test(ex.prompt)) return null;
  const first = ex.parts[0];
  const m = typeof first === 'string' ? first.match(/^\s*(\d+) · (\d+) =\s*$/) : null;
  if (!m || ex.parts.filter((p) => Array.isArray(p)).length !== 1) return null;
  const a = Number(m[1]);
  const b = Number(m[2]);
  // Zero w mnożniku wymagałoby osobnej umowy co do zapisu (wiersz zer albo przesunięcie) — takich zadań nie rysujemy.
  return a > 0 && b > 0 && b < 1000 && !String(b).includes('0') ? [a, b] : null;
}
