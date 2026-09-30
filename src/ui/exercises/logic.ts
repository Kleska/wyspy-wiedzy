import { isFillAnswerCorrect } from '../../dsl';
import type { Exercise } from '../../types';

export type Answer = number | null | number[] | (number | null)[] | string[];

export function initialAnswer(ex: Exercise): Answer {
  switch (ex.type) {
    case 'choice':
      return null;
    case 'tap':
      return [];
    case 'sort':
      return ex.items.map(() => null);
    case 'fill':
      return ex.parts.filter((p) => Array.isArray(p)).map(() => '');
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
    case 'fill': {
      const gaps = ex.parts.filter((p): p is string[] => Array.isArray(p));
      return gaps.every((g, i) => isFillAnswerCorrect((a as string[])[i] ?? '', g));
    }
    case 'match':
      return ex.pairs.every((_, i) => (a as number[])[i] === i);
  }
}

/** Krótki tekst poprawnej odpowiedzi do pokazania po błędzie (gdy nie widać go na planszy). */
export function correctText(ex: Exercise): string {
  switch (ex.type) {
    case 'choice':
      return ex.options[ex.correct];
    case 'tap':
      return ex.correct.map((i) => ex.tokens[i].replace(/[^\p{L}\p{N}\s-]/gu, '')).join(', ');
    case 'fill':
      return ex.parts
        .filter((p): p is string[] => Array.isArray(p))
        .map((g) => g[0])
        .join(', ');
    case 'sort':
      return ex.categories.map((c, ci) => `${c}: ${ex.items.filter((it) => it.cat === ci).map((it) => it.text).join(', ')}`).join(' · ');
    case 'match':
      return ex.pairs.map(([l, r]) => `${l} – ${r}`).join(' · ');
  }
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
export function exerciseSummary(ex: Exercise): string {
  switch (ex.type) {
    case 'choice':
      return ex.sentence ? ex.sentence.replace(/[{}]/g, '') : ex.options.join(' / ');
    case 'tap':
      return ex.tokens.join(' ');
    case 'fill':
      return ex.parts.map((p) => (Array.isArray(p) ? '___' : p)).join('');
    case 'sort':
      return ex.items.map((i) => i.text).join(', ');
    case 'match':
      return ex.pairs.map(([l, r]) => `${l} – ${r}`).join(', ');
  }
}
