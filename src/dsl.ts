import type { DslError, Exercise, ExerciseType } from './types';

/*
 * Prosty format tekstowy zadań — jedno zadanie w jednej linii.
 *
 *   wybierz: Polecenie >> Zdanie z {wyróżnieniem} lub ___ | *dobra | zła | zła !! wyjaśnienie
 *   kliknij: Polecenie >> Mama *piecze* ciasto. !! wyjaśnienie
 *   sortuj:  Polecenie >> rzeczownik = kot, dom ; czasownik = biega, pisze
 *   wpisz:   Polecenie >> Wczoraj Ola [czytała|przeczytała] książkę.
 *   pary:    Polecenie >> ja = piszę ; ty = piszesz ; oni = piszą
 *   dyktando: Polecenie >> Latem jedziemy nad [morze].   (aplikacja czyta całe zdanie na głos)
 *
 * Linie zaczynające się od # to komentarze. Część „>> …” w „wybierz” jest opcjonalna,
 * „!! …” (wyjaśnienie) wszędzie jest opcjonalne.
 */

const KEYWORDS: Record<string, ExerciseType> = {
  wybierz: 'choice',
  kliknij: 'tap',
  sortuj: 'sort',
  wpisz: 'fill',
  pary: 'match',
  dyktando: 'dictation',
  choice: 'choice',
  tap: 'tap',
  sort: 'sort',
  fill: 'fill',
  match: 'match',
  dictation: 'dictation',
};

const TYPE_KEYWORD: Record<ExerciseType, string> = {
  choice: 'wybierz',
  tap: 'kliknij',
  sort: 'sortuj',
  fill: 'wpisz',
  match: 'pary',
  dictation: 'dyktando',
};

export const TYPE_LABEL: Record<ExerciseType, string> = {
  choice: 'Wybór odpowiedzi',
  tap: 'Klikanie słów',
  sort: 'Sortowanie',
  fill: 'Uzupełnianie luk',
  match: 'Łączenie w pary',
  dictation: 'Dyktando',
};

/** FNV-1a 32-bit → base36. Stabilny identyfikator zadania z jego treści. */
export function hashId(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

function splitOnce(s: string, sep: string): [string, string | null] {
  const i = s.indexOf(sep);
  if (i < 0) return [s, null];
  return [s.slice(0, i), s.slice(i + sep.length)];
}

const LEAD_PUNCT = /^([^\p{L}\p{N}*]*)\*([\s\S]*)$/u;
const TRAIL_PUNCT = /^([\s\S]*)\*([^\p{L}\p{N}*]*)$/u;

export function parseTapSentence(sentence: string): { tokens: string[]; correct: number[] } {
  const raw = sentence.trim().split(/\s+/).filter(Boolean);
  const tokens: string[] = [];
  const correct: number[] = [];
  let inSpan = false;
  raw.forEach((tok, i) => {
    let t = tok;
    let starts = false;
    let ends = false;
    const m = t.match(LEAD_PUNCT);
    if (m) {
      starts = true;
      t = m[1] + m[2];
    }
    const n = t.match(TRAIL_PUNCT);
    if (n) {
      ends = true;
      t = n[1] + n[2];
    }
    if (starts || ends || inSpan) correct.push(i);
    if (starts && !ends) inSpan = true;
    if (ends) inSpan = false;
    tokens.push(t);
  });
  return { tokens, correct };
}

export function parseLine(raw: string, lineNo: number, idPrefix = ''): { ex?: Exercise; error?: DslError } {
  const text = raw.trim();
  const fail = (message: string) => ({ error: { line: lineNo, text, message } });
  const kw = text.match(/^([a-ząćęłńóśźż]+)\s*:\s*/i);
  if (!kw) return fail('Linia musi zaczynać się od typu: wybierz:, kliknij:, sortuj:, wpisz:, pary: albo dyktando:');
  const type = KEYWORDS[kw[1].toLowerCase()];
  if (!type) return fail(`Nieznany typ „${kw[1]}”. Użyj: wybierz, kliknij, sortuj, wpisz, pary, dyktando.`);
  let rest = text.slice(kw[0].length);

  let explain: string | undefined;
  const [body, ex] = splitOnce(rest, '!!');
  rest = body.trim();
  if (ex !== null && ex.trim()) explain = ex.trim();

  const id = idPrefix + hashId(type + '|' + rest.replace(/\s+/g, ' '));

  if (type === 'choice') {
    const segs = rest.split('|').map((s) => s.trim());
    const head = segs.shift() ?? '';
    const [prompt, sentence] = splitOnce(head, '>>');
    if (!prompt.trim()) return fail('Brakuje polecenia.');
    if (segs.length < 2) return fail('Podaj co najmniej 2 odpowiedzi rozdzielone znakiem |');
    const correctIdx = segs.map((s, i) => (s.startsWith('*') ? i : -1)).filter((i) => i >= 0);
    if (correctIdx.length !== 1) return fail('Oznacz dokładnie jedną dobrą odpowiedź gwiazdką, np. *biega');
    const options = segs.map((s) => s.replace(/^\*/, '').trim());
    if (options.some((o) => !o)) return fail('Jedna z odpowiedzi jest pusta.');
    if (new Set(options.map((o) => o.toLowerCase())).size !== options.length) return fail('Odpowiedzi się powtarzają.');
    return {
      ex: {
        id,
        type,
        prompt: prompt.trim(),
        sentence: sentence?.trim() || undefined,
        options,
        correct: correctIdx[0],
        explain,
      },
    };
  }

  const [prompt, content] = splitOnce(rest, '>>');
  if (!prompt.trim()) return fail('Brakuje polecenia.');
  if (content === null || !content.trim()) return fail('Po poleceniu dodaj „>>” i treść zadania.');
  const c = content.trim();

  if (type === 'tap') {
    const { tokens, correct } = parseTapSentence(c);
    if (tokens.length < 2) return fail('Zdanie jest za krótkie.');
    if (correct.length === 0) return fail('Oznacz dobre słowa gwiazdkami, np. Mama *piecze* ciasto.');
    if (correct.length === tokens.length) return fail('Wszystkie słowa są oznaczone — zostaw też słowa „do ominięcia”.');
    return { ex: { id, type, prompt: prompt.trim(), tokens, correct, explain } };
  }

  if (type === 'sort') {
    const groups = c.split(';').map((g) => g.trim()).filter(Boolean);
    const categories: string[] = [];
    const items: { text: string; cat: number }[] = [];
    for (const g of groups) {
      const [name, list] = splitOnce(g, '=');
      if (list === null) return fail(`Grupa „${g}” potrzebuje znaku =, np. rzeczownik = kot, dom`);
      const words = list.split(',').map((w) => w.trim()).filter(Boolean);
      if (!name.trim() || words.length === 0) return fail(`Grupa „${g}” jest pusta.`);
      categories.push(name.trim());
      words.forEach((w) => items.push({ text: w, cat: categories.length - 1 }));
    }
    if (categories.length < 2) return fail('Potrzebne są co najmniej 2 grupy rozdzielone średnikiem ;');
    if (new Set(items.map((i) => i.text.toLowerCase())).size !== items.length) return fail('Słowa w grupach się powtarzają.');
    return { ex: { id, type, prompt: prompt.trim(), categories, items, explain } };
  }

  if (type === 'fill' || type === 'dictation') {
    const parts: (string | string[])[] = [];
    const re = /\[([^\]]*)\]/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(c))) {
      if (m.index > last) parts.push(c.slice(last, m.index));
      const answers = m[1].split('|').map((a) => a.trim()).filter(Boolean);
      if (answers.length === 0) return fail('Pusta luka [ ] — wpisz w nawias poprawną odpowiedź.');
      parts.push(answers);
      last = m.index + m[0].length;
    }
    if (last < c.length) parts.push(c.slice(last));
    if (!parts.some((p) => Array.isArray(p))) return fail('Dodaj lukę w nawiasie kwadratowym, np. Ola [czyta] książkę.');
    return { ex: { id, type, prompt: prompt.trim(), parts, explain } };
  }

  // match
  const pairs: [string, string][] = [];
  for (const g of c.split(';').map((s) => s.trim()).filter(Boolean)) {
    const [l, r] = splitOnce(g, '=');
    if (r === null || !l.trim() || !r.trim()) return fail(`Para „${g}” musi mieć postać lewa = prawa`);
    pairs.push([l.trim(), r.trim()]);
  }
  if (pairs.length < 2) return fail('Potrzebne są co najmniej 2 pary rozdzielone średnikiem ;');
  if (new Set(pairs.map((p) => p[0].toLowerCase())).size !== pairs.length || new Set(pairs.map((p) => p[1].toLowerCase())).size !== pairs.length)
    return fail('Elementy par muszą być różne (bez powtórzeń po lewej i po prawej).');
  return { ex: { id, type, prompt: prompt.trim(), pairs, explain } };
}

export function parseDsl(dsl: string, idPrefix = ''): { exercises: Exercise[]; errors: DslError[] } {
  const exercises: Exercise[] = [];
  const errors: DslError[] = [];
  const seen = new Set<string>();
  dsl.split(/\r?\n/).forEach((line, i) => {
    const t = line.trim();
    if (!t || t.startsWith('#') || t.startsWith('//')) return;
    const { ex, error } = parseLine(t, i + 1, idPrefix);
    if (error) errors.push(error);
    if (ex) {
      if (seen.has(ex.id)) {
        errors.push({ line: i + 1, text: t, message: 'To zadanie już jest w temacie (duplikat).' });
        return;
      }
      seen.add(ex.id);
      exercises.push(ex);
    }
  });
  return { exercises, errors };
}

function wrapTapToken(tok: string): string {
  const m = tok.match(/^([^\p{L}\p{N}]*)([\s\S]*?)([^\p{L}\p{N}]*)$/u);
  if (!m || !m[2]) return `*${tok}*`;
  return `${m[1]}*${m[2]}*${m[3]}`;
}

export function exerciseToDsl(ex: Exercise): string {
  const kw = TYPE_KEYWORD[ex.type];
  const tail = ex.explain ? ` !! ${ex.explain}` : '';
  switch (ex.type) {
    case 'choice': {
      const head = ex.sentence ? `${ex.prompt} >> ${ex.sentence}` : ex.prompt;
      const opts = ex.options.map((o, i) => (i === ex.correct ? `*${o}` : o)).join(' | ');
      return `${kw}: ${head} | ${opts}${tail}`;
    }
    case 'tap': {
      const set = new Set(ex.correct);
      return `${kw}: ${ex.prompt} >> ${ex.tokens.map((t, i) => (set.has(i) ? wrapTapToken(t) : t)).join(' ')}${tail}`;
    }
    case 'sort': {
      const groups = ex.categories.map((c, ci) => `${c} = ${ex.items.filter((it) => it.cat === ci).map((it) => it.text).join(', ')}`);
      return `${kw}: ${ex.prompt} >> ${groups.join(' ; ')}${tail}`;
    }
    case 'fill':
    case 'dictation':
      return `${kw}: ${ex.prompt} >> ${ex.parts.map((p) => (Array.isArray(p) ? `[${p.join('|')}]` : p)).join('')}${tail}`;
    case 'match':
      return `${kw}: ${ex.prompt} >> ${ex.pairs.map(([l, r]) => `${l} = ${r}`).join(' ; ')}${tail}`;
  }
}

export function normalizeAnswer(s: string): string {
  let r = s
    .normalize('NFC')
    .toLowerCase()
    .replace(/[×*]/g, '·')
    .replace(/−/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.,!?;:]+$/, '')
    .trim()
    .replace(/(\d)\.(\d)/g, '$1,$2')
    .replace(/\s*\/\s*/g, '/');
  // 3,50 = 3,5 · 5,0 = 5
  if (/^-?\d+,\d+$/.test(r)) r = r.replace(/0+$/, '').replace(/,$/, '');
  return r;
}

export function isFillAnswerCorrect(given: string, accepted: string[]): boolean {
  const g = normalizeAnswer(given);
  return g.length > 0 && accepted.some((a) => normalizeAnswer(a) === g);
}

/** Tekst do czytania na głos (bez znaczników). */
export function speakableSentence(s: string): string {
  return s.replace(/[{}]/g, '').replace(/_{2,}/g, ' … ');
}

/** Pełny tekst dyktanda (z pierwszą akceptowaną odpowiedzią w każdej luce) — do czytania na głos. */
export function dictationText(parts: (string | string[])[]): string {
  return parts.map((p) => (Array.isArray(p) ? p[0] : p)).join('');
}

/**
 * Podpowiedź do dyktanda: wyraz z ukrytymi „trudnymi” miejscami (ó/u, rz/ż, ch/h),
 * np. „żaba” → „_aba”, „ogórek” → „og_rek”. Dziecko widzi wyraz, ale samo decyduje o pisowni.
 */
export function maskSpelling(word: string): string {
  return word.replace(/rz|ch|ó|u|ż|h/gi, '_');
}

export const DSL_HELP = `# Każde zadanie w jednej linii. Linie z # to komentarze.
wybierz: Które słowo jest czasownikiem? | *biega | kot | szybki | bardzo !! Biega — co robi? To czasownik.
wybierz: W jakim czasie jest czasownik? >> Wczoraj {pojechałem} rowerem. | *przeszłym | teraźniejszym | przyszłym
kliknij: Kliknij wszystkie czasowniki. >> Kasia *śpiewa* i *tańczy*.
sortuj: Posegreguj słowa. >> rzeczownik = kot, dom ; czasownik = biega, pisze
wpisz: Uzupełnij. >> Wczoraj Ola [czytała|przeczytała] książkę.
pary: Połącz osobę z czasownikiem. >> ja = piszę ; ty = piszesz ; oni = piszą
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Latem jedziemy nad [morze].`;
