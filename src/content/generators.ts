import { parseLine } from '../dsl';
import type { FillExercise } from '../types';
import { dec, evalSchool, gcd } from './math';

/*
 * Trening bez końca: zadania losowane przy każdym ćwiczeniu (wyniki liczone w kodzie).
 * Każdy generator zwraca jedną linię w formacie zadań: „wpisz: … [wynik] !! wyjaśnienie”.
 */

export interface Generator {
  id: string;
  title: string;
  description: string;
  grades: number[];
  make: (rnd: () => number) => string;
}

const int = (rnd: () => number, a: number, b: number) => a + Math.floor(rnd() * (b - a + 1));
const pick = <T,>(rnd: () => number, arr: T[]): T => arr[Math.floor(rnd() * arr.length)];

function addSub20(rnd: () => number): string {
  if (rnd() < 0.5) {
    const a = int(rnd, 2, 18);
    const b = int(rnd, 1, 20 - a);
    return `wpisz: Oblicz. >> ${a} + ${b} = [${a + b}] !! ${a} + ${b} = ${a + b}.`;
  }
  const a = int(rnd, 6, 20);
  const b = int(rnd, 1, a - 1);
  return `wpisz: Oblicz. >> ${a} − ${b} = [${a - b}] !! ${a} − ${b} = ${a - b}, bo ${a - b} + ${b} = ${a}.`;
}

function addSub100(rnd: () => number): string {
  if (rnd() < 0.5) {
    const a = int(rnd, 12, 79);
    let b = int(rnd, 11, 99 - a);
    if (b % 10 === 0) b++;
    const tens = b - (b % 10);
    return `wpisz: Oblicz. >> ${a} + ${b} = [${a + b}] !! ${a} + ${tens} = ${a + tens}, potem ${a + tens} + ${b % 10} = ${a + b}.`;
  }
  const a = int(rnd, 31, 100);
  let b = int(rnd, 11, a - 6);
  if (b % 10 === 0) b--;
  const tens = b - (b % 10);
  return `wpisz: Oblicz. >> ${a} − ${b} = [${a - b}] !! ${a} − ${tens} = ${a - tens}, potem ${a - tens} − ${b % 10} = ${a - b}.`;
}

/** Jedno działanie z tabliczki — ta sama linia daje ten sam identyfikator zadania (mapa tabliczki). */
export function mulLine(a: number, b: number): string {
  return `wpisz: Oblicz. >> ${a} · ${b} = [${a * b}] !! ${a} · ${b} = ${a * b}.`;
}

function mulTable(rnd: () => number): string {
  return mulLine(int(rnd, 2, 10), int(rnd, 2, 10));
}

function divTable(rnd: () => number): string {
  const b = int(rnd, 2, 10);
  const q = int(rnd, 2, 10);
  return `wpisz: Oblicz. >> ${b * q} : ${b} = [${q}] !! Bo ${q} · ${b} = ${b * q}.`;
}

function mulMental(rnd: () => number): string {
  let a = int(rnd, 12, 49);
  if (a % 10 === 0) a++;
  const b = int(rnd, 3, 9);
  const t = a - (a % 10);
  return `wpisz: Oblicz w pamięci. >> ${a} · ${b} = [${a * b}] !! ${t} · ${b} + ${a % 10} · ${b} = ${t * b} + ${(a % 10) * b} = ${a * b}.`;
}

function fracSimplify(rnd: () => number): string {
  let n = 1;
  let d = 2;
  do {
    d = int(rnd, 2, 10);
    n = int(rnd, 1, d - 1);
  } while (gcd(n, d) !== 1);
  const k = int(rnd, 2, 6);
  return `wpisz: Skróć ułamek do najprostszej postaci. >> ${n * k}/${d * k} = [${n}/${d}] !! Podziel licznik i mianownik przez ${k}.`;
}

function decimals(rnd: () => number): string {
  const a = int(rnd, 12, 950);
  const b = int(rnd, 12, 950);
  if (rnd() < 0.5) return `wpisz: Oblicz. >> ${dec(a)} + ${dec(b)} = [${dec(a + b)}] !! Zapisz liczby przecinek pod przecinkiem i dodaj.`;
  const [x, y] = a >= b ? [a, b] : [b, a];
  return `wpisz: Oblicz. >> ${dec(x)} − ${dec(y)} = [${dec(x - y)}] !! Zapisz liczby przecinek pod przecinkiem i odejmij.`;
}

function orderOps(rnd: () => number): string {
  for (;;) {
    const a = int(rnd, 2, 20);
    const b = int(rnd, 2, 9);
    const c = int(rnd, 2, 9);
    const e = pick(rnd, [`${a} + ${b} · ${c}`, `(${a} + ${b}) · ${c}`, `${a * c} : ${c} + ${b}`, `${a} · ${b} − ${c}`, `${a + b * c} − ${b} · ${c}`, `(${a} − ${b}) · ${c}`]);
    const v = evalSchool(e);
    if (!Number.isInteger(v) || v < 0) continue;
    const why = /\(/.test(e) ? 'Najpierw działanie w nawiasie.' : 'Najpierw mnożenie i dzielenie, potem dodawanie i odejmowanie.';
    return `wpisz: Oblicz. >> ${e} = [${v}] !! ${why}`;
  }
}

export const GENERATORS: Generator[] = [
  { id: 'add20', title: 'Dodawanie i odejmowanie do 20', description: 'Rachunki w pamięci do 20.', grades: [1, 2], make: addSub20 },
  { id: 'add100', title: 'Dodawanie i odejmowanie do 100', description: 'Najpierw dziesiątki, potem jedności.', grades: [2, 3, 4], make: addSub100 },
  { id: 'mul', title: 'Tabliczka mnożenia', description: 'Mnożenie do 10 · 10.', grades: [2, 3, 4, 5, 6, 7, 8], make: mulTable },
  { id: 'div', title: 'Dzielenie', description: 'Dzielenie w zakresie tabliczki mnożenia.', grades: [3, 4, 5, 6, 7, 8], make: divTable },
  { id: 'mul2', title: 'Mnożenie w pamięci', description: 'Np. 23 · 4 = 80 + 12.', grades: [4, 5, 6, 7, 8], make: mulMental },
  { id: 'frac', title: 'Skracanie ułamków', description: 'Dziel licznik i mianownik przez tę samą liczbę.', grades: [4, 5, 6, 7, 8], make: fracSimplify },
  { id: 'dec', title: 'Ułamki dziesiętne', description: 'Dodawanie i odejmowanie.', grades: [5, 6, 7, 8], make: decimals },
  { id: 'order', title: 'Kolejność działań', description: 'Nawiasy, potem mnożenie i dzielenie.', grades: [4, 5, 6, 7, 8], make: orderOps },
];

export const genTopicId = (id: string) => `gen:${id}`;

/** Wszystkie działania tabliczki 1–10 jako zadania generatora „mul” (do mapy tabliczki). */
export function allMulExercises(): { topicId: string; ex: FillExercise }[] {
  const out: { topicId: string; ex: FillExercise }[] = [];
  for (let a = 1; a <= 10; a++)
    for (let b = 1; b <= 10; b++) {
      const { ex } = parseLine(mulLine(a, b), 1);
      if (ex?.type === 'fill') out.push({ topicId: genTopicId('mul'), ex });
    }
  return out;
}

/** Zadania dla wybranych działań (ćwiczenie najsłabszych z mapy tabliczki). */
export function factExercises(facts: [number, number][]): FillExercise[] {
  return facts.flatMap(([a, b]) => {
    const { ex } = parseLine(mulLine(a, b), 1);
    return ex?.type === 'fill' ? [ex] : [];
  });
}

export function generatorById(id: string): Generator | undefined {
  return GENERATORS.find((g) => g.id === id);
}

export function generatorsFor(grade: number): Generator[] {
  return GENERATORS.filter((g) => g.grades.includes(grade));
}

/** n różnych zadań z generatora. */
export function generateExercises(gen: Generator, n: number, rnd: () => number = Math.random): FillExercise[] {
  const out: FillExercise[] = [];
  const seen = new Set<string>();
  for (let guard = 0; out.length < n && guard < n * 20; guard++) {
    const { ex } = parseLine(gen.make(rnd), 1);
    if (!ex || ex.type !== 'fill' || seen.has(ex.id)) continue;
    seen.add(ex.id);
    out.push(ex);
  }
  return out;
}
