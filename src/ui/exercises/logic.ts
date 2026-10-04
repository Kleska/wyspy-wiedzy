import { isFillAnswerCorrect } from '../../dsl';
import type { Exercise } from '../../types';

export type Answer = number | null | number[] | (number | null)[] | string[];

const gapsOf = (parts: (string | string[])[]) => parts.filter((p): p is string[] => Array.isArray(p));

export function initialAnswer(ex: Exercise): Answer {
  switch (ex.type) {
    case 'choice':
      return null;
    case 'tap':
      return [];
    case 'sort':
      return ex.items.map(() => null);
    case 'fill':
    case 'dictation':
      return gapsOf(ex.parts).map(() => '');
    case 'match':
      return ex.pairs.map(() => -1);
  }
}

export function isReady(ex: Exercise, a: Answer): boolean {
  switch (ex.type) {
    case 'choice':
      return a !== null;
    case 'tap':
      return (a as number[]).length > 0;
    case 'sort':
      return (a as (number | null)[]).every((v) => v !== null);
    case 'fill':
    case 'dictation':
      return (a as string[]).every((v) => v.trim().length > 0);
    case 'match':
      return (a as number[]).every((v) => v >= 0);
  }
}

export function isCorrect(ex: Exercise, a: Answer): boolean {
  switch (ex.type) {
    case 'choice':
      return a === ex.correct;
    case 'tap': {
      const sel = new Set(a as number[]);
      return sel.size === ex.correct.length && ex.correct.every((i) => sel.has(i));
    }
    case 'sort':
      return ex.items.every((it, i) => (a as (number | null)[])[i] === it.cat);
    case 'fill':
    case 'dictation':
      return gapsOf(ex.parts).every((g, i) => isFillAnswerCorrect((a as string[])[i] ?? '', g));
    case 'match':
      return ex.pairs.every((_, i) => (a as number[])[i] === i);
  }
}

/** Słowo bez interpunkcji na brzegach („wstaję,” → „wstaję”, ale „3,5” zostaje). */
const clean = (t: string) => t.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');

/** Krótki tekst poprawnej odpowiedzi do pokazania po błędzie (gdy nie widać go na planszy). */
export function correctText(ex: Exercise): string {
  switch (ex.type) {
    case 'choice':
      return ex.options[ex.correct];
    case 'tap':
      return ex.correct.map((i) => clean(ex.tokens[i])).join(', ');
    case 'fill':
    case 'dictation':
      return gapsOf(ex.parts)
        .map((g) => g[0])
        .join(', ');
    case 'sort':
      return ex.categories.map((c, ci) => `${c}: ${ex.items.filter((it) => it.cat === ci).map((it) => it.text).join(', ')}`).join(' · ');
    case 'match':
      return ex.pairs.map(([l, r]) => `${l} – ${r}`).join(' · ');
  }
}

/** Co dziecko odpowiedziało — krótko, do raportu dla rodzica i przeglądu sprawdzianu. */
export function answerText(ex: Exercise, a: Answer): string {
  let s = '';
  switch (ex.type) {
    case 'choice':
      s = typeof a === 'number' ? ex.options[a] ?? '' : '';
      break;
    case 'tap':
      s = (a as number[]).map((i) => clean(ex.tokens[i] ?? '')).join(', ');
      break;
    case 'fill':
    case 'dictation':
      s = (a as string[]).map((v) => v.trim() || '…').join(', ');
      break;
    case 'sort':
      s = ex.items
        .map((it, i) => ({ it, cat: (a as (number | null)[])[i] }))
        .filter(({ it, cat }) => cat !== it.cat)
        .map(({ it, cat }) => `${it.text} → ${cat === null || cat === undefined ? '?' : ex.categories[cat]}`)
        .join(', ');
      break;
    case 'match':
      s = ex.pairs
        .map(([l], i) => ({ l, r: (a as number[])[i] }))
        .filter(({ r }, i) => r !== i)
        .map(({ l, r }) => `${l} – ${r >= 0 ? ex.pairs[r][1] : '?'}`)
        .join(', ');
      break;
  }
  return s.slice(0, 200);
}

/** Deterministyczne tasowanie (to samo zadanie = ta sama kolejność w trakcie odpowiedzi). */
export function seededOrder(n: number, seed: string): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const rnd = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Jednolinijkowy opis zadania (dla rodzica). */
/** Treść pytania w jednej linii (do listy błędów po sprawdzianie i w panelu rodzica). */
export function questionText(ex: Exercise): string {
  if (ex.type === 'dictation') return ex.parts.map((p) => (Array.isArray(p) ? '___' : p)).join('');
  if (ex.type === 'match') return ex.pairs.map((p) => p[0]).join(', ');
  return exerciseSummary(ex);
}

export function exerciseSummary(ex: Exercise): string {
  switch (ex.type) {
    case 'choice':
      return ex.sentence ? ex.sentence.replace(/[{}]/g, '') : ex.options.join(' / ');
    case 'tap':
      return ex.tokens.join(' ');
    case 'fill':
      return ex.parts.map((p) => (Array.isArray(p) ? '___' : p)).join('').replace(/ \/\/ /g, ' ');
    case 'dictation':
      return ex.parts.map((p) => (Array.isArray(p) ? `[${p[0]}]` : p)).join('').replace(/ \/\/ /g, ' ');
    case 'sort':
      return ex.items.map((i) => i.text).join(', ');
    case 'match':
      return ex.pairs.map(([l, r]) => `${l} – ${r}`).join(', ');
  }
}
