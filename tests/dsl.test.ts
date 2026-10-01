import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BUILTIN_TOPICS } from '../src/content/seed';
import { evalSchool } from '../src/content/math';
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

  it('liczby dziesiętne i ułamki: kropka = przecinek, zbędne zera, spacje przy kresce ułamkowej', () => {
    expect(isFillAnswerCorrect('3.75', ['3,75'])).toBe(true);
    expect(isFillAnswerCorrect('3,750', ['3,75'])).toBe(true);
    expect(isFillAnswerCorrect('5,0', ['5'])).toBe(true);
    expect(isFillAnswerCorrect('3 / 4', ['3/4'])).toBe(true);
    expect(isFillAnswerCorrect('34', ['3,4'])).toBe(false);
    expect(isFillAnswerCorrect('10', ['1'])).toBe(false);
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
        case 'dictation':
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

describe('matematyka', () => {
  it('parser wyrażeń liczy jak w szkole', () => {
    expect(evalSchool('2 + 3 · 4')).toBe(14);
    expect(evalSchool('(15 − 6) · (2 + 3)')).toBe(45);
    expect(evalSchool('2 · (9 − 4) : 5')).toBe(2);
  });

  it('w zadaniach z wyborem o podzielności dokładnie jedna odpowiedź jest podzielna', () => {
    const t = BUILTIN_TOPICS.find((x) => x.id === 'b-m5-podzielnosc')!;
    for (const ex of parseDsl(t.dsl).exercises) {
      if (ex.type !== 'choice') continue;
      const d = Number(ex.prompt.match(/przez (\d+)/)![1]);
      ex.options.forEach((o, i) => expect(Number(o) % d === 0).toBe(i === ex.correct));
    }
  });

  it('każdy temat ma przypisane klasy', () => {
    for (const t of BUILTIN_TOPICS) expect(t.grades?.length).toBeGreaterThan(0);
  });
});

describe('AI', () => {
  it('rozpoznaje odpowiedź wklejoną z czatu', () => {
    const r = parsePastedAnswer('TYTUŁ: Czasowniki\nZASADA: Co robi?\n```\nwybierz: A? | *a | b\nkliknij: K >> *x* y\n```');
    expect(r).toEqual({ title: 'Czasowniki', description: 'Co robi?', dsl: 'wybierz: A? | *a | b\nkliknij: K >> *x* y' });
  });

  it('wklejona odpowiedź ze ściągą i dyktandem', () => {
    const r = parsePastedAnswer('TYTUŁ: Ó i u\nZASADA: Ó wymienne.\nŚCIĄGA:\nWóz – wozy.\nKupuje — końcówka -uje.\n```\ndyktando: P >> Mamy nowy [wóz].\n```');
    expect(r.guide).toBe('Wóz – wozy.\nKupuje — końcówka -uje.');
    expect(r.dsl).toBe('dyktando: P >> Mamy nowy [wóz].');
  });

  it('funkcja w chmurze i aplikacja używają tego samego pliku z poleceniem', () => {
    const fn = readFileSync(new URL('../supabase/functions/ai/index.ts', import.meta.url), 'utf8');
    expect(fn).toContain("from './prompt.ts'");
  });
});

describe('dyktando, ściągi i generatory', () => {
  it('dyktando: parsowanie, sprawdzanie, zapis i maska podpowiedzi', async () => {
    const { maskSpelling, dictationText } = await import('../src/dsl');
    const { ex } = parseLine('dyktando: Posłuchaj. >> Latem jedziemy nad [morze]. !! Bo morski.', 1);
    expect(ex?.type).toBe('dictation');
    if (ex?.type !== 'dictation') return;
    expect(dictationText(ex.parts)).toBe('Latem jedziemy nad morze.');
    expect(isCorrect(ex, ['morze'])).toBe(true);
    expect(isCorrect(ex, ['może'])).toBe(false);
    expect(isCorrect(ex, ['Morze'])).toBe(true);
    expect(correctText(ex)).toBe('morze');
    expect(parseLine(exerciseToDsl(ex), 1).ex).toEqual(ex);
    expect(maskSpelling('żółw')).toBe('__łw');
    expect(maskSpelling('chrząszcz')).toBe('__ąszcz');
    expect(maskSpelling('ogórek')).toBe('og_rek');
  });

  it('każdy temat wbudowany ma ściągę', () => {
    for (const t of BUILTIN_TOPICS) expect(t.guide, t.id).toBeTruthy();
  });

  it('generatory: poprawne zadania z dobrym wynikiem', async () => {
    const { GENERATORS, generateExercises } = await import('../src/content/generators');
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (const g of GENERATORS) {
      const exs = generateExercises(g, 40, rnd);
      expect(exs.length, g.id).toBe(40);
      for (const ex of exs) {
        const text = ex.parts.filter((p) => typeof p === 'string').join('').replace(/=\s*$/, '').trim();
        const ans = (ex.parts.find((p) => Array.isArray(p)) as string[])[0];
        if (g.id === 'frac') {
          const [a, b] = text.split('/').map(Number);
          const [c, d] = ans.split('/').map(Number);
          expect(a * d, text).toBe(b * c);
          expect(gcdT(c, d)).toBe(1);
        } else if (g.id === 'dec') {
          const v = text.split(/\s+/);
          const x = Number(v[0].replace(',', '.'));
          const y = Number(v[2].replace(',', '.'));
          const r = v[1] === '+' ? x + y : x - y;
          expect(Number(ans.replace(',', '.')), text).toBeCloseTo(r, 6);
        } else {
          expect(String(evalSchool(text)), text).toBe(ans);
        }
      }
    }
  });
});

function gcdT(a: number, b: number): number {
  return b ? gcdT(b, a % b) : a;
}
