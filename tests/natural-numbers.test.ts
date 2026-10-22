import { describe, expect, it } from 'vitest';
import { BUILTIN_TOPICS } from '../src/content/seed';
import { MATH_NATURAL5, NATURAL_NUMBERS_UNIT, isPrime, positiveDivisors, primeFactors } from '../src/content/naturalNumbers5';
import { chapterExamFor, NATURAL_NUMBERS_EXAMS } from '../src/content/chapterExams';
import { exerciseToDsl, lessonListParts, LIST_BUDGET, parseDsl, parseLesson } from '../src/dsl';
import { isCorrect } from '../src/ui/exercises/logic';
import type { Exercise, ParsedTopic } from '../src/types';

const topics: ParsedTopic[] = MATH_NATURAL5.map((t) => ({ ...t, builtin: true, ...parseDsl(t.dsl) }));
const bruteDivisors = (n: number) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => Number.isInteger(n / d));
const body = (e: Exercise) => exerciseToDsl({ ...e, explain: undefined, hint: undefined });
const correctNumbers = (e: Exercise) => e.type === 'fill' ? e.parts.filter((p): p is string[] => Array.isArray(p)).map((p) => Number(p[0])) : [];

describe('matematyka klasa 5: własności liczb naturalnych ze skanu', () => {
  it('obejmuje siedem tematów w kolejności podręcznika i jest dostępna tylko dla klasy 5', () => {
    expect(topics.map((t) => t.title)).toEqual([
      'Cechy podzielności przez 2, 5, 10, 100 i 4', 'Cechy podzielności przez 3 i 9', 'Dzielniki',
      'Liczby pierwsze i złożone', 'Rozkład liczby na czynniki pierwsze', 'Największy wspólny dzielnik', 'Najmniejsza wspólna wielokrotność',
    ]);
    for (const t of topics) {
      expect(t.unit).toBe(NATURAL_NUMBERS_UNIT);
      expect(t.grades).toEqual([5]);
      expect(BUILTIN_TOPICS.find((b) => b.id === t.id)?.dsl).toBe(t.dsl);
      expect(t.errors).toEqual([]);
      expect(t.exercises).toHaveLength(28);
      expect(t.exercises.filter((e) => e.type === 'fill').length).toBeGreaterThanOrEqual(4);
      expect(t.exercises.every((e) => e.explain)).toBe(true);
    }
  });
  it('196 ćwiczeń i 21 pytań kontrolnych nie powtarza tej samej treści; lekcje mają przykłady, metody i typowe błędy', () => {
    const all: string[] = [];
    for (const t of topics) {
      const lesson = parseLesson(t.lesson)!;
      expect(lesson.errors, t.title).toEqual([]);
      expect(lesson.key).toHaveLength(3);
      expect(lesson.pairs).toHaveLength(3);
      expect(lesson.pairs.every((p) => p.why)).toBe(true);
      expect(lesson.steps.some((s) => s.startsWith('Przykład:'))).toBe(true);
      expect(lesson.trick.length).toBeGreaterThanOrEqual(1);
      expect(lesson.checks).toHaveLength(3);
      expect(lesson.checks.every((e) => e.explain)).toBe(true);
      all.push(...t.exercises.map(body), ...lesson.checks.map(body));
      for (const list of lesson.lists) for (const [a, b] of lessonListParts(list)) {
        const size = list.items.slice(a, b).reduce((s, item) => s + item.head.length + item.text.length + 70, 0);
        expect(size, `${t.title}: ${list.title}`).toBeLessThanOrEqual(LIST_BUDGET);
      }
    }
    expect(all).toHaveLength(217);
    expect(new Set(all).size).toBe(all.length);
  });
  it('dzielniki, pierwszość i rozkłady zgadzają się z niezależnym przeglądem wszystkich kandydatów', () => {
    expect(isPrime(0)).toBe(false);
    expect(isPrime(1)).toBe(false);
    for (let n = 1; n <= 250; n++) {
      const divisors = bruteDivisors(n);
      expect(positiveDivisors(n), String(n)).toEqual(divisors);
      expect(isPrime(n), String(n)).toBe(divisors.length === 2);
      if (n > 1) {
        const factors = primeFactors(n);
        expect(factors.reduce((a, b) => a * b, 1)).toBe(n);
        expect(factors.every((f) => bruteDivisors(f).length === 2)).toBe(true);
      }
    }
    expect(() => positiveDivisors(0)).toThrow();
    expect(() => primeFactors(1)).toThrow();
  });
  it('wyniki w treści zadań o NWD, NWW, dzielnikach, pierwszości i czynnikach są poprawne', () => {
    for (const t of topics) for (const ex of [...t.exercises, ...parseLesson(t.lesson)!.checks]) {
      const numbers = correctNumbers(ex);
      if (ex.type === 'choice') {
        const divisible = ex.prompt.match(/^Czy (\d+) jest podzielne przez (\d+)\?/);
        if (divisible) expect(ex.options[ex.correct]).toBe(Number(divisible[1]) % Number(divisible[2]) === 0 ? 'Tak' : 'Nie');
        const classification = ex.prompt.match(/^Jaką liczbą jest (\d+)\?/);
        if (classification) {
          const n = Number(classification[1]);
          expect(ex.options[ex.correct]).toBe(n < 2 ? 'ani pierwsza, ani złożona' : bruteDivisors(n).length === 2 ? 'pierwsza' : 'złożona');
        }
      }
      const factor = ex.prompt.match(/^Rozłóż (\d+) na czynniki pierwsze/);
      if (factor) {
        expect(numbers.reduce((a, b) => a * b, 1)).toBe(Number(factor[1]));
        expect(numbers.every((n) => bruteDivisors(n).length === 2)).toBe(true);
      }
      const divisor = ex.prompt.match(/^Ile dodatnich dzielników ma liczba (\d+)/);
      if (divisor && ex.type === 'fill') expect(numbers).toEqual([bruteDivisors(Number(divisor[1])).length]);
      const pair = ex.prompt.match(/^Oblicz (największy wspólny dzielnik|najmniejszą wspólną wielokrotność) liczb (\d+) i (\d+)/);
      if (pair) {
        const a = Number(pair[2]), b = Number(pair[3]);
        const expected = pair[1].startsWith('największy') ? Math.max(...bruteDivisors(a).filter((d) => b % d === 0)) :
          Array.from({ length: a * b }, (_, i) => i + 1).find((n) => n % a === 0 && n % b === 0);
        expect(numbers, ex.prompt).toEqual([expected]);
      }
      const digit = ex.prompt.match(/^W liczbie (\d*□\d*) zastąp □.*podzielna (.+)\. Wpisz/);
      if (digit) {
        const [required, forbidden] = digit[2].split(', ale nie ');
        const ds = [...required.matchAll(/przez (\d+)/g)].map((m) => Number(m[1]));
        const ns = [...(forbidden ?? '').matchAll(/przez (\d+)/g)].map((m) => Number(m[1]));
        const expected = Array.from({ length: 10 }, (_, i) => i).filter((d) => {
          const n = Number(digit[1].replace('□', String(d)));
          return ds.every((v) => Number.isInteger(n / v)) && ns.every((v) => !Number.isInteger(n / v));
        });
        expect(numbers, ex.prompt).toEqual(expected);
      }
    }
    const primeAnswer = topics.flatMap((t) => t.exercises).find((e) => e.prompt.startsWith('Podaj jedną liczbę pierwszą większą od 50'))!;
    expect(isCorrect(primeAnswer, ['53'])).toBe(true);
    expect(isCorrect(primeAnswer, ['59'])).toBe(true);
    expect(isCorrect(primeAnswer, ['57'])).toBe(false);
  });
  it('warianty A i B mają po 28 innych pytań, po cztery z każdego tematu', () => {
    const exam = chapterExamFor('mat', topics)!;
    expect(exam.topicCount).toBe(7);
    expect(exam.variants).toHaveLength(2);
    const ids: string[] = [];
    for (const variant of exam.variants) {
      expect(variant.items).toHaveLength(28);
      for (const t of topics) expect(variant.items.filter((item) => item.topicId === t.id)).toHaveLength(4);
      for (const item of variant.items) expect(topics.find((t) => t.id === item.topicId)?.exercises.some((e) => e.id === item.exerciseId)).toBe(true);
      ids.push(...variant.items.map((item) => item.exerciseId));
    }
    expect(new Set(ids).size).toBe(56);
    expect(exam.variants).toEqual(NATURAL_NUMBERS_EXAMS);
  });
  it('wyłączenia rodzica wykluczają dany wariant, a niepełny rozdział wraca do losowania', () => {
    const disable = (variants: number[]) => topics.map((t) => ({ ...t, exercises: t.exercises.filter((e) =>
      !variants.some((v) => NATURAL_NUMBERS_EXAMS[v].items[0].exerciseId === e.id)) }));
    expect(chapterExamFor('mat', disable([0]))?.variants.map((v) => v.id)).toEqual(['B']);
    expect(chapterExamFor('mat', disable([0, 1]))).toBeUndefined();
    expect(chapterExamFor('mat', topics.slice(1))).toBeUndefined();
    expect(chapterExamFor('his', topics)).toBeUndefined();
    expect(chapterExamFor('ang', topics)).toBeUndefined();
  });
});
