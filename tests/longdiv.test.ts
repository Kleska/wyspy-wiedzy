import { describe, expect, it } from 'vitest';
import { GUIDES } from '../src/content/guides';
import { LESSONS } from '../src/content/lessons';
import { MATH_GRADE5 } from '../src/content/math';
import { parseDsl, parseLesson } from '../src/dsl';
import { divisionCheck, divisionEntry, divisionGridOf, divisionInputs, divisionLayout, divisionResult, lessonDivision, longDivision, writtenDivisionOf } from '../src/longdiv';
import type { FillExercise } from '../src/types';

const digits = (a: number, b: number) => longDivision(a, b).steps.map((s) => s.digit).join('');

describe('dzielenie pisemne: kroki', () => {
  it('zwykły przykład: 936 : 4', () => {
    const d = longDivision(936, 4);
    expect(d.steps.map((s) => [s.part, s.digit, s.product, s.rest, s.col, s.brought])).toEqual([
      [9, 2, 8, 1, 0, null],
      [13, 3, 12, 1, 1, 3],
      [16, 4, 16, 0, 2, 6],
    ]);
    expect(divisionResult(d)).toBe('936 : 4 = 234');
    expect(divisionCheck(d)).toBe('234 · 4 = 936');
  });

  it('pierwsza cyfra za mała — bierzemy dwie (albo trzy) cyfry', () => {
    expect(longDivision(156, 3).steps[0]).toMatchObject({ part: 15, digit: 5, col: 1, brought: null });
    expect(longDivision(864, 24).steps[0]).toMatchObject({ part: 86, digit: 3, rest: 14, col: 1 });
    expect(longDivision(1548, 36).steps[0]).toMatchObject({ part: 154, digit: 4, rest: 10, col: 2 });
  });

  it('zero w wyniku nie ginie: w środku, na końcu i kilka pod rząd', () => {
    expect(digits(824, 4)).toBe('206');
    expect(digits(840, 4)).toBe('210');
    expect(digits(4032, 4)).toBe('1008');
    expect(digits(2800, 7)).toBe('400');
  });

  it('reszta', () => {
    const d = longDivision(938, 4);
    expect([d.quotient, d.remainder]).toEqual([234, 2]);
    expect(divisionResult(d)).toBe('938 : 4 = 234 r 2');
    expect(divisionCheck(d)).toBe('234 · 4 + 2 = 938');
    expect(longDivision(3, 5)).toMatchObject({ quotient: 0, remainder: 3 });
  });

  it('dla każdej pary liczb: cyfry kroków dają wynik, a każda reszta jest mniejsza od dzielnika', () => {
    let seed = 11;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let k = 0; k < 400; k++) {
      const b = 2 + Math.floor(rnd() * 97);
      const a = b + Math.floor(rnd() * 99000);
      const d = longDivision(a, b);
      expect(Number(digits(a, b)), `${a} : ${b}`).toBe(Math.floor(a / b));
      expect(d.steps[0].digit, `${a} : ${b}`).toBeGreaterThan(0);
      for (const s of d.steps) {
        expect(s.rest).toBeLessThan(b);
        expect(s.product + s.rest).toBe(s.part);
      }
      expect(d.steps[d.steps.length - 1].rest).toBe(a % b);
    }
  });
});

describe('dzielenie pisemne: zapis w słupku', () => {
  /** Rysuje słupek znakami — tak, jak widzi go dziecko po ostatnim kroku. */
  const draw = (a: number, b: number) => {
    const L = divisionLayout(a, b);
    const grid = Array.from({ length: L.rows }, () => Array(L.digits.length + 1).fill(' '));
    for (const c of L.cells) grid[c.row][c.col + 1] = c.ch;
    for (const r of L.rules) for (let c = r.colFrom; c <= r.colTo; c++) grid[r.row][c + 1] = '─';
    return grid.map((r) => r.join('').replace(/\s+$/, '')).join('\n');
  };

  it('936 : 4', () => {
    expect(draw(936, 4)).toBe([' 234', ' ───', ' 936', '−8', ' ─', ' 13', '−12', ' ──', '  16', ' −16', '  ──', '   0'].join('\n'));
  });

  it('zero w wyniku: bez osobnego odejmowania zera, następna cyfra w tym samym wierszu', () => {
    expect(draw(824, 4)).toBe([' 206', ' ───', ' 824', '−8', ' ─', ' 024', ' −24', ' ───', '   0'].join('\n'));
  });

  it('dzielnik dwucyfrowy', () => {
    expect(draw(864, 24)).toBe(['  36', ' ───', ' 864', '−72', ' ──', ' 144', '−144', ' ───', '   0'].join('\n'));
  });

  it('klatki: każdy znak pojawia się w którejś klatce, opis ostatniej podaje wynik i sprawdzenie', () => {
    for (const [a, b] of [
      [936, 4],
      [156, 3],
      [824, 4],
      [938, 4],
      [864, 24],
      [4032, 4],
      [842, 4],
    ]) {
      const L = divisionLayout(a, b);
      const last = L.frames.length - 1;
      for (const c of L.cells) expect(c.from, `${a} : ${b}`).toBeLessThan(last);
      // Dzielna jest od początku, każda cyfra wyniku przychodzi w osobnej klatce.
      expect(L.cells.filter((c) => c.kind === 'dividend').every((c) => c.from === 0)).toBe(true);
      const q = L.cells.filter((c) => c.kind === 'quotient');
      expect(new Set(q.map((c) => c.from)).size).toBe(q.length);
      expect(L.frames[last].text).toContain(divisionResult(L));
      expect(L.frames[last].text).toContain(divisionCheck(L));
      for (const f of L.frames) expect(f.text.trim()).not.toBe('');
    }
    expect(divisionLayout(824, 4).frames.some((f) => f.text.includes('Piszemy 0 w wyniku'))).toBe(true);
    expect(divisionLayout(156, 3).frames[1].text).toContain('bierzemy dwie cyfry: 15');
  });
});

describe('dzielenie pisemne: słupek do wypełnienia na ekranie', () => {
  const grid = (a: number, b: number) => divisionInputs(divisionLayout(a, b));

  it('kratki idą w kolejności pisania: cyfra wyniku, iloczyn, reszta, spisana cyfra…', () => {
    expect(grid(936, 4).map((c) => `${c.kind[0]}${c.ch}`).join(' ')).toBe('q2 p8 r1 b3 q3 p1 p2 r1 b6 q4 p1 p6 r0');
    // Dzielna, minusy i kreski są wydrukowane — nie ma ich wśród kratek.
    expect(grid(936, 4).some((c) => c.kind === 'dividend' || c.kind === 'minus')).toBe(false);
    // Zero w wyniku: cyfra 0 i od razu następna spisana cyfra, bez odejmowania.
    expect(grid(824, 4).map((c) => `${c.kind[0]}${c.ch}`).join(' ')).toBe('q2 p8 r0 b2 q0 b4 q6 p2 p4 r0');
  });

  it('wynik i resztę czytamy z kratek; zero przed spisaną cyfrą można zostawić puste', () => {
    for (const [a, b] of [
      [936, 4],
      [824, 4],
      [938, 4],
      [842, 4],
      [840, 4],
      [864, 24],
      [1000, 23],
      [4032, 4],
      [3264, 32],
    ]) {
      const inputs = grid(a, b);
      const full = inputs.map((c) => c.ch);
      expect(divisionEntry(inputs, full), `${a} : ${b}`).toEqual({ quotient: String(Math.floor(a / b)), remainder: String(a % b) });
      // Bez nieobowiązkowych zer wynik jest ten sam.
      const lean = inputs.map((c) => (c.optional ? '' : c.ch));
      expect(divisionEntry(inputs, lean), `${a} : ${b}`).toEqual({ quotient: String(Math.floor(a / b)), remainder: String(a % b) });
      for (const c of inputs.filter((x) => x.optional)) expect(c.ch).toBe('0');
      // Brak którejkolwiek obowiązkowej cyfry = słupek niegotowy.
      const k = inputs.findIndex((c) => !c.optional);
      expect(divisionEntry(inputs, full.map((v, i) => (i === k ? '' : v)))).toBeNull();
    }
    expect(grid(824, 4).filter((c) => c.optional).length).toBe(1);
    expect(grid(936, 4).filter((c) => c.optional).length).toBe(0);
  });

  it('pomyłka w wyniku albo w ostatniej reszcie zmienia odczytaną odpowiedź', () => {
    const inputs = grid(938, 4);
    const v = inputs.map((c) => c.ch);
    v[0] = '3';
    expect(divisionEntry(inputs, v)).toEqual({ quotient: '334', remainder: '2' });
    v[0] = '2';
    v[v.length - 1] = '6';
    expect(divisionEntry(inputs, v)).toEqual({ quotient: '234', remainder: '6' });
  });

  it('słupek z kratkami dostają zadania „Oblicz pisemnie”, a zadania „za rękę” zostają z lukami', () => {
    for (const t of MATH_GRADE5.filter((x) => x.id.startsWith('b-m5-dzp'))) {
      for (const ex of parseDsl(t.dsl, t.id).exercises) {
        const g = divisionGridOf(ex as FillExercise);
        expect(!!g, ex.prompt).toBe(/^Oblicz pisemnie/.test(ex.prompt));
        if (g) expect(g).toEqual(writtenDivisionOf(ex as FillExercise));
      }
    }
  });
});

describe('dzielenie pisemne: tematy, lekcje i ściągi', () => {
  const topics = MATH_GRADE5.filter((t) => t.id.startsWith('b-m5-dzp'));

  it('są trzy tematy, na początku matematyki klasy 5', () => {
    expect(topics.map((t) => t.id)).toEqual(['b-m5-dzp-1', 'b-m5-dzp-zero', 'b-m5-dzp-2cyfr']);
    const first = [...MATH_GRADE5].sort((a, b) => a.order - b.order).slice(0, 3);
    expect(first.map((t) => t.id)).toEqual(topics.map((t) => t.id));
    for (const t of topics) expect(t.grades).toContain(5);
  });

  it('zadania „Oblicz pisemnie” i „Dzielimy pisemnie”: wynik i reszta zgadzają się z dzieleniem, a aplikacja wie, jaki słupek pokazać', () => {
    for (const t of topics) {
      const { exercises, errors } = parseDsl(t.dsl, t.id);
      expect(errors, t.id).toEqual([]);
      expect(exercises.length, t.id).toBeGreaterThanOrEqual(20);
      const written = exercises.filter((e): e is FillExercise => e.type === 'fill' && /^Oblicz pisemnie/.test(e.prompt));
      expect(written.length, t.id).toBeGreaterThanOrEqual(8);
      for (const ex of written) {
        const d = writtenDivisionOf(ex);
        expect(d, ex.prompt).not.toBeNull();
        const [a, b] = d!;
        const gaps = ex.parts.filter((p): p is string[] => Array.isArray(p)).map((p) => Number(p[0]));
        expect(gaps, `${a} : ${b}`).toEqual(a % b ? [Math.floor(a / b), a % b] : [a / b]);
        expect(ex.hint, `${a} : ${b}`).toBeTruthy();
        // Podpowiedź nie zdradza wyniku.
        expect(ex.hint).not.toContain(String(Math.floor(a / b)));
      }
      const guided = exercises.filter((e): e is FillExercise => e.type === 'fill' && /^Dzielimy pisemnie/.test(e.prompt));
      expect(guided.length, t.id).toBe(2);
      for (const ex of guided) {
        const [a, b] = writtenDivisionOf(ex)!;
        const d = longDivision(a, b);
        const gaps = ex.parts.filter((p): p is string[] => Array.isArray(p)).map((p) => Number(p[0]));
        const expected = d.steps.flatMap((s, i) => (i === 0 ? [s.digit, s.rest] : [s.part, s.digit, s.rest])).concat(d.remainder ? [d.quotient, d.remainder] : [d.quotient]);
        expect(gaps, `${a} : ${b}`).toEqual(expected);
      }
      // Zwykłe zadania (bez słowa „pisemnie”) nie dostają słupka.
      for (const ex of exercises.filter((e) => !/pisemnie/.test(e.prompt))) expect(writtenDivisionOf(ex as FillExercise)).toBeNull();
    }
  });

  it('zadania z treścią i sprawdzenia: odpowiedź zgadza się z działaniem w wyjaśnieniu', () => {
    for (const t of topics) {
      for (const ex of parseDsl(t.dsl, t.id).exercises) {
        if (ex.type !== 'fill' || !ex.explain) continue;
        const m = ex.explain.match(/^(\d+) : (\d+) = (\d+)(?: r (\d+))?\./);
        if (!m) continue;
        const [a, b, q, r] = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4] ?? 0)];
        expect(q * b + r, ex.prompt).toBe(a);
        expect(r, ex.prompt).toBeLessThan(b);
      }
    }
  });

  it('każdy temat ma ściągę ze słupkiem i lekcję z dwoma przykładami krok po kroku', () => {
    for (const t of topics) {
      const guide = GUIDES[t.id];
      expect(guide, t.id).toBeTruthy();
      expect(guide.split('\n').filter((l) => Array.isArray(lessonDivision(l))).length, t.id).toBe(1);
      const lesson = parseLesson(LESSONS[t.id])!;
      expect(lesson.errors, t.id).toEqual([]);
      expect(lesson.key.length, t.id).toBe(3);
      const divs = lesson.steps.map(lessonDivision).filter(Array.isArray) as [number, number][];
      expect(divs.length, t.id).toBe(2);
      expect(lesson.steps.length - divs.length, t.id).toBe(4);
      expect(lesson.pairs.length, t.id).toBeGreaterThanOrEqual(2);
      for (const p of lesson.pairs) expect(p.why, p.good).toBeTruthy();
      expect(lesson.trick.length, t.id).toBeGreaterThanOrEqual(2);
      expect(lesson.checks.length, t.id).toBe(3);
      for (const c of lesson.checks) expect(c.explain, c.prompt).toBeTruthy();
      // Przykłady z lekcji nie są zadaniami tematu.
      const tasks = parseDsl(t.dsl, t.id).exercises.map((e) => writtenDivisionOf(e as FillExercise)).filter(Boolean) as [number, number][];
      for (const [a, b] of divs) expect(tasks.some(([x, y]) => x === a && y === b), `${a} : ${b}`).toBe(false);
      const checkDiv = lesson.checks.map((e) => writtenDivisionOf(e as FillExercise)).filter(Boolean) as [number, number][];
      expect(checkDiv.length, t.id).toBe(1);
      for (const [a, b] of checkDiv) expect(tasks.some(([x, y]) => x === a && y === b), `${a} : ${b}`).toBe(false);
    }
  });

  it('linia „słupek:” w lekcji: dobra, zła i zwykły tekst', () => {
    expect(lessonDivision('słupek: 936 : 4')).toEqual([936, 4]);
    expect(lessonDivision('Słupek:864:24')).toEqual([864, 24]);
    expect(lessonDivision('słupek: 936 / 4')).toBe(false);
    expect(lessonDivision('słupek: 936 : 0')).toBe(false);
    expect(lessonDivision('Spisz następną cyfrę.')).toBeNull();
    const bad = parseLesson('# Krok po kroku\nsłupek: dziewięć : 4')!;
    expect(bad.errors.length).toBe(1);
  });
});
