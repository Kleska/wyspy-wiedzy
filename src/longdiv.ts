/*
 * Dzielenie pisemne („słupek”) — czysta logika: kroki, układ zapisu i opisy dla dziecka.
 * Wszystko jest liczone z dzielnej i dzielnika, więc w przykładach i rozwiązaniach nie ma pomyłek.
 *
 * Zapis jak w polskiej szkole: wynik nad kreską nad dzielną, dzielnik po dwukropku z prawej,
 * pod spodem kolejne odejmowania. Gdy liczba jest za mała, żeby ją podzielić, w wyniku piszemy 0
 * i od razu spisujemy następną cyfrę (bez osobnego odejmowania zera).
 */

export interface DivStep {
  /** Liczba dzielona w tym kroku (np. 13 w „13 : 4”). */
  part: number;
  /** Cyfra wyniku. */
  digit: number;
  /** digit · dzielnik. */
  product: number;
  /** part − product. */
  rest: number;
  /** Kolumna (numer cyfry dzielnej od lewej, od 0), nad którą stoi cyfra wyniku. */
  col: number;
  /** Cyfra spisana, żeby powstało `part`; w pierwszym kroku null. */
  brought: number | null;
}

export interface LongDiv {
  dividend: number;
  divisor: number;
  digits: number[];
  steps: DivStep[];
  quotient: number;
  remainder: number;
}

export function longDivision(dividend: number, divisor: number): LongDiv {
  if (!Number.isInteger(dividend) || !Number.isInteger(divisor) || dividend < 0 || divisor <= 0) throw new Error(`Dzielenie pisemne: złe liczby ${dividend} : ${divisor}`);
  const digits = String(dividend).split('').map(Number);
  const steps: DivStep[] = [];
  let cur = 0;
  digits.forEach((d, col) => {
    cur = cur * 10 + d;
    // Na początku dobieramy cyfry, aż powstanie liczba nie mniejsza od dzielnika.
    if (!steps.length && cur < divisor && col < digits.length - 1) return;
    const digit = Math.floor(cur / divisor);
    const product = digit * divisor;
    steps.push({ part: cur, digit, product, rest: cur - product, col, brought: steps.length ? d : null });
    cur -= product;
  });
  return { dividend, divisor, digits, steps, quotient: Math.floor(dividend / divisor), remainder: dividend % divisor };
}

// ─── Układ zapisu i klatki „krok po kroku” ───────────────────────────────────

export type DivCellKind = 'quotient' | 'dividend' | 'minus' | 'product' | 'rest' | 'brought';

export interface DivCell {
  row: number;
  /** Kolumna cyfry dzielnej (−1 = miejsce na znak minus przed pierwszą cyfrą). */
  col: number;
  ch: string;
  kind: DivCellKind;
  /** Numer klatki, od której znak jest widoczny. */
  from: number;
  /** Zero reszty, obok którego spisujemy następną cyfrę („02” czytamy jako 2) — rysowane bladziej. */
  muted?: boolean;
}

export interface DivRule {
  row: number;
  colFrom: number;
  colTo: number;
  from: number;
}

export interface DivFrame {
  text: string;
  /** Podświetlona liczba, którą teraz dzielimy (wiersz i zakres kolumn). */
  part?: { row: number; colFrom: number; colTo: number };
  /** Kolumna cyfry wyniku wpisanej w tej klatce. */
  qCol?: number;
}

export interface DivLayout extends LongDiv {
  cells: DivCell[];
  rules: DivRule[];
  frames: DivFrame[];
  rows: number;
}

const times = (n: number) => (n === 1 ? '1 raz' : `${n} razy`);
const DIGIT_COUNT = ['', 'jedną cyfrę', 'dwie cyfry', 'trzy cyfry', 'cztery cyfry', 'pięć cyfr'];

/** Zapis działania z wynikiem: „938 : 4 = 234 r 2”. */
export function divisionResult(d: LongDiv): string {
  return `${d.dividend} : ${d.divisor} = ${d.quotient}${d.remainder ? ` r ${d.remainder}` : ''}`;
}

/** Sprawdzenie mnożeniem: „234 · 4 + 2 = 938”. */
export function divisionCheck(d: LongDiv): string {
  return `${d.quotient} · ${d.divisor}${d.remainder ? ` + ${d.remainder}` : ''} = ${d.dividend}`;
}

/** Kroki jednym zdaniem — do wyjaśnienia po odpowiedzi: „9 : 4 = 2, reszta 1 → 13 : 4 = 3, reszta 1 → …”. */
export function divisionSummary(d: LongDiv): string {
  return d.steps.map((s) => `${s.part} : ${d.divisor} = ${s.digit}, reszta ${s.rest}`).join(' → ');
}

export function divisionLayout(dividend: number, divisor: number): DivLayout {
  const d = longDivision(dividend, divisor);
  const cells: DivCell[] = [];
  const rules: DivRule[] = [];
  const frames: DivFrame[] = [];
  const n = d.digits.length;

  // Wiersz 0 — wynik, wiersz 1 — kreska, wiersz 2 — dzielna.
  rules.push({ row: 1, colFrom: 0, colTo: n - 1, from: 0 });
  d.digits.forEach((x, col) => cells.push({ row: 2, col, ch: String(x), kind: 'dividend', from: 0 }));
  frames.push({ text: `Dzielimy ${dividend} przez ${divisor}. Zaczynamy od lewej strony — od pierwszej cyfry.` });

  const putNumber = (row: number, value: number, endCol: number, kind: DivCellKind, from: number) => {
    const s = String(value);
    s.split('').forEach((ch, i) => cells.push({ row, col: endCol - s.length + 1 + i, ch, kind, from }));
    return endCol - s.length + 1;
  };

  // Wiersz, w którym stoi liczba dzielona w bieżącym kroku, i kolumna jej pierwszej cyfry.
  let partRow = 2;
  let partStart = 0;
  let row = 2;

  d.steps.forEach((s, i) => {
    const last = i === d.steps.length - 1;
    if (s.brought !== null) {
      // Spisanie cyfry: dopisujemy ją obok reszty.
      cells.push({ row: partRow, col: s.col, ch: String(s.brought), kind: 'brought', from: frames.length });
      const prevRest = d.steps[i - 1].rest;
      frames.push({
        text: prevRest ? `Spisujemy następną cyfrę: ${s.brought}. Obok reszty ${prevRest} powstaje liczba ${s.part}.` : `Spisujemy następną cyfrę: ${s.brought}. Mamy teraz ${s.part}.`,
        part: { row: partRow, colFrom: partStart, colTo: s.col },
      });
    }

    // Dzielenie: cyfra wyniku.
    cells.push({ row: 0, col: s.col, ch: String(s.digit), kind: 'quotient', from: frames.length });
    let text = '';
    const len = String(s.part).length;
    if (i === 0 && s.col > 0) {
      const shorter = Number(String(dividend).slice(0, s.col));
      text = `${s.col === 1 ? `Pierwsza cyfra (${shorter})` : `Liczba ${shorter}`} jest mniejsza od ${divisor}, więc bierzemy ${DIGIT_COUNT[len] ?? `${len} cyfr`}: ${s.part}. `;
    }
    const over = s.digit < 9 ? ` (${s.digit + 1} · ${divisor} = ${(s.digit + 1) * divisor} to już za dużo)` : '';
    // Gdzie zapisać cyfrę wyniku: zawsze nad tą cyfrą dzielnej, na której kończy się dzielona liczba.
    const above = d.digits[s.col];
    const where = i > 0 ? `nad spisaną cyfrą ${above}` : len > 1 ? `nad ostatnią cyfrą liczby ${s.part}, czyli nad ${above}` : `nad cyfrą ${above}`;
    if (s.digit === 0) {
      text += `${s.part} jest mniejsze od ${divisor}, więc ${divisor} nie mieści się w ${s.part} ani razu. Piszemy 0 w wyniku, ${where} — nie wolno go zgubić!`;
    } else {
      text += `Ile razy ${divisor} mieści się w ${s.part}? ${times(s.digit)}, bo ${s.digit} · ${divisor} = ${s.product}${over}. Piszemy ${s.digit} w wyniku, ${where}.`;
    }
    frames.push({ text, part: { row: partRow, colFrom: partStart, colTo: s.col }, qCol: s.col });

    if (s.digit === 0) {
      // Bez odejmowania zera: następna cyfra zostanie dopisana w tym samym wierszu.
      return;
    }

    // Mnożenie i odejmowanie.
    const at = frames.length;
    const pStart = putNumber(row + 1, s.product, s.col, 'product', at);
    cells.push({ row: row + 1, col: pStart - 1, ch: '−', kind: 'minus', from: at });
    rules.push({ row: row + 2, colFrom: Math.min(pStart, partStart), colTo: s.col, from: at });
    const rStart = putNumber(row + 3, s.rest, s.col, 'rest', at);
    if (s.rest === 0 && !last) cells[cells.length - 1].muted = true;
    frames.push({
      text: `Mnożymy: ${s.digit} · ${divisor} = ${s.product}. Odejmujemy: ${s.part} − ${s.product} = ${s.rest}.${i === 0 ? ` Reszta musi być mniejsza od ${divisor} — jest, więc idziemy dalej.` : ''}`,
      part: { row: partRow, colFrom: partStart, colTo: s.col },
    });
    row += 3;
    partRow = row;
    partStart = rStart;
  });

  frames.push({
    text: d.remainder
      ? `Nie ma już cyfr do spisania. Zostało ${d.remainder} — to reszta. Wynik: ${divisionResult(d)}. Sprawdzenie: ${divisionCheck(d)}.`
      : `Nie ma już cyfr do spisania, a reszta to 0. Koniec! Wynik: ${divisionResult(d)}. Sprawdzenie: ${divisionCheck(d)}.`,
  });

  return { ...d, cells, rules, frames, rows: row + 1 };
}

/** Linia lekcji „słupek: 936 : 4” → [936, 4]. Zwraca `false`, gdy linia zaczyna się od „słupek”, ale jest źle zapisana. */
export function lessonDivision(line: string): [number, number] | false | null {
  if (!/^s[łl]upek\b/i.test(line.trim())) return null;
  const m = line.trim().match(/^s[łl]upek\s*:\s*(\d{1,6})\s*:\s*(\d{1,3})$/i);
  if (!m || Number(m[2]) === 0) return false;
  return [Number(m[1]), Number(m[2])];
}

/** „Oblicz pisemnie. >> 936 : 4 = […]” → [936, 4]; inne zadania → null. */
export function writtenDivisionOf(ex: { type: string; prompt: string; parts?: (string | string[])[] }): [number, number] | null {
  if (ex.type !== 'fill' || !ex.parts) return null;
  const first = ex.parts[0];
  // Albo liczby są w poleceniu („Dzielimy pisemnie 675 : 5. Uzupełnij kroki”), albo w samym działaniu („Oblicz pisemnie… >> 936 : 4 = […]”).
  const m = ex.prompt.match(/pisemnie (\d+) : (\d+)/) ?? (/^Oblicz pisemnie/.test(ex.prompt) && typeof first === 'string' ? first.match(/^\s*(\d+) : (\d+) =\s*$/) : null);
  if (!m) return null;
  const a = Number(m[1]);
  const b = Number(m[2]);
  return b > 0 && a < 1_000_000 ? [a, b] : null;
}
