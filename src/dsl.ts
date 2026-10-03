import type { DslError, Exercise, ExerciseType, Lang, Lesson, LessonPair, Passage } from './types';

/*
 * Prosty format tekstowy zadań — jedno zadanie w jednej linii.
 *
 *   wybierz: Polecenie >> Zdanie z {wyróżnieniem} lub ___ | *dobra | zła | zła !! wyjaśnienie
 *   kliknij: Polecenie >> Mama *piecze* ciasto. !! wyjaśnienie
 *   sortuj:  Polecenie >> rzeczownik = kot, dom ; czasownik = biega, pisze
 *   wpisz:   Polecenie >> Wczoraj Ola [czytała|przeczytała] książkę.
 *   pary:    Polecenie >> ja = piszę ; ty = piszesz ; oni = piszą
 *   dyktando: Polecenie >> Latem jedziemy nad [morze].   (aplikacja czyta całe zdanie na głos)
 *   Na końcu linii można dodać podpowiedź i wyjaśnienie:  ... ?? podpowiedź !! wyjaśnienie
 *   tekst:   Tytuł >> Treść tekstu. // Drugi akapit.   (czytanie ze zrozumieniem — pytania pod spodem
 *            dotyczą tego tekstu, aż do następnej linii „tekst:”)
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
  let hint: string | undefined;
  const [body, ex] = splitOnce(rest, '!!');
  // Podpowiedź po „??” (przed albo po wyjaśnieniu). Tak jak wyjaśnienie nie wpływa na identyfikator zadania.
  const [task, h1] = splitOnce(body, '??');
  const [exText, h2] = ex === null ? [null, null] : splitOnce(ex, '??');
  rest = task.trim();
  if (exText !== null && exText.trim()) explain = exText.trim();
  if ((h1 ?? h2)?.trim()) hint = (h1 ?? h2)!.trim();

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
        hint,
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
    return { ex: { id, type, prompt: prompt.trim(), tokens, correct, explain, hint } };
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
    return { ex: { id, type, prompt: prompt.trim(), categories, items, explain, hint } };
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
    return { ex: { id, type, prompt: prompt.trim(), parts, explain, hint } };
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
  return { ex: { id, type, prompt: prompt.trim(), pairs, explain, hint } };
}

const TEXT_LINE = /^tekst\s*:\s*/i;

/** Linia „tekst: Tytuł >> treść” (czytanie ze zrozumieniem). */
export function parsePassage(line: string): Passage | null {
  if (!TEXT_LINE.test(line)) return null;
  const [title, text] = splitOnce(line.replace(TEXT_LINE, ''), '>>');
  if (text === null || !title.trim() || !text.trim()) return null;
  return { title: title.trim(), text: text.trim() };
}

/** Akapity tekstu do czytania. */
export function passageParagraphs(p: Passage): string[] {
  return p.text
    .split(/\s*\/\/\s*/)
    .map((x) => x.trim())
    .filter(Boolean);
}

export function parseDsl(dsl: string, idPrefix = ''): { exercises: Exercise[]; errors: DslError[] } {
  const exercises: Exercise[] = [];
  const errors: DslError[] = [];
  const seen = new Set<string>();
  let passage: Passage | undefined;
  dsl.split(/\r?\n/).forEach((line, i) => {
    const t = line.trim();
    if (!t || t.startsWith('#') || t.startsWith('//')) return;
    if (TEXT_LINE.test(t)) {
      if (/^koniec\.?$/i.test(t.replace(TEXT_LINE, '').trim())) {
        passage = undefined; // „tekst: koniec” — dalsze zadania już nie dotyczą tekstu
        return;
      }
      const p = parsePassage(t);
      if (!p) errors.push({ line: i + 1, text: t, message: 'Tekst do czytania zapisz tak: tekst: Tytuł >> treść tekstu' });
      else passage = p;
      return;
    }
    const { ex, error } = parseLine(t, i + 1, idPrefix);
    if (error) errors.push(error);
    if (ex && passage) {
      // To samo pytanie przy innym tekście to inne zadanie.
      ex.passage = passage;
      ex.id = hashId(`${ex.id}|${passage.title}`);
    }
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
  const tail = (ex.hint ? ` ?? ${ex.hint}` : '') + (ex.explain ? ` !! ${ex.explain}` : '');
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
    // iPad wstawia „ozdobny” apostrof (isn’t) — liczy się tak samo jak zwykły (isn't).
    .replace(/[’‘ʼ`´′]/g, "'")
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

type LessonSection = 'key' | 'steps' | 'pairs' | 'trick' | 'checks';

function lessonSection(header: string): LessonSection | null {
  const h = header.toLowerCase();
  if (h.includes('najważ')) return 'key';
  if (h.includes('krok')) return 'steps';
  if (h.includes('tak')) return 'pairs';
  if (h.includes('zapami')) return 'trick';
  if (h.includes('sprawd')) return 'checks';
  return null;
}

/**
 * Lekcja (tryb nauki). Sekcje zaczynają się od linii z „#”:
 *
 *   # Najważniejsze        — 2–4 proste zdania, każde w osobnej linii
 *   # Krok po kroku        — kroki po kolei; linia „Przykład: …” to przykład
 *   # Tak / nie tak        — tak: Yes, he is. | nie: Yes, he's. | bo: po skrócie musi coś stać
 *   # Zapamiętaj           — skojarzenie, rymowanka, prosty test
 *   # Sprawdź się          — 2–3 zadania w zwykłym formacie (z wyjaśnieniem po „!!”)
 *
 * Zwraca `null`, gdy lekcji nie ma.
 */
export function parseLesson(text: string | undefined): Lesson | null {
  if (!text?.trim()) return null;
  const out: Lesson = { key: [], steps: [], pairs: [], trick: [], checks: [], errors: [] };
  const checkLines: string[] = [];
  let section: LessonSection | null = null;
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const fail = (message: string) => out.errors.push({ line: i + 1, text: line, message });
    if (line.startsWith('#')) {
      section = lessonSection(line.slice(1));
      if (!section) fail('Nieznana część lekcji. Użyj: # Najważniejsze, # Krok po kroku, # Tak / nie tak, # Zapamiętaj, # Sprawdź się.');
      return;
    }
    if (!section) return void fail('Lekcja musi zaczynać się od nagłówka, np. „# Najważniejsze”.');
    if (section === 'checks') return void checkLines.push(line);
    if (section !== 'pairs') return void out[section].push(line);
    const pair: Partial<LessonPair> = {};
    for (const part of line.split('|')) {
      const m = part.trim().match(/^(tak|nie|bo)\s*:\s*(.+)$/i);
      if (!m) continue;
      const k = m[1].toLowerCase();
      if (k === 'tak') pair.good = m[2].trim();
      else if (k === 'nie') pair.bad = m[2].trim();
      else pair.why = m[2].trim();
    }
    if (pair.good && pair.bad) out.pairs.push(pair as LessonPair);
    else fail('Para musi mieć postać: tak: poprawnie | nie: błędnie | bo: dlaczego');
  });
  if (checkLines.length) {
    const { exercises, errors } = parseDsl(checkLines.join('\n'), 'L');
    out.checks = exercises;
    out.errors.push(...errors);
  }
  return out;
}

/** Słówka tematu: linie „english = polski” (puste linie i komentarze # pomijamy). */
export function parseWords(text: string | undefined): [string, string][] {
  const out: [string, string][] = [];
  for (const raw of (text ?? '').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const [l, r] = splitOnce(line, '=');
    if (r !== null && l.trim() && r.trim()) out.push([l.trim(), r.trim()]);
  }
  return out;
}

const wordKey = (w: string) => w.toLowerCase().replace(/[’‘ʼ`´′]/g, "'");

/**
 * Podpowiedzi do słów: które słówka ze słowniczka występują w tekście (najpierw dłuższe wyrażenia,
 * np. „next to” przed „next”). Liczbę mnogą na -s/-es rozpoznajemy po formie podstawowej.
 * Wynik w kolejności występowania w tekście.
 */
export function wordHints(text: string, glossary: [string, string][], max = 8): [string, string][] {
  const tokens = wordKey(text).match(/[\p{L}\p{N}']+/gu) ?? [];
  if (!tokens.length) return [];
  const dict = new Map<string, [string, string]>();
  let longest = 1;
  for (const [en, pl] of glossary) {
    const k = (wordKey(en).match(/[\p{L}\p{N}']+/gu) ?? []).join(' ');
    if (!k || dict.has(k)) continue;
    dict.set(k, [en, pl]);
    longest = Math.max(longest, k.split(' ').length);
  }
  const out: [string, string][] = [];
  const seen = new Set<string>();
  for (let i = 0; i < tokens.length; ) {
    let hit = 0;
    for (let len = Math.min(longest, tokens.length - i); len >= 1 && !hit; len--) {
      const phrase = tokens.slice(i, i + len).join(' ');
      // Formę podstawową sprawdzamy tylko dla dłuższych słów („is” to nie liczba mnoga od „I”).
      const forms = [phrase, phrase.replace(/'s$/, ''), phrase.replace(/s$/, ''), phrase.replace(/es$/, '')];
      const k = forms.find((f, n) => (n === 0 || f.length >= 3) && dict.has(f));
      if (!k) continue;
      hit = len;
      if (!seen.has(k)) {
        seen.add(k);
        out.push(dict.get(k)!);
      }
    }
    i += hit || 1;
  }
  return out.slice(0, max);
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
export function maskSpelling(word: string, lang: Lang = 'pl'): string {
  // Po angielsku nie ma „trudnych miejsc” jak w polskim — ukrywamy samogłoski (February → F_br__ry).
  return lang === 'en' ? word.replace(/[aeiou]/gi, '_') : word.replace(/rz|ch|ó|u|ż|h/gi, '_');
}

export const LESSON_HELP = `# Najważniejsze
Czasownik mówi, co ktoś robi.
Pytamy o niego: co robi?
# Krok po kroku
Znajdź słowo, które nazywa czynność.
Zadaj pytanie: co robi?
Przykład: Mama piecze ciasto. Co robi mama? Piecze.
# Tak / nie tak
tak: Kot śpi. — „śpi” to czasownik | nie: „kot” to czasownik | bo: kot to nazwa zwierzęcia, a nie czynność
# Zapamiętaj
Czasownik to słowo-akcja: da się to zrobić albo pokazać ruchem.
# Sprawdź się
wybierz: Które słowo jest czasownikiem? | *biega | kot | szybki !! Biega — co robi? To czasownik.`;

export const DSL_HELP = `# Każde zadanie w jednej linii. Linie z # to komentarze.
wybierz: Które słowo jest czasownikiem? | *biega | kot | szybki | bardzo !! Biega — co robi? To czasownik.
wybierz: W jakim czasie jest czasownik? >> Wczoraj {pojechałem} rowerem. | *przeszłym | teraźniejszym | przyszłym
kliknij: Kliknij wszystkie czasowniki. >> Kasia *śpiewa* i *tańczy*.
sortuj: Posegreguj słowa. >> rzeczownik = kot, dom ; czasownik = biega, pisze
wpisz: Uzupełnij. >> Wczoraj Ola [czytała|przeczytała] książkę.
pary: Połącz osobę z czasownikiem. >> ja = piszę ; ty = piszesz ; oni = piszą
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Latem jedziemy nad [morze].
# Na końcu linii: ?? podpowiedź (dziecko widzi ją po stuknięciu „Podpowiedź”) i !! wyjaśnienie (po odpowiedzi)
wybierz: Wybierz poprawną formę. >> My sister ___ ten. | *is | are | am ?? Po polsku: Moja siostra ma dziesięć lat. !! She → is.
# Czytanie ze zrozumieniem: tekst, a pod nim pytania do niego
tekst: Jeż w ogrodzie >> Wieczorem Zosia zobaczyła w ogrodzie jeża. Szukał jedzenia pod krzakiem.
wybierz: Kogo Zosia zobaczyła w ogrodzie? | *jeża | kota | psa`;
