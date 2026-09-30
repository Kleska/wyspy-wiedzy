import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BUILTIN_TOPICS } from '../src/content/seed';
import { exerciseToDsl, isFillAnswerCorrect, parseDsl, parseLine, parseTapSentence } from '../src/dsl';
import { parsePastedAnswer } from '../src/ai';
import { correctText, initialAnswer, isCorrect, isReady } from '../src/ui/exercises/logic';
import type { Exercise } from '../src/types';

describe('tematy wbudowane', () => {
  for (const t of BUILTIN_TOPICS) {
    it(`${t.title} — parsuje się bez błędów`, () => {
      const { exercises, errors } = parseDsl(t.dsl);
      expect(errors).toEqual([]);
      expect(exercises.length).toBeGreaterThanOrEqual(10);
    });
  }

  it('identyfikatory tematów są unikalne', () => {
    const ids = BUILTIN_TOPICS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('format tekstowy', () => {
  it('wybierz ze zdaniem i wyjaśnieniem', () => {
    const { ex } = parseLine('wybierz: W jakim czasie? >> Wczoraj {pojechałem}. | *przeszłym | teraźniejszym | przyszłym !! Bo wczoraj.', 1);
    expect(ex).toMatchObject({ type: 'choice', prompt: 'W jakim czasie?', sentence: 'Wczoraj {pojechałem}.', correct: 0, explain: 'Bo wczoraj.' });
  });

  it('kliknij z interpunkcją i kilkoma słowami', () => {
    const r = parseTapSentence('Rano *wstaję*, *myję* zęby i „*jem*” śniadanie.');
    expect(r.tokens).toEqual(['Rano', 'wstaję,', 'myję', 'zęby', 'i', '„jem”', 'śniadanie.']);
    expect(r.correct).toEqual([1, 2, 5]);
  });

  it('sortuj, wpisz, pary', () => {
    const { exercises, errors } = parseDsl(
      [
        'sortuj: Posegreguj >> rzeczownik = kot, dom ; czasownik = biega, pisze',
        'wpisz: Uzupełnij >> Ola [czytała|przeczytała] książkę, a Tomek [pisał].',
        'pary: Połącz >> 6 · 4 = 24 ; 7 · 5 = 35',
      ].join('\n'),
    );
    expect(errors).toEqual([]);
    expect(exercises[0]).toMatchObject({ type: 'sort', categories: ['rzeczownik', 'czasownik'] });
    expect(exercises[1]).toMatchObject({ type: 'fill', parts: ['Ola ', ['czytała', 'przeczytała'], ' książkę, a Tomek ', ['pisał'], '.'] });
    expect(exercises[2]).toMatchObject({ type: 'match', pairs: [['6 · 4', '24'], ['7 · 5', '35']] });
  });

  it('zgłasza czytelne błędy', () => {
    const { errors } = parseDsl(['wybierz: Pytanie | a | b', 'kliknij: Brak gwiazdek >> Ala ma kota.', 'coś: nie wiem', 'wpisz: Bez luki >> tekst'].join('\n'));
    expect(errors.map((e) => e.line)).toEqual([1, 2, 3, 4]);
    expect(errors[0].message).toContain('gwiazdką');
  });

  it('zapis → odczyt daje to samo zadanie (wszystkie tematy)', () => {
    for (const t of BUILTIN_TOPICS) {
      for (const ex of parseDsl(t.dsl).exercises) {
        const again = parseLine(exerciseToDsl(ex), 1).ex as Exercise;
        expect(again).toEqual(ex);
      }
    }
  });

  it('sprawdzanie luk: wielkość liter i kropka nie przeszkadzają, polskie znaki tak', () => {
    expect(isFillAnswerCorrect(' Piszą. ', ['piszą'])).toBe(true);
    expect(isFillAnswerCorrect('pisza', ['piszą'])).toBe(false);
    expect(isFillAnswerCorrect('', ['x'])).toBe(false);
  });
});

describe('logika odpowiedzi', () => {
  const all = BUILTIN_TOPICS.flatMap((t) => parseDsl(t.dsl).exercises);

  it('pusta odpowiedź nie jest gotowa, poprawna jest poprawna', () => {
    for (const ex of all) {
      const empty = initialAnswer(ex);
      expect(isReady(ex, empty)).toBe(false);
      let good: unknown;
      switch (ex.type) {
        case 'choice':
          good = ex.correct;
          break;
        case 'tap':
          good = ex.correct;
          break;
        case 'sort':
          good = ex.items.map((i) => i.cat);
          break;
        case 'fill':
          good = ex.parts.filter((p) => Array.isArray(p)).map((p) => (p as string[])[0]);
          break;
        case 'match':
          good = ex.pairs.map((_, i) => i);
          break;
      }
      expect(isReady(ex, good as never)).toBe(true);
      expect(isCorrect(ex, good as never)).toBe(true);
      expect(correctText(ex).length).toBeGreaterThan(0);
    }
  });

  it('za mało zaznaczonych słów to błąd', () => {
    const ex = parseLine('kliknij: K >> *Kasia* *śpiewa* głośno.', 1).ex!;
    expect(isCorrect(ex, [0])).toBe(false);
    expect(isCorrect(ex, [0, 1, 2])).toBe(false);
  });
});

describe('AI', () => {
  it('rozpoznaje odpowiedź wklejoną z czatu', () => {
    const r = parsePastedAnswer('TYTUŁ: Czasowniki\nZASADA: Co robi?\n```\nwybierz: A? | *a | b\nkliknij: K >> *x* y\n```');
    expect(r).toEqual({ title: 'Czasowniki', description: 'Co robi?', dsl: 'wybierz: A? | *a | b\nkliknij: K >> *x* y' });
  });

  it('funkcja w chmurze i aplikacja używają tego samego pliku z poleceniem', () => {
    const fn = readFileSync(new URL('../supabase/functions/ai/index.ts', import.meta.url), 'utf8');
    expect(fn).toContain("from './prompt.ts'");
  });
});
