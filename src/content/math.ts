import { divisionCheck, divisionSummary, longDivision } from '../longdiv';
import type { Topic } from '../types';
import { builtin } from './util';

/*
 * Matematyka: wyniki są LICZONE w kodzie (nie wpisane ręcznie), więc nie ma w nich pomyłek.
 * Testy dodatkowo sprawdzają odpowiedzi do wyboru.
 */

export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;

/** Akceptowane odpowiedzi dla ułamka: najpierw najprostsza postać. */
function fracAnswers(n: number, d: number): string {
  const out: string[] = [];
  const g = gcd(n, d);
  if (n % d === 0) out.push(String(n / d));
  else out.push(`${n / g}/${d / g}`);
  out.push(`${n}/${d}`);
  return [...new Set(out)].join('|');
}

/** Liczba w setnych → zapis z przecinkiem, bez zbędnych zer (325 → „3,25”, 500 → „5”). */
export function dec(hundredths: number): string {
  const neg = hundredths < 0;
  const h = Math.abs(hundredths);
  const whole = Math.floor(h / 100);
  const rest = h % 100;
  let s = String(whole);
  if (rest) s += ',' + String(rest).padStart(2, '0').replace(/0$/, '');
  return (neg ? '−' : '') + s;
}

/** Odpowiedzi do wyboru: poprawna + bliskie pomyłki (różne, dodatnie). */
function numChoice(prompt: string, answer: number, explain: string): string {
  const cands = [answer + 10, answer - 10, answer + 1, answer - 1, answer + 2].filter((x) => x > 0 && x !== answer);
  const opts = [...new Set(cands)].slice(0, 3);
  return `wybierz: ${prompt} | *${answer} | ${opts.join(' | ')} !! ${explain}`;
}

const lines = (...ls: string[]) => ls.join('\n');

// ─── Klasa 3 ──────────────────────────────────────────────────────────────────

function addSub(): string {
  const adds = [
    [47, 28],
    [36, 45],
    [58, 27],
    [19, 64],
    [73, 18],
    [29, 39],
  ];
  const subs = [
    [82, 37],
    [91, 46],
    [64, 29],
    [70, 38],
    [55, 17],
    [100, 63],
  ];
  const out: string[] = [];
  for (const [a, b] of adds) {
    const tens = b - (b % 10);
    out.push(`wpisz: Oblicz. >> ${a} + ${b} = [${a + b}] !! Najpierw dziesiątki: ${a} + ${tens} = ${a + tens}, potem jedności: ${a + tens} + ${b % 10} = ${a + b}.`);
  }
  for (const [a, b] of subs) {
    const tens = b - (b % 10);
    out.push(`wpisz: Oblicz. >> ${a} − ${b} = [${a - b}] !! Najpierw dziesiątki: ${a} − ${tens} = ${a - tens}, potem jedności: ${a - tens} − ${b % 10} = ${a - b}.`);
  }
  out.push(numChoice('Ile to jest 38 + 47?', 85, '38 + 40 = 78, 78 + 7 = 85.'));
  out.push(numChoice('Ile to jest 93 − 58?', 35, '93 − 50 = 43, 43 − 8 = 35.'));
  return lines(...out);
}

function mult89(): string {
  const out: string[] = [];
  for (const b of [3, 4, 6, 7, 8, 9]) out.push(`wpisz: Oblicz. >> 8 · ${b} = [${8 * b}] !! 8 · ${b} = 4 · ${b} + 4 · ${b} = ${4 * b} + ${4 * b} = ${8 * b}.`);
  for (const b of [3, 4, 6, 7, 8, 9]) out.push(`wpisz: Oblicz. >> 9 · ${b} = [${9 * b}] !! Sztuczka: 9 · ${b} = 10 · ${b} − ${b} = ${10 * b} − ${b} = ${9 * b}.`);
  out.push(numChoice('Ile to jest 9 · 6?', 54, '9 · 6 = 60 − 6 = 54.'));
  out.push(`pary: Połącz działanie z wynikiem. >> 8 · 5 = 40 ; 9 · 5 = 45 ; 8 · 2 = 16 ; 9 · 2 = 18 !! Sprawdź: 8 · 5 = 40, 9 · 5 = 45, 8 · 2 = 16, 9 · 2 = 18.`);
  return lines(...out);
}

function division(): string {
  const pairs = [
    [42, 6],
    [56, 7],
    [72, 8],
    [81, 9],
    [36, 4],
    [45, 5],
    [63, 7],
    [48, 6],
    [64, 8],
    [54, 9],
    [28, 4],
    [35, 5],
  ];
  const out = pairs.map(([a, b]) => `wpisz: Oblicz. >> ${a} : ${b} = [${a / b}] !! Bo ${a / b} · ${b} = ${a}.`);
  out.push(`wpisz: 24 cukierki podzielono po równo między 4 dzieci. Ile cukierków dostało każde dziecko? >> Każde dziecko dostało [6] cukierków. !! 24 : 4 = 6.`);
  out.push(numChoice('Ile to jest 49 : 7?', 7, 'Bo 7 · 7 = 49.'));
  return lines(...out);
}

const WORD_PROBLEMS = `
wpisz: Ola miała 35 zł. Kupiła książkę za 18 zł. Ile złotych jej zostało? >> Zostało jej [17] zł. !! 35 − 18 = 17.
wpisz: W klasie jest 14 dziewczynek i 12 chłopców. Ilu jest wszystkich uczniów? >> W klasie jest [26] uczniów. !! 14 + 12 = 26.
wpisz: Jeden zeszyt kosztuje 4 zł. Ile zapłacisz za 6 zeszytów? >> Zapłacisz [24] zł. !! 6 · 4 = 24.
wpisz: Tata ma 40 jabłek. Rozkłada je po równo do 5 koszyków. Ile jabłek jest w każdym koszyku? >> W każdym koszyku jest [8] jabłek. !! 40 : 5 = 8.
wpisz: Pociąg ma 8 wagonów. W każdym wagonie jedzie 9 osób. Ile osób jedzie pociągiem? >> Pociągiem jedzie [72] osoby. !! 8 · 9 = 72.
wpisz: Tomek ma 7 naklejek. Kasia ma 3 razy więcej. Ile naklejek ma Kasia? >> Kasia ma [21] naklejek. !! 3 · 7 = 21.
wpisz: Lekcja trwa 45 minut. Ile minut trwają 2 lekcje? >> Dwie lekcje trwają [90] minut. !! 45 + 45 = 90.
wpisz: Na parkingu stały 52 samochody. Odjechało 19 samochodów. Ile samochodów zostało? >> Zostały [33] samochody. !! 52 − 19 = 33.
wybierz: Mama kupiła 4 opakowania po 6 jajek. Ile jajek kupiła? | *24 | 10 | 20 | 28 !! 4 · 6 = 24.
wybierz: Jaś miał 20 zł i wydał 8 zł. Które działanie pasuje do zadania? | *20 − 8 | 20 + 8 | 20 · 8 | 20 : 8 !! Wydał pieniądze, więc odejmujemy.
`;

export const MATH_GRADE3: Topic[] = [
  builtin('b-m3-dodawanie', 'mat', 5, 'Dodawanie i odejmowanie do 100', 'Najpierw dodaj albo odejmij dziesiątki, potem jedności: 47 + 28 = 47 + 20 + 8.', addSub(), [3]),
  builtin('b-m3-mnozenie-8-9', 'mat', 20, 'Mnożenie przez 8 i 9', 'Sztuczka na 9: 9 · 7 = 10 · 7 − 7 = 63.', mult89(), [3]),
  builtin('b-m3-dzielenie', 'mat', 30, 'Dzielenie w zakresie 100', 'Dzielenie to odwrotność mnożenia: 42 : 6 = 7, bo 7 · 6 = 42.', division(), [3]),
  builtin('b-m3-zadania', 'mat', 40, 'Zadania z treścią', 'Przeczytaj zadanie dwa razy. Zastanów się: dodać, odjąć, pomnożyć czy podzielić?', WORD_PROBLEMS, [3]),
];

// ─── Klasa 5 ──────────────────────────────────────────────────────────────────

function fractionsSimplify(): string {
  const out: string[] = [];
  for (const [n, d] of [
    [6, 8],
    [4, 10],
    [9, 12],
    [10, 15],
    [12, 16],
    [14, 21],
    [15, 25],
  ]) {
    const g = gcd(n, d);
    out.push(`wpisz: Skróć ułamek do najprostszej postaci. >> ${n}/${d} = [${n / g}/${d / g}] !! Podziel licznik i mianownik przez ${g}.`);
  }
  for (const [n, d, D] of [
    [2, 3, 12],
    [3, 5, 20],
    [1, 4, 12],
    [5, 6, 18],
  ]) {
    const k = D / d;
    out.push(`wpisz: Rozszerz ułamek tak, aby mianownik był równy ${D}. >> ${n}/${d} = [${n * k}/${D}] !! Mianownik pomnożono przez ${k}, więc licznik też: ${n} · ${k} = ${n * k}.`);
  }
  out.push('wybierz: Który ułamek jest równy 1/2? | *4/8 | 3/8 | 2/5 | 5/8 !! 4/8 po skróceniu przez 4 to 1/2.');
  out.push('pary: Połącz równe ułamki. >> 2/4 = 1/2 ; 6/9 = 2/3 ; 5/20 = 1/4 ; 8/10 = 4/5 !! Skróć ułamki z lewej strony.');
  return lines(...out);
}

function fractionsOps(): string {
  const out: string[] = [];
  const same: [number, number, '+' | '−', number][] = [
    [2, 7, '+', 3],
    [5, 9, '−', 2],
    [3, 8, '+', 1],
    [7, 10, '−', 3],
    [1, 6, '+', 4],
    [3, 4, '+', 1],
  ];
  for (const [a, d, op, c] of same) {
    const n = op === '+' ? a + c : a - c;
    out.push(`wpisz: Oblicz. >> ${a}/${d} ${op} ${c}/${d} = [${fracAnswers(n, d)}] !! Mianowniki są takie same, więc ${op === '+' ? 'dodajemy' : 'odejmujemy'} tylko liczniki: ${a} ${op} ${c} = ${n}.`);
  }
  const diff: [number, number, '+' | '−', number, number][] = [
    [1, 2, '+', 1, 4],
    [1, 3, '+', 1, 6],
    [2, 3, '−', 1, 6],
    [1, 2, '−', 1, 3],
    [3, 4, '−', 1, 2],
  ];
  for (const [a, b, op, c, d] of diff) {
    const L = lcm(b, d);
    const x = (a * L) / b;
    const y = (c * L) / d;
    const n = op === '+' ? x + y : x - y;
    out.push(`wpisz: Oblicz. >> ${a}/${b} ${op} ${c}/${d} = [${fracAnswers(n, L)}] !! Wspólny mianownik ${L}: ${x}/${L} ${op} ${y}/${L} = ${n}/${L}.`);
  }
  out.push(`wpisz: Oblicz. >> 1 − 3/5 = [2/5] !! 1 = 5/5, więc 5/5 − 3/5 = 2/5.`);
  out.push('wybierz: Ile to jest 1/2 + 1/2? | *1 | 2/4 | 1/4 | 2 !! 1/2 + 1/2 = 2/2 = 1. Mianowników nie dodajemy.');
  return lines(...out);
}

function decimals(): string {
  const out: string[] = [];
  for (const [a, b] of [
    [250, 125],
    [70, 45],
    [325, 175],
    [120, 8],
  ])
    out.push(`wpisz: Oblicz. >> ${dec(a)} + ${dec(b)} = [${dec(a + b)}] !! Zapisz liczby przecinek pod przecinkiem i dodaj.`);
  for (const [a, b] of [
    [480, 130],
    [1000, 240],
    [605, 250],
  ])
    out.push(`wpisz: Oblicz. >> ${dec(a)} − ${dec(b)} = [${dec(a - b)}] !! Zapisz liczby przecinek pod przecinkiem i odejmij.`);
  out.push(`wpisz: Oblicz. >> ${dec(347)} · 10 = [${dec(3470)}] !! Mnożąc przez 10, przesuwamy przecinek o jedno miejsce w prawo.`);
  out.push(`wpisz: Oblicz. >> ${dec(60)} · 100 = [${dec(6000)}] !! Mnożąc przez 100, przesuwamy przecinek o dwa miejsca w prawo.`);
  out.push(`wpisz: Oblicz. >> ${dec(5260)} : 10 = [${dec(526)}] !! Dzieląc przez 10, przesuwamy przecinek o jedno miejsce w lewo.`);
  out.push('wybierz: Która liczba jest większa? | *0,7 | 0,65 !! 0,7 = 0,70, a 70 setnych to więcej niż 65 setnych.');
  out.push('wybierz: Która liczba jest większa? | *2,5 | 2,49 !! 2,5 = 2,50 > 2,49.');
  out.push('wybierz: Która liczba jest większa? | *1,1 | 1,09 !! 1,1 = 1,10 > 1,09.');
  out.push('pary: Połącz ułamek dziesiętny ze zwykłym. >> 0,5 = 1/2 ; 0,25 = 1/4 ; 0,75 = 3/4 ; 0,1 = 1/10 !! 0,5 to pięć dziesiątych, czyli połowa.');
  return lines(...out);
}

function areaPerimeter(): string {
  const out: string[] = [];
  for (const [a, b] of [
    [4, 7],
    [5, 9],
    [3, 12],
    [8, 10],
  ]) {
    out.push(`wpisz: Prostokąt ma boki ${a} cm i ${b} cm. Oblicz jego pole. >> Pole = [${a * b}] cm² !! Pole = ${a} · ${b} = ${a * b} cm².`);
    out.push(`wpisz: Prostokąt ma boki ${a} cm i ${b} cm. Oblicz jego obwód. >> Obwód = [${2 * (a + b)}] cm !! Obwód = 2 · ${a} + 2 · ${b} = ${2 * (a + b)} cm.`);
  }
  out.push('wpisz: Kwadrat ma bok 6 cm. Oblicz jego pole. >> Pole = [36] cm² !! 6 · 6 = 36 cm².');
  out.push('wpisz: Kwadrat ma bok 6 cm. Oblicz jego obwód. >> Obwód = [24] cm !! 4 · 6 = 24 cm.');
  out.push('wpisz: Kwadrat ma obwód 20 cm. Jaka jest długość jego boku? >> Bok = [5] cm !! Kwadrat ma 4 równe boki: 20 : 4 = 5 cm.');
  out.push('wpisz: Prostokąt ma pole 24 cm², a jeden jego bok ma 6 cm. Jaka jest długość drugiego boku? >> Drugi bok = [4] cm !! 24 : 6 = 4 cm.');
  out.push(`wybierz: Który prostokąt ma większe pole? | *5 cm na 6 cm | 4 cm na 7 cm !! 5 · 6 = 30 cm², a 4 · 7 = 28 cm².`);
  return lines(...out);
}

/** Liczy wyrażenie zapisane szkolnie (·, :, −, nawiasy) — mały parser, bez eval. */
export function evalSchool(expr: string): number {
  const t = expr.replace(/\s+/g, '').replace(/·/g, '*').replace(/:/g, '/').replace(/−/g, '-');
  let i = 0;
  const num = (): number => {
    if (t[i] === '(') {
      i++;
      const v = sum();
      if (t[i++] !== ')') throw new Error('Brak nawiasu: ' + expr);
      return v;
    }
    const m = /^\d+/.exec(t.slice(i));
    if (!m) throw new Error('Nieobsługiwane wyrażenie: ' + expr);
    i += m[0].length;
    return Number(m[0]);
  };
  const prod = (): number => {
    let v = num();
    while (t[i] === '*' || t[i] === '/') v = t[i++] === '*' ? v * num() : v / num();
    return v;
  };
  const sum = (): number => {
    let v = prod();
    while (t[i] === '+' || t[i] === '-') v = t[i++] === '+' ? v + prod() : v - prod();
    return v;
  };
  const v = sum();
  if (i !== t.length) throw new Error('Nieobsługiwane wyrażenie: ' + expr);
  return v;
}

function orderOfOps(): string {
  const exprs = [
    '2 + 3 · 4',
    '(2 + 3) · 4',
    '20 − 12 : 4',
    '36 : (2 + 4)',
    '5 · 4 − 3 · 2',
    '100 − 4 · (7 + 8)',
    '18 : 3 + 2 · 7',
    '(15 − 6) · (2 + 3)',
    '50 − 10 · 3 + 4',
    '2 · (9 − 4) : 5',
  ];
  const out = exprs.map((e) => `wpisz: Oblicz. >> ${e} = [${evalSchool(e)}] !! ${/\(/.test(e) ? 'Najpierw działanie w nawiasie' : 'Najpierw mnożenie i dzielenie, potem dodawanie i odejmowanie'}.`);
  out.push('wybierz: Co liczymy najpierw w działaniu 8 + 2 · 5? | *mnożenie | dodawanie !! Mnożenie przed dodawaniem: 8 + 10 = 18.');
  out.push(numChoice('Ile to jest 6 + 4 · 3?', 18, 'Najpierw 4 · 3 = 12, potem 6 + 12 = 18.'));
  return lines(...out);
}

const DIV_RULE: Record<number, string> = {
  2: 'Przez 2 dzielą się liczby, które kończą się cyfrą parzystą: 0, 2, 4, 6, 8.',
  3: 'Przez 3 dzielą się liczby, których suma cyfr dzieli się przez 3.',
  5: 'Przez 5 dzielą się liczby, które kończą się cyfrą 0 lub 5.',
  9: 'Przez 9 dzielą się liczby, których suma cyfr dzieli się przez 9.',
  10: 'Przez 10 dzielą się liczby, które kończą się cyfrą 0.',
};

function divisibility(): string {
  const out: string[] = [];
  const sets: [number, number[]][] = [
    [2, [13, 24, 37, 46, 58, 71]],
    [3, [12, 25, 33, 40, 51, 58]],
    [5, [14, 25, 30, 47, 55, 62]],
    [9, [18, 27, 35, 81, 92, 108]],
    [10, [15, 40, 55, 70, 100, 105]],
    [3, [123, 124, 222, 301, 405, 512]],
  ];
  for (const [d, nums] of sets) {
    out.push(`kliknij: Kliknij liczby podzielne przez ${d}. >> ${nums.map((n) => (n % d === 0 ? `*${n}*` : String(n))).join(' ')} !! ${DIV_RULE[d]}`);
  }
  const choice = (d: number, nums: number[]) => {
    const good = nums.filter((n) => n % d === 0);
    if (good.length !== 1) throw new Error(`Zadanie o podzielności przez ${d} musi mieć jedną dobrą odpowiedź`);
    return `wybierz: Która liczba jest podzielna przez ${d}? | ${nums.map((n) => (n % d === 0 ? `*${n}` : String(n))).join(' | ')} !! ${DIV_RULE[d]}`;
  };
  out.push(choice(9, [738, 728, 739, 830]));
  out.push(choice(3, [471, 472, 473, 470]));
  out.push(choice(10, [350, 355, 305, 503]));
  out.push(choice(2, [146, 147, 149, 151]));
  const s5 = [35, 60, 125, 52, 71, 108];
  out.push(
    `sortuj: Podzielne przez 5 czy nie? >> podzielne przez 5 = ${s5.filter((n) => n % 5 === 0).join(', ')} ; niepodzielne przez 5 = ${s5.filter((n) => n % 5 !== 0).join(', ')} !! ${DIV_RULE[5]}`,
  );
  return lines(...out);
}

// ─── Dzielenie pisemne ────────────────────────────────────────────────────────

/** Podpowiedź do słupka: od czego zacząć (bez zdradzania wyniku). */
function divisionHint(a: number, b: number): string {
  const first = longDivision(a, b).steps[0].part;
  return `Zacznij od lewej strony. Najpierw dzielisz ${first}: ile razy ${b} mieści się w ${first}?`;
}

/**
 * „Oblicz pisemnie”: na ekranie pojawia się słupek z kratkami (patrz `divisionGridOf` i `DivisionInput`) — dziecko
 * wpisuje cyfry wyniku, iloczyny i reszty jak na karcie pracy. Luki w tej linii (wynik i reszta) to to, co aplikacja
 * odczytuje ze słupka i ocenia; widać je też w raportach dla rodzica.
 */
export function writtenLine(a: number, b: number): string {
  const d = longDivision(a, b);
  const tail = `?? ${divisionHint(a, b)} !! ${divisionSummary(d)}. Sprawdzenie: ${divisionCheck(d)}.`;
  if (d.remainder) return `wpisz: Oblicz pisemnie. Wpisz cyfry w kratki — na dole zostanie reszta. >> ${a} : ${b} = [${d.quotient}] r [${d.remainder}] ${tail}`;
  return `wpisz: Oblicz pisemnie. Wpisz cyfry w kratki. >> ${a} : ${b} = [${d.quotient}] ${tail}`;
}

/** Słupek „za rękę”: dziecko wpisuje cyfrę wyniku i resztę w każdym kroku oraz liczbę, która powstaje po spisaniu cyfry. */
function guidedLine(a: number, b: number): string {
  const d = longDivision(a, b);
  const steps = d.steps.map((s, i) => `${i === 0 ? s.part : `[${s.part}]`} : ${b} = [${s.digit}] r [${s.rest}]`);
  const result = `[${d.quotient}]${d.remainder ? ` r [${d.remainder}]` : ''}`;
  // „ // ” = nowa linia: każdy krok w osobnym wierszu, żeby na telefonie nic się nie łamało w połowie.
  return `wpisz: Dzielimy pisemnie ${a} : ${b}. Uzupełnij kolejne kroki (r to reszta). >> ${steps.join(' // → ')} // Wynik: ${result} !! Po każdym kroku spisujemy następną cyfrę obok reszty. Sprawdzenie: ${divisionCheck(d)}.`;
}

/** Którą liczbę dzielimy w pierwszym kroku? */
function firstPartLine(a: number, b: number, wrong: number[]): string {
  const first = longDivision(a, b).steps[0].part;
  const len = String(first).length;
  const lead = Number(String(a).slice(0, len - 1));
  const why = len === 1 ? `W ${first} dzielnik ${b} już się mieści, więc wystarczy jedna cyfra.` : `${lead} jest mniejsze od ${b}, więc bierzemy ${len === 2 ? 'dwie cyfry' : 'trzy cyfry'}: ${first}.`;
  if (wrong.includes(first)) throw new Error(`Błędna odpowiedź równa poprawnej: ${a} : ${b}`);
  return `wybierz: Dzielimy pisemnie ${a} : ${b}. Którą liczbę dzielimy w pierwszym kroku? | *${first} | ${wrong.join(' | ')} !! ${why}`;
}

/** Ile razy dzielnik mieści się w liczbie (szacowanie cyfry wyniku). */
function fitsLine(part: number, b: number, round: string): string {
  const q = Math.floor(part / b);
  return `wybierz: Ile razy ${b} mieści się w ${part}? Pomóż sobie: ${round}. | *${q} | ${q - 1} | ${q + 1} | ${q + 2} !! ${q} · ${b} = ${q * b}, a ${q + 1} · ${b} = ${(q + 1) * b} to już za dużo.`;
}

/**
 * Sprawdzanie dzielenia mnożeniem — „od tyłu”: z wyniku (i reszty) odtwarzamy dzielną, której nie ma w poleceniu.
 * Bez reszty to mnożenie pisemne w kratkach (słowa „Pomnóż pisemnie” w poleceniu — patrz `multiplicationGridOf`).
 */
const checkLine = (a: number, b: number) => {
  const d = longDivision(a, b);
  return d.remainder
    ? `wpisz: Pewną liczbę podzielono przez ${b}. Wyszło ${d.quotient} i reszta ${d.remainder}. Jaka to liczba? >> ${d.quotient} · ${b} + ${d.remainder} = [${a}] !! Tak sprawdzamy dzielenie z resztą: wynik razy dzielnik plus reszta daje dzielną.`
    : `wpisz: Pewną liczbę podzielono przez ${b} i wyszło ${d.quotient}. Jaka to liczba? Pomnóż pisemnie — wpisz cyfry w kratki. >> ${d.quotient} · ${b} = [${a}] !! Tak sprawdzamy dzielenie: wynik razy dzielnik daje dzielną.`;
};

/** „Pomnóż pisemnie”: mnożenie w słupku z kratkami — czynniki wydrukowane, dziecko wpisuje iloczyny częściowe i sumę. */
export function multiplyLine(a: number, b: number): string {
  if (String(b).includes('0')) throw new Error(`Mnożenie pisemne: mnożnik ${b} ma zero — takiego zapisu nie rysujemy`);
  const digits = String(b).split('').map(Number).reverse();
  if (digits.length === 1) {
    return `wpisz: Pomnóż pisemnie. Wpisz cyfry w kratki — od prawej strony. >> ${a} · ${b} = [${a * b}] ?? Zacznij od jedności: pomnóż ostatnią cyfrę liczby ${a} przez ${b}. Pamiętaj o przeniesieniu. !! ${a} · ${b} = ${a * b}.`;
  }
  const [u, t] = digits;
  return `wpisz: Pomnóż pisemnie. Wpisz cyfry w kratki — od prawej strony. >> ${a} · ${b} = [${a * b}] ?? Najpierw ${a} · ${u}. Potem ${a} · ${t} — ten iloczyn zapisz o jedno miejsce w lewo. Na końcu dodaj. !! ${a} · ${u} = ${a * u} i ${a} · ${t} = ${a * t} (o jedno miejsce w lewo, bo to dziesiątki). Razem: ${a * u} + ${a * t * 10} = ${a * b}.`;
}

/** Pilnuje, żeby zadania pasowały do tematu (np. bez reszty i bez zera w wyniku tam, gdzie jeszcze ich nie było). */
function requireDivision(a: number, b: number, want: { remainder?: boolean; zero?: boolean }): void {
  const d = longDivision(a, b);
  const zero = String(d.quotient).includes('0');
  if (want.remainder !== undefined && want.remainder !== d.remainder > 0) throw new Error(`${a} : ${b} — reszta ${d.remainder} nie pasuje do tematu`);
  if (want.zero !== undefined && want.zero !== zero) throw new Error(`${a} : ${b} = ${d.quotient} — zero w wyniku nie pasuje do tematu`);
}

function writtenDivBasic(): string {
  const out: string[] = [];
  out.push('wybierz: Od której strony zaczynamy dzielenie pisemne? | *od lewej — od pierwszej cyfry | od prawej — od jedności !! Dodawanie, odejmowanie i mnożenie pisemne zaczynamy od prawej. Dzielenie — odwrotnie, od lewej.');
  out.push('wybierz: Co robimy po kolei w każdym kroku dzielenia pisemnego? | *dzielę, mnożę, odejmuję, spisuję | mnożę, dzielę, spisuję, odejmuję | spisuję, odejmuję, mnożę, dzielę | odejmuję, dzielę, mnożę, spisuję !! Dzielę, mnożę, odejmuję, spisuję — i znowu od początku, aż skończą się cyfry.');
  out.push(firstPartLine(752, 4, [75, 2, 752]));
  out.push(firstPartLine(148, 4, [1, 8, 148]));
  out.push('wybierz: Ile cyfr ma wynik dzielenia 852 : 4? | *3 | 2 | 4 !! 8 da się podzielić przez 4, więc pierwsza cyfra wyniku stoi już nad 8. Każda następna cyfra dzielnej daje jedną cyfrę wyniku: razem trzy.');
  out.push('wybierz: Ile cyfr ma wynik dzielenia 252 : 4? | *2 | 3 | 1 !! 2 jest mniejsze od 4, więc zaczynamy od 25. Pierwsza cyfra wyniku stoi nad 5, druga nad 2: razem dwie.');
  out.push('wybierz: W jednym z kroków dzielenia przez 6 wyszła reszta 7. Co to znaczy? | *cyfra w wyniku jest za mała | wszystko jest dobrze | trzeba spisać dwie cyfry naraz !! Reszta musi być mniejsza od dzielnika. W 7 szóstka mieści się jeszcze raz, więc trzeba wziąć cyfrę o 1 większą.');
  for (const [a, b] of [
    [675, 5],
    [288, 6],
  ]) {
    requireDivision(a, b, { remainder: false, zero: false });
    out.push(guidedLine(a, b));
  }
  for (const [a, b] of [
    [738, 6],
    [852, 4],
    [795, 5],
    [868, 7],
    [972, 3],
    [252, 4],
    [315, 7],
    [448, 8],
    [216, 9],
    [1235, 5],
    [2952, 8],
    [5348, 7],
    [356, 4],
    [518, 7],
    [432, 8],
    [756, 6],
    [628, 4],
    [402, 6],
  ]) {
    requireDivision(a, b, { remainder: false, zero: false });
    out.push(writtenLine(a, b));
  }
  out.push(multiplyLine(157, 4));
  out.push(multiplyLine(213, 3));
  out.push(checkLine(864, 6));
  out.push(checkLine(294, 7));
  out.push('wpisz: Cztery jednakowe bilety do kina kosztowały razem 116 zł. Ile kosztował jeden bilet? >> Jeden bilet kosztował [29] zł. !! 116 : 4 = 29. Sprawdzenie: 29 · 4 = 116.');
  out.push('wpisz: Na 7 półkach ułożono po równo 525 książek. Ile książek stoi na jednej półce? >> Na jednej półce stoi [75] książek. !! 525 : 7 = 75. Sprawdzenie: 75 · 7 = 525.');
  return lines(...out);
}

function writtenDivZeroRest(): string {
  const out: string[] = [];
  out.push('wybierz: Dzielimy pisemnie 618 : 6. Po pierwszym kroku spisujemy 1. Co robimy, skoro 1 jest mniejsze od 6? | *piszemy 0 w wyniku i spisujemy następną cyfrę | nic nie piszemy i spisujemy następną cyfrę | piszemy 1 w wyniku !! 6 nie mieści się w 1 ani razu, więc cyfrą wyniku jest 0. Bez tego zera wyszłoby 13 zamiast 103.');
  out.push('wybierz: Kuba obliczył: 918 : 9 = 12. Co poszło nie tak? | *zgubił zero w środku wyniku | zaczął od prawej strony | nic — wynik jest dobry !! 9 : 9 = 1, potem 1 : 9 = 0 (to zero trzeba zapisać!), na końcu 18 : 9 = 2. Wynik: 102. Sprawdzenie: 12 · 9 = 108, a nie 918.');
  out.push('wybierz: Ola obliczyła: 840 : 4 = 21. Co poszło nie tak? | *zgubiła zero na końcu wyniku | źle odjęła | nic — wynik jest dobry !! Ostatnia cyfra 0 też daje cyfrę wyniku: 0 : 4 = 0. Wynik: 210. Sprawdzenie: 21 · 4 = 84, a nie 840.');
  out.push('wybierz: Która reszta NIE może wyjść przy dzieleniu przez 6? | *6 | 0 | 3 | 5 !! Reszta jest zawsze mniejsza od dzielnika. Przy dzieleniu przez 6 największa możliwa reszta to 5.');
  out.push('wybierz: Jak sprawdzić dzielenie z resztą 47 : 5 = 9 r 2? | *9 · 5 + 2 | 9 · 5 − 2 | 9 · 2 + 5 | 9 + 5 + 2 !! Wynik mnożymy przez dzielnik i dodajemy resztę: 9 · 5 + 2 = 45 + 2 = 47.');
  for (const [a, b] of [
    [618, 6],
    [437, 3],
  ])
    out.push(guidedLine(a, b));
  for (const [a, b] of [
    [612, 6],
    [832, 8],
    [525, 5],
    [3609, 9],
    [5040, 8],
    [1220, 4],
    [2800, 7],
    [960, 6],
  ]) {
    requireDivision(a, b, { remainder: false, zero: true });
    out.push(writtenLine(a, b));
  }
  for (const [a, b] of [
    [745, 6],
    [359, 7],
    [1000, 3],
    [823, 4],
    [964, 9],
    [500, 8],
  ]) {
    requireDivision(a, b, { remainder: true });
    out.push(writtenLine(a, b));
  }
  out.push(checkLine(647, 6));
  out.push(checkLine(816, 8));
  out.push('wpisz: Jajka pakujemy do pudełek po 6 sztuk. Mamy 184 jajka. Ile pudełek będzie pełnych i ile jajek zostanie? >> Pełnych pudełek: [30], zostaną [4] jajka. !! 184 : 6 = 30 r 4. Sprawdzenie: 30 · 6 + 4 = 184.');
  out.push('wpisz: W jednej łódce mieszczą się 4 osoby. Ile łódek potrzeba, żeby popłynęło 150 osób? >> Potrzeba [38] łódek. !! 150 : 4 = 37 r 2. 37 łódek to za mało — dwie osoby też muszą popłynąć, więc potrzeba 38.');
  out.push('wpisz: Tata zapłacił 824 zł za 8 jednakowych krzeseł. Ile kosztowało jedno krzesło? >> Jedno krzesło kosztowało [103] zł. !! 824 : 8 = 103. Sprawdzenie: 103 · 8 = 824.');
  return lines(...out);
}

function writtenDivTwoDigit(): string {
  const out: string[] = [];
  out.push(firstPartLine(952, 17, [9, 52, 952]));
  out.push(firstPartLine(1672, 44, [16, 1, 1672]));
  out.push(fitsLine(130, 41, '41 to około 40'));
  out.push(fitsLine(140, 19, '19 to prawie 20'));
  out.push(fitsLine(215, 43, '43 to około 40'));
  out.push('wybierz: W kroku dzielenia przez 24 wybrano cyfrę 3 i wyszła reszta 30. Co to znaczy? | *cyfra jest za mała — 24 zmieści się jeszcze raz | cyfra jest za duża | wszystko jest dobrze !! Reszta musi być mniejsza od dzielnika. 30 jest większe od 24, więc bierzemy cyfrę o 1 większą.');
  out.push('wybierz: Dzielimy 150 przez 38. Wybrano cyfrę 4, ale 4 · 38 = 152. Co robimy? | *bierzemy cyfrę o 1 mniejszą: 3 | bierzemy cyfrę o 1 większą: 5 | odejmujemy mimo to !! 152 jest większe od 150, więc 38 nie mieści się w 150 cztery razy. Bierzemy 3: 3 · 38 = 114.');
  out.push(`wpisz: Zanim zaczniesz dzielić przez 23, przygotuj ściągę: pomnóż 23 przez 2, 3, 4 i 5. >> 2 · 23 = [${2 * 23}], 3 · 23 = [${3 * 23}], 4 · 23 = [${4 * 23}], 5 · 23 = [${5 * 23}] !! Taka ściąga na marginesie pomaga szybko wybrać cyfrę wyniku.`);
  for (const [a, b] of [
    [952, 17],
    [1672, 44],
  ])
    out.push(guidedLine(a, b));
  for (const [a, b] of [
    [918, 27],
    [805, 23],
    [2075, 25],
    [1456, 13],
    [4592, 56],
    [1008, 42],
    [3264, 32],
    [7626, 31],
    [1058, 23],
    [532, 19],
    [1764, 49],
    [1200, 25],
  ]) {
    requireDivision(a, b, { remainder: false });
    out.push(writtenLine(a, b));
  }
  // Mnożenie pisemne jako sprawdzenie — na innych liczbach niż zadania z dzieleniem, żeby jedno nie podpowiadało drugiego.
  for (const [a, b] of [
    [37, 24],
    [54, 18],
    [63, 27],
    [45, 32],
  ])
    out.push(multiplyLine(a, b));
  for (const [a, b] of [
    [1000, 23],
    [875, 14],
    [2500, 48],
  ]) {
    requireDivision(a, b, { remainder: true });
    out.push(writtenLine(a, b));
  }
  out.push(checkLine(828, 23));
  out.push('wpisz: W sali kinowej są 432 miejsca w 18 równych rzędach. Ile miejsc jest w jednym rzędzie? >> W jednym rzędzie są [24] miejsca. !! 432 : 18 = 24. Sprawdzenie: 24 · 18 = 432.');
  out.push('wpisz: Za 15 jednakowych biletów zapłacono 645 zł. Ile kosztował jeden bilet? >> Jeden bilet kosztował [43] zł. !! 645 : 15 = 43. Sprawdzenie: 43 · 15 = 645.');
  out.push('wpisz: Jajka pakujemy po 12 sztuk. Ile opakowań potrzeba, żeby zapakować 500 jajek? >> Potrzeba [42] opakowań. !! 500 : 12 = 41 r 8. Na 8 jajek, które zostały, potrzebne jest jeszcze jedno opakowanie: 41 + 1 = 42.');
  return lines(...out);
}

export const MATH_GRADE5: Topic[] = [
  builtin(
    'b-m5-dzp-1',
    'mat',
    1,
    'Dzielenie pisemne przez liczbę jednocyfrową',
    'Zaczynamy od lewej strony. W każdym kroku: podziel, pomnóż, odejmij, spisz następną cyfrę.',
    writtenDivBasic(),
    [4, 5, 6],
  ),
  builtin(
    'b-m5-dzp-zero',
    'mat',
    2,
    'Dzielenie pisemne: zero w wyniku i reszta',
    'Gdy liczba jest za mała, żeby ją podzielić, piszemy 0 w wyniku i spisujemy następną cyfrę. Reszta jest zawsze mniejsza od dzielnika.',
    writtenDivZeroRest(),
    [4, 5, 6],
  ),
  builtin(
    'b-m5-dzp-2cyfr',
    'mat',
    3,
    'Dzielenie pisemne przez liczbę dwucyfrową',
    'Bierzemy tyle cyfr, żeby powstała liczba nie mniejsza od dzielnika. Cyfrę wyniku szacujemy i sprawdzamy mnożeniem.',
    writtenDivTwoDigit(),
    [5, 6],
  ),
  builtin('b-m5-ulamki', 'mat', 10, 'Ułamki: skracanie i rozszerzanie', 'Skracamy: dzielimy licznik i mianownik przez tę samą liczbę. Rozszerzamy: mnożymy oba przez tę samą liczbę.', fractionsSimplify(), [5]),
  builtin('b-m5-ulamki-dzialania', 'mat', 20, 'Dodawanie i odejmowanie ułamków', 'Przy tych samych mianownikach dodajemy tylko liczniki. Przy różnych — najpierw sprowadzamy do wspólnego mianownika.', fractionsOps(), [5]),
  builtin('b-m5-dziesietne', 'mat', 30, 'Ułamki dziesiętne', 'Dodając i odejmując, piszemy przecinek pod przecinkiem. Mnożąc przez 10, 100 — przesuwamy przecinek w prawo.', decimals(), [5]),
  builtin('b-m5-pole-obwod', 'mat', 40, 'Pole i obwód prostokąta', 'Pole prostokąta = a · b. Obwód = 2 · a + 2 · b. Kwadrat: pole = a · a, obwód = 4 · a.', areaPerimeter(), [5]),
  builtin('b-m5-kolejnosc', 'mat', 50, 'Kolejność wykonywania działań', 'Najpierw nawiasy, potem mnożenie i dzielenie, na końcu dodawanie i odejmowanie (zawsze od lewej).', orderOfOps(), [5]),
  builtin('b-m5-podzielnosc', 'mat', 60, 'Cechy podzielności', 'Przez 2: cyfra parzysta na końcu. Przez 5: 0 lub 5 na końcu. Przez 10: 0 na końcu. Przez 3 i 9: suma cyfr.', divisibility(), [5]),
];
