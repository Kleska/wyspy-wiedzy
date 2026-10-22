import type { Topic } from '../types';
import { builtin } from './util';

/** Autorskie ćwiczenia według skanu rodzica. Zakres i strony: docs/MATH_CHAPTER2.md. */
export const NATURAL_NUMBERS_UNIT = 'Rozdział 2. W świecie własności liczb naturalnych';

export function positiveDivisors(n: number): number[] {
  if (!Number.isInteger(n) || n <= 0) throw new Error('Lista dzielników wymaga dodatniej liczby całkowitej.');
  return Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
}
export function primeFactors(n: number): number[] {
  if (!Number.isInteger(n) || n < 2) throw new Error('Rozkład wymaga liczby naturalnej większej od 1.');
  const factors: number[] = [];
  for (let d = 2; d * d <= n; d++) while (n % d === 0) { factors.push(d); n /= d; }
  if (n > 1) factors.push(n);
  return factors;
}
export const isPrime = (n: number) => Number.isInteger(n) && n >= 2 && primeFactors(n).length === 1;
const sumDigits = (n: number) => String(n).split('').reduce((s, d) => s + Number(d), 0);
const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
const lcm = (a: number, b: number) => a / gcd(a, b) * b;
const product = (ns: number[]) => ns.reduce((a, b) => a * b, 1);
const sequence = (ns: number[]) => ns.join(', ');
const factorsText = (n: number) => primeFactors(n).join(' · ');
const lines = (...ls: string[]) => ls.join('\n');
function choice(prompt: string, answer: string | number, wrong: (string | number)[], why: string, hint?: string) {
  const alternatives = [...new Set(wrong.map(String))].filter((s) => s !== String(answer));
  if (alternatives.length < 2) throw new Error(`Za mało różnych odpowiedzi: ${prompt}`);
  return `wybierz: ${prompt} | *${answer} | ${alternatives.slice(0, 3).join(' | ')} !! ${why}${hint ? ` ?? ${hint}` : ''}`;
}
function numberChoice(prompt: string, answer: number, why: string) {
  return choice(prompt, answer, [answer + 1, Math.max(0, answer - 1), answer * 2, answer + 3], why);
}
function fill(prompt: string, sentence: string, why: string, hint?: string) {
  return `wpisz: ${prompt} >> ${sentence} !! ${why}${hint ? ` ?? ${hint}` : ''}`;
}
function truth(prompt: string, answer: boolean, why: string) {
  return `wybierz: ${prompt} | ${answer ? '*' : ''}Prawda | ${answer ? '' : '*'}Fałsz !! ${why}`;
}
const RULES: Record<number, string> = {
  2: 'Sprawdź ostatnią cyfrę: musi być równa 0, 2, 4, 6 lub 8.',
  3: 'Suma cyfr musi być podzielna przez 3.',
  4: 'Liczba utworzona przez dwie ostatnie cyfry musi być podzielna przez 4; końcówka 00 też pasuje.',
  5: 'Ostatnia cyfra musi być równa 0 lub 5.',
  9: 'Suma cyfr musi być podzielna przez 9.',
  10: 'Ostatnia cyfra musi być równa 0.',
  100: 'Dwie ostatnie cyfry muszą być zerami.',
};
function divisibility(n: number, d: number) {
  const check = d === 3 || d === 9 ? `Suma cyfr liczby ${n} to ${sumDigits(n)}.` : d === 4 ? `Końcówka liczby ${n} to ${String(n).slice(-2)}.` : `Liczba ${n} kończy się cyfrą ${n % 10}.`;
  return `wybierz: Czy ${n} jest podzielne przez ${d}? | ${n % d === 0 ? '*' : ''}Tak | ${n % d === 0 ? '' : '*'}Nie !! ${check} ${RULES[d]} ?? ${RULES[d]}`;
}
function digitTask(pattern: string, ds: number[], reject: number[] = []) {
  const digits = Array.from({ length: 10 }, (_, i) => i).filter((i) => {
    const n = Number(pattern.replace('□', String(i)));
    return ds.every((d) => n % d === 0) && reject.every((d) => n % d !== 0);
  });
  if (!digits.length) throw new Error(`Brak cyfr: ${pattern}`);
  const condition = ds.map((d) => `przez ${d}`).join(' i ') + (reject.length ? `, ale nie ${reject.map((d) => `przez ${d}`).join(' ani ')}` : '');
  return fill(`W liczbie ${pattern} zastąp □ cyfrą tak, aby liczba była podzielna ${condition}. Wpisz wszystkie możliwości rosnąco.`,
    `Pasujące cyfry: ${digits.map((d) => `[${d}]`).join(', ')}.`,
    `Sprawdzamy cyfry od 0 do 9. Warunki spełniają: ${sequence(digits)}. ${ds.filter((d) => RULES[d]).map((d) => RULES[d]).join(' ')}`);
}
function divisorCount(n: number) {
  const ds = positiveDivisors(n);
  return fill(`Ile dodatnich dzielników ma liczba ${n}?`, `Liczba dzielników: [${ds.length}].`, `Dzielniki ${n}: ${sequence(ds)}. Jest ich ${ds.length}.`, 'Wypisz dzielniki parami, od 1 i samej liczby.');
}
function divisorChoice(n: number) {
  const ds = positiveDivisors(n);
  return choice(`Który zestaw zawiera wszystkie dodatnie dzielniki liczby ${n}?`, sequence(ds),
    [sequence([0, ...ds]), sequence(ds.slice(0, -1)), sequence([...ds, n * 2])],
    `Dzielniki ${n}: ${sequence(ds)}. Zero nie jest dzielnikiem; ${n * 2} jest większe od ${n}.`);
}
function classify(n: number) {
  const answer = n < 2 ? 'ani pierwsza, ani złożona' : isPrime(n) ? 'pierwsza' : 'złożona';
  return choice(`Jaką liczbą jest ${n}?`, answer, ['pierwsza', 'złożona', 'ani pierwsza, ani złożona'],
    n < 2 ? 'Liczby 0 i 1 nie są ani pierwsze, ani złożone.' : `Dodatnie dzielniki ${n}: ${sequence(positiveDivisors(n))}. Liczba pierwsza ma dokładnie dwa różne dzielniki.`,
    'Pierwsza: dwa dzielniki. Złożona: więcej niż dwa. Obie muszą być większe od 1.');
}
function factorTask(n: number) {
  const fs = primeFactors(n);
  return fill(`Rozłóż ${n} na czynniki pierwsze. Wpisuj czynniki od najmniejszego, także powtarzające się.`,
    `${n} = ${fs.map((f) => `[${f}]`).join(' · ')}.`,
    `${n} = ${fs.join(' · ')}. Wszystkie czynniki są pierwsze, a ich iloczyn wynosi ${n}.`,
    'Dziel kolejno przez 2, 3, 5, 7… Używaj tylko dzielników pierwszych.');
}
function factorChoice(n: number, wrong: string[]) {
  return choice(`Który zapis jest rozkładem ${n} na czynniki pierwsze?`, factorsText(n), wrong,
    `${n} = ${factorsText(n)}. Iloczyn musi dawać ${n}, a każdy czynnik musi być liczbą pierwszą.`);
}
function gcdTask(a: number, b: number) {
  return fill(`Oblicz największy wspólny dzielnik liczb ${a} i ${b}.`, `NWD(${a}, ${b}) = [${gcd(a, b)}].`,
    `Wspólne dodatnie dzielniki: ${sequence(positiveDivisors(a).filter((d) => b % d === 0))}. Największy to ${gcd(a, b)}.`, 'Szukaj liczby, która dzieli obie liczby bez reszty.');
}
function lcmTask(a: number, b: number) {
  return fill(`Oblicz najmniejszą wspólną wielokrotność liczb ${a} i ${b}.`, `NWW(${a}, ${b}) = [${lcm(a, b)}].`,
    `${a} = ${factorsText(a)}, a ${b} = ${factorsText(b)}. Dla każdego czynnika bierzemy większą liczbę jego powtórzeń; otrzymujemy ${lcm(a, b)}.`, 'Szukaj najmniejszej dodatniej liczby podzielnej przez obie liczby.');
}
function topic(slug: string, order: number, title: string, description: string, exercises: string[], guide: string, lesson: string): Topic {
  if (exercises.length !== 28) throw new Error(`${slug}: oczekiwano 28 ćwiczeń, otrzymano ${exercises.length}`);
  return { ...builtin(`b-m5-r2-${slug}`, 'mat', order, title, description, lines(...exercises), [5]), unit: NATURAL_NUMBERS_UNIT,
    guide: guide.trim(), lesson: lesson.trim(), updatedAt: '2026-10-22T14:00:00.000Z' };
}

const DIVISIBILITY_2_5 = topic('podzielnosc-2-5-10-100-4', 110, 'Cechy podzielności przez 2, 5, 10, 100 i 4',
  'Rozpoznawaj podzielność bez wykonywania dzielenia. Ćwicz końcówki liczb i uzupełnianie brakujących cyfr.', [
    choice('Który zapis opisuje liczby naturalne przyjęte w tym rozdziale?', '0, 1, 2, 3, …', ['1, 3, 5, 7, …', '0, 2, 4, 6, …', 'tylko liczby od 0 do 100'], 'W tym podręczniku do liczb naturalnych należy 0. Nie istnieje największa liczba naturalna.'),
    choice('Jak sprawdzisz podzielność przez 4?', 'Sprawdzę dwie ostatnie cyfry.', ['Sprawdzę tylko ostatnią cyfrę.', 'Dodam wszystkie cyfry.', 'Sprawdzę pierwsze dwie cyfry.'], RULES[4]),
    ...[[246, 2], [735, 5], [840, 10], [2300, 100], [2310, 100], [1316, 4], [542, 4], [8100, 4]].map(([n, d]) => divisibility(n, d)),
    truth('Każda liczba podzielna przez 10 jest też podzielna przez 2 i przez 5.', true, 'Końcówka 0 spełnia obie cechy podzielności.'),
    truth('Jeśli liczba jest parzysta, na pewno jest podzielna przez 4.', false, 'Na przykład 14 jest parzyste, ale 14 : 4 daje resztę 2.'),
    choice('Która liczba jest podzielna przez 5, ale nie przez 10?', 465, [460, 462, 500], 'Liczba podzielna przez 5 i niepodzielna przez 10 kończy się cyfrą 5.'),
    choice('Która liczba jest podzielna przez 4, choć nie kończy się cyfrą 0?', 732, [734, 738, 730], 'Końcówka 32 jest podzielna przez 4. Nie trzeba kończyć się cyfrą 0.'),
    digitTask('37□', [2]),
    digitTask('46□', [5], [10]),
    fill('Czy 438 zł można zapłacić samymi dwuzłotówkami? Jeśli tak, ile ich potrzeba?', `Potrzeba [${438 / 2}] monet.`, '438 jest parzyste, więc 438 : 2 = 219.'),
    fill('Kartki pakuje się po 100 do paczki i po 10 paczek do kartonu. Ile pełnych kartonów da 42 000 kartek?', `Pełnych kartonów: [${42000 / (100 * 10)}].`, 'W kartonie mieści się 100 · 10 = 1000 kartek. 42 000 : 1000 = 42.'),
    truth('Liczba 0 jest podzielna przez 2, 5, 10 i 100.', true, '0 podzielone przez każdą z tych niezerowych liczb daje 0 bez reszty. Nie wolno natomiast dzielić przez 0.'),
    choice('Ile wynosi reszta z dzielenia 731 przez 10?', 1, [0, 3, 7], 'Cyfra jedności wskazuje resztę: 731 = 73 · 10 + 1.'),
    // Sprawdzian A: cztery umiejętności; B: cztery nowe zadania.
    divisibility(7128, 4),
    digitTask('58□', [5], [2]),
    choice('Która liczba jest podzielna jednocześnie przez 2, 5 i 100?', 6700, [6750, 6705, 6755], 'Końcówka 00 zapewnia podzielność przez 100, a także przez 2 i 5.'),
    truth('Liczba 1432 jest podzielna przez 4, bo 32 dzieli się przez 4.', true, 'O podzielności przez 4 decydują dwie ostatnie cyfry, nie suma cyfr.'),
    divisibility(6834, 4),
    digitTask('61□', [10]),
    choice('Która liczba jest podzielna przez 10, ale nie przez 100?', 9240, [9200, 9245, 9242], '9240 kończy się zerem, ale nie kończy się dwoma zerami.'),
    fill('Bilety kosztują razem 560 zł. Ile banknotów po 20 zł wystarczy na tę kwotę?', `Banknotów: [${560 / 20}].`, '560 : 20 = 28. Sprawdzenie: 28 · 20 = 560.'),
  ], `
Liczby naturalne w tym rozdziale: 0, 1, 2, 3… Nie mają największej liczby.
Podzielność oznacza dzielenie bez reszty. Nigdy nie dziel przez 0.
Przez 2: ostatnia cyfra 0, 2, 4, 6 lub 8. Przez 5: 0 lub 5.
Przez 10: ostatnia cyfra 0. Przez 100: dwie ostatnie cyfry 00.
Przez 4: liczba z dwóch ostatnich cyfr jest podzielna przez 4 (także 00).
Przykład: 2316 dzieli się przez 4, bo 16 : 4 = 4. Sama parzystość nie wystarcza.
`, `
# Najważniejsze
Podzielność to dzielenie bez reszty. Cechy podzielności pozwalają sprawdzić ją bez długich obliczeń.
Przez 2, 5 i 10 patrz na ostatnią cyfrę. Przez 4 i 100 patrz na dwie ostatnie cyfry.
Liczby naturalne zaczynają się tutaj od 0. Nie istnieje największa liczba naturalna.
## Reguły do zapamiętania
Przez 2: Cyfra jedności to 0, 2, 4, 6 lub 8.
Przez 5: Cyfra jedności to 0 lub 5.
Przez 10: Cyfra jedności to 0.
Przez 100: Dwie ostatnie cyfry to 00.
Przez 4: Dwie ostatnie cyfry tworzą liczbę podzielną przez 4, także 00.
## Ważne zależności
Podzielna przez 10: Zawsze podzielna przez 2 i przez 5.
Podzielna przez 100: Zawsze podzielna przez 10 i przez 4.
Podzielna przez 4: Jest parzysta, ale liczba parzysta nie musi dzielić się przez 4.
# Krok po kroku
Ustal, przez jaką liczbę sprawdzasz podzielność.
Wybierz właściwą cechę i obejrzyj końcówkę liczby.
Zapisz wniosek i uzasadnij go tą cechą.
Przykład: 2512 kończy się na 12. Ponieważ 12 : 4 = 3, cała liczba 2512 jest podzielna przez 4.
# Tak / nie tak
tak: 246 jest podzielne przez 2. | nie: 246 musi być podzielne przez 4. | bo: ostatnie dwie cyfry 46 nie tworzą wielokrotności 4.
tak: 750 jest podzielne przez 10. | nie: 750 jest podzielne przez 100. | bo: kończy się na 50, a nie na 00.
tak: 0 : 5 = 0. | nie: 5 : 0 = 0. | bo: wolno dzielić zero przez liczbę niezerową, ale nie wolno dzielić przez zero.
# Zapamiętaj
Jedna końcówka: 2, 5, 10. Dwie końcowe cyfry: 4, 100.
# Sprawdź się
${divisibility(6424, 4)}
${digitTask('92□', [5], [10])}
${truth('Każda liczba podzielna przez 100 dzieli się też przez 4.', true, 'Końcówka 00 jest podzielna przez 4.')}
`);

const DIVISIBILITY_3_9 = topic('podzielnosc-3-9', 120, 'Cechy podzielności przez 3 i 9',
  'Wykorzystuj sumę cyfr, łącz warunki podzielności i szukaj wszystkich pasujących cyfr.', [
    choice('Co sprawdzasz, badając podzielność przez 3?', 'sumę wszystkich cyfr', ['tylko cyfrę jedności', 'dwie pierwsze cyfry', 'liczbę cyfr w zapisie'], RULES[3]),
    ...[[2541, 3], [2541, 9], [6723, 9], [3512, 3], [5004, 9], [7002, 3], [1110, 9]].map(([n, d]) => divisibility(n, d)),
    fill('Oblicz sumę cyfr liczby 72 405.', `Suma cyfr: [${sumDigits(72405)}].`, '7 + 2 + 4 + 0 + 5 = 18. Zera też są cyframi, lecz nie zwiększają sumy.'),
    truth('Każda liczba podzielna przez 9 jest podzielna przez 3.', true, 'Każda wielokrotność 9 jest wielokrotnością 3, bo 9 = 3 · 3.'),
    truth('Każda liczba podzielna przez 3 jest podzielna przez 9.', false, 'Na przykład 12 dzieli się przez 3, ale nie przez 9.'),
    choice('Która liczba jest podzielna przez 3, ale nie przez 9?', 123, [126, 127, 128], '1 + 2 + 3 = 6. Suma 6 jest podzielna przez 3, ale nie przez 9.'),
    digitTask('64□', [9]),
    digitTask('52□', [3]),
    digitTask('7□2', [3], [9]),
    choice('Który warunek zapewnia podzielność przez 6?', 'podzielność przez 2 i przez 3', ['podzielność przez 2 lub przez 3', 'podzielność przez 3 i przez 9', 'parzysta suma cyfr'], '6 = 2 · 3. Liczba musi jednocześnie być parzysta i mieć sumę cyfr podzielną przez 3.'),
    choice('Który warunek zapewnia podzielność przez 18?', 'podzielność przez 2 i przez 9', ['podzielność przez 2 i przez 3', 'podzielność przez 3 i przez 9', 'podzielność przez 9 lub przez 2'], '18 = 2 · 9. Sama podzielność przez 3 nie wystarcza.'),
    fill('Między 620 a 630 wyprodukowano piłeczki. Zapakowano je bez reszty po 9. Ile ich było?', `Piłeczek: [${9 * 69}].`, 'Kolejne wielokrotności 9 to 612, 621 i 630. Ściśle między 620 a 630 leży tylko 621.'),
    truth('Liczba zakończona cyfrą 9 zawsze jest podzielna przez 9.', false, '19 kończy się na 9, ale suma cyfr to 10, więc 19 nie dzieli się przez 9.'),
    digitTask('43□', [3, 5]),
    // A
    divisibility(6309, 9),
    digitTask('71□', [9]),
    choice('Która liczba jest podzielna przez 6?', 1452, [1450, 1453, 1455], '1452 jest parzyste; suma cyfr 1 + 4 + 5 + 2 = 12 jest podzielna przez 3.'),
    truth('Jeśli suma cyfr wynosi 15, liczba dzieli się przez 3, ale nie przez 9.', true, '15 jest podzielne przez 3 i niepodzielne przez 9.'),
    // B
    divisibility(7401, 3),
    digitTask('25□', [3], [9]),
    choice('Która liczba jest podzielna przez 18?', 1278, [1272, 1287, 1280], '1278 jest parzyste, a suma cyfr wynosi 18. Spełnia więc warunki podzielności przez 2 i przez 9.'),
    fill('Dodatnia liczba mniejsza od 100 dzieli się przez 9 i przez 10. Podaj ją.', 'Liczba: [90].', 'Wspólne wielokrotności 9 i 10 to 0, 90, 180… Jedyna dodatnia mniejsza od 100 to 90.'),
  ], `
Przez 3: suma cyfr jest podzielna przez 3. Przez 9: suma cyfr jest podzielna przez 9.
Nie myl sumy cyfr z ostatnią cyfrą ani z liczbą cyfr.
Każda liczba podzielna przez 9 dzieli się przez 3; odwrotnie nie zawsze.
Przez 6: jednocześnie przez 2 i przez 3. Przez 18: jednocześnie przez 2 i przez 9.
Przykład: 2412 ma sumę cyfr 9. Dzieli się przez 3, 9 oraz 18, bo jest też parzyste.
Brakująca cyfra: sprawdź wszystkie cyfry od 0 do 9; warunków może być kilka.
`, `
# Najważniejsze
O podzielności przez 3 i przez 9 decyduje suma wszystkich cyfr liczby.
Liczba podzielna przez 9 zawsze dzieli się przez 3. Odwrotne zdanie jest fałszywe.
Przy kilku warunkach sprawdź każdy z nich; znalezienie jednej pasującej cyfry nie kończy poszukiwań.
## Cechy podzielności
Przez 3: Dodaj cyfry i sprawdź, czy suma dzieli się przez 3.
Przez 9: Dodaj cyfry i sprawdź, czy suma dzieli się przez 9.
Przez 6: Liczba jest parzysta i dzieli się przez 3.
Przez 18: Liczba jest parzysta i dzieli się przez 9.
## Jak szukać brakującej cyfry
Znane cyfry: Oblicz ich sumę.
Możliwe cyfry: Podstawiaj 0, 1, 2… aż do 9.
Dodatkowe warunki: Odrzuć cyfry, które nie spełniają drugiej części polecenia.
# Krok po kroku
Dodaj wszystkie cyfry badanej liczby.
Sprawdź podzielność otrzymanej sumy przez 3 albo przez 9.
Przenieś wniosek na całą liczbę, a nie tylko na jej sumę cyfr.
Przykład: 8127 ma sumę cyfr 8 + 1 + 2 + 7 = 18. Ponieważ 18 dzieli się przez 9, liczba 8127 także dzieli się przez 9.
# Tak / nie tak
tak: 123 dzieli się przez 3. | nie: 123 dzieli się też przez 9. | bo: suma cyfr to 6; nie jest wielokrotnością 9.
tak: W liczbie 531 sumujemy 5 + 3 + 1. | nie: Wystarczy sprawdzić ostatnią cyfrę 1. | bo: przy dzieleniu przez 3 i 9 liczy się suma wszystkich cyfr.
tak: 24 dzieli się przez 6. | nie: 21 dzieli się przez 6, bo dzieli się przez 3. | bo: trzeba jeszcze spełnić podzielność przez 2.
# Zapamiętaj
3 i 9 pytają o sumę cyfr. 6 wymaga 2 i 3, a 18 wymaga 2 i 9.
# Sprawdź się
${divisibility(4815, 9)}
${digitTask('36□', [3], [9])}
${truth('Liczba 81 jest podzielna przez 18.', false, '81 dzieli się przez 9, lecz nie jest parzyste.')}
`);

const DIVISORS = topic('dzielniki', 130, 'Dzielniki',
  'Wyszukuj wszystkie dzielniki, dobieraj pary i rozwiązuj zadania o równym podziale bez reszty.', [
    choice('Dzielnik liczby naturalnej to…', 'niezerowa liczba naturalna, przez którą dzielimy bez reszty', ['dowolna liczba mniejsza od niej', 'wynik każdego dzielenia', 'dowolna wielokrotność tej liczby'], 'Dzielnik musi dawać resztę 0; przez zero nie wolno dzielić.'),
    choice('Która liczba jest dzielnikiem każdej liczby naturalnej?', 1, [0, 2, 10], 'Każda liczba naturalna podzielona przez 1 daje tę samą liczbę bez reszty.'),
    ...[14, 21, 27, 32, 45].map(divisorChoice),
    ...[16, 25, 36, 49].map(divisorCount),
    choice('Która liczba NIE jest dzielnikiem 42?', 8, [1, 6, 7], '42 : 8 daje resztę 2. Pozostałe liczby dzielą 42 bez reszty.'),
    truth('Zero jest dzielnikiem liczby 12.', false, 'Dzielnik nigdy nie jest zerem; dzielenie przez 0 jest niedozwolone.'),
    truth('Liczba 1 ma dokładnie jeden dodatni dzielnik.', true, 'Jedynym dodatnim dzielnikiem liczby 1 jest 1.'),
    choice('Ile dodatnich dzielników ma liczba 0?', 'nieskończenie wiele', ['zero', 'jeden', 'dwa'], 'Każda dodatnia liczba naturalna dzieli 0 bez reszty: 0 : d = 0 dla d > 0.'),
    fill('Dokończ pary dzielników liczby 40.', '1 · [40] = 40; 2 · [20] = 40; 4 · [10] = 40; 5 · [8] = 40.', 'Z iloczynów otrzymujemy wszystkie dzielniki: 1, 2, 4, 5, 8, 10, 20, 40.'),
    numberChoice('Ile parzystych dzielników ma liczba 30?', positiveDivisors(30).filter((d) => d % 2 === 0).length, 'Parzyste dzielniki 30 to 2, 6, 10 i 30, więc są cztery.'),
    numberChoice('Ile nieparzystych dzielników ma liczba 72?', positiveDivisors(72).filter((d) => d % 2 !== 0).length, 'Nieparzyste dzielniki 72 to 1, 3 i 9, więc są trzy.'),
    fill('Masz 35 zdjęć. W każdym rzędzie jest 5 zdjęć, bez reszty. Ile rzędów powstanie?', `Rzędów: [${35 / 5}].`, '35 : 5 = 7. Liczby 5 i 7 są parą dzielników 35.'),
    fill('Ile sposobów wyboru liczby jednakowych pełnych paczek daje 18 ciastek? Dopuszczamy jedną paczkę.', `Sposobów: [${positiveDivisors(18).length}].`, 'Liczba paczek może wynosić 1, 2, 3, 6, 9 lub 18. W każdym przypadku ciastka rozdzielimy bez reszty.'),
    // A
    divisorChoice(44),
    divisorCount(63),
    fill('Liczba dodatnia wynosi 97. Podaj jej najmniejszy i największy dodatni dzielnik.', 'Najmniejszy: [1]; największy: [97].', 'Dla każdej dodatniej liczby n najmniejszy dodatni dzielnik to 1, a największy to n.'),
    choice('Czy 28 figurek można ułożyć w pełne rzędy po 6?', 'Nie, bo zostaną 4 figurki.', ['Tak, bo 28 jest parzyste.', 'Nie, bo zostaną 2 figurki.', 'Tak, powstanie 6 rzędów.'], '28 = 4 · 6 + 4. Parzystość nie wystarcza do podzielności przez 6.'),
    // B
    divisorChoice(52),
    divisorCount(54),
    fill('Uzupełnij brakujące dodatnie dzielniki 26 w kolejności rosnącej.', '1, [2], [13], 26.', 'Pary dzielników to 1 · 26 oraz 2 · 13.'),
    numberChoice('Na ile różnych sposobów można wybrać liczbę równych pełnych rzędów dla 24 krzeseł?', positiveDivisors(24).length, 'Liczba rzędów może być dowolnym dzielnikiem 24: 1, 2, 3, 4, 6, 8, 12, 24. To osiem możliwości.'),
  ], `
Dzielnik to niezerowa liczba naturalna, przez którą dzielimy bez reszty.
Dzielniki dodatniej liczby n szukamy parami, np. 1 · 18, 2 · 9, 3 · 6.
Dzielniki 18: 1, 2, 3, 6, 9, 18. Każdy wypisujemy tylko raz.
Najmniejszy dodatni dzielnik dodatniej liczby to 1; największy to ta liczba.
1 ma jeden dzielnik: 1. Zero nie jest dzielnikiem, ale 0 ma nieskończenie wiele dodatnich dzielników.
Dzielnik i wielokrotność to różne pojęcia: 3 jest dzielnikiem 12, a 12 wielokrotnością 3.
`, `
# Najważniejsze
Dzielnik musi być różny od 0 i dzielić liczbę bez reszty.
Szukaj dzielników parami: jeśli a · b = n, to a i b są dzielnikami n.
Dla dodatniej liczby najmniejszy dodatni dzielnik to 1, a największy to ona sama.
## Ważne przypadki
Liczba 1: Ma jeden dodatni dzielnik, równy 1.
Liczba 0: Dzieli się przez każdą dodatnią liczbę naturalną.
Dzielnik 0: Nie istnieje w tym rozdziale, bo nie wolno dzielić przez zero.
## Szukanie wszystkich dzielników
Pary iloczynów: Sprawdzaj kolejno 1, 2, 3… i dobieraj drugą liczbę w parze.
Pełna lista: Połącz liczby z par i uporządkuj rosnąco, bez powtórzeń.
Kwadrat liczby: W parze 5 · 5 dzielnik 5 wpisujemy tylko raz.
# Krok po kroku
Zacznij od pary 1 i badanej dodatniej liczby.
Sprawdzaj kolejne małe liczby; zapisuj tylko pary z dzieleniem bez reszty.
Gdy pary zaczynają się powtarzać, zbierz wszystkie liczby i uporządkuj je.
Przykład: 20 = 1 · 20 = 2 · 10 = 4 · 5. Dzielniki 20 to 1, 2, 4, 5, 10, 20.
# Tak / nie tak
tak: 4 jest dzielnikiem 20. | nie: Każda liczba mniejsza od 20 jest jego dzielnikiem. | bo: na przykład 20 : 3 daje resztę 2.
tak: 1 jest dzielnikiem 13. | nie: 0 jest dzielnikiem 13. | bo: dzielenie przez zero jest niedozwolone.
tak: Dzielniki 9 to 1, 3 i 9. | nie: Dzielniki 9 to 1, 3, 3 i 9. | bo: każdy różny dzielnik liczymy tylko raz.
# Zapamiętaj
Dzielnik mieści się bez reszty w dodatniej liczbie. Wielokrotność powstaje przez mnożenie.
# Sprawdź się
${divisorCount(81)}
${divisorChoice(22)}
${truth('Każdy dzielnik dodatniej liczby 15 jest nie większy od 15.', true, 'Większą liczbą nie można podzielić 15 bez reszty i otrzymać dodatniego całkowitego wyniku.')}
`);

const PRIMES = topic('pierwsze-zlozone', 140, 'Liczby pierwsze i złożone',
  'Rozpoznawaj liczby na podstawie ich dzielników. Sprawdzaj także liczby nieparzyste i szczególne przypadki 0, 1 oraz 2.', [
    choice('Liczba pierwsza ma…', 'dokładnie dwa różne dodatnie dzielniki', ['jeden dodatni dzielnik', 'co najmniej trzy dodatnie dzielniki', 'zawsze nieparzystą cyfrę jedności'], 'Dzielnikami liczby pierwszej są 1 i ona sama. Najmniejszą liczbą pierwszą jest 2.'),
    choice('Liczba złożona to liczba naturalna większa od 1, która ma…', 'więcej niż dwa różne dodatnie dzielniki', ['dokładnie dwa dzielniki', 'zawsze dzielnik równy 2', 'wyłącznie dzielniki pierwsze'], 'Na przykład 9 ma dzielniki 1, 3, 9, więc jest złożona, choć nie jest parzysta.'),
    ...[0, 1, 2, 17, 39, 51, 67, 91, 97].map(classify),
    'sortuj: Podziel podane liczby na trzy grupy. >> pierwsze = 3, 11, 23 ; złożone = 4, 15, 21 ; ani pierwsze, ani złożone = 0, 1 !! Pierwsza ma dwa dzielniki, złożona więcej niż dwa; 0 i 1 należą do osobnej grupy.',
    truth('Każda liczba nieparzysta większa od 1 jest pierwsza.', false, '9 = 3 · 3 jest nieparzystą liczbą złożoną.'),
    truth('Każda parzysta liczba większa od 2 jest złożona.', true, 'Ma dzielniki 1, 2 i siebie samą; są to co najmniej trzy różne dzielniki.'),
    fill('Podaj jedyną parzystą liczbę pierwszą.', 'Liczba: [2].', '2 ma tylko dwa dzielniki: 1 i 2. Każda większa liczba parzysta ma dodatkowo dzielnik 2.'),
    fill('Ile jest liczb pierwszych mniejszych od 20?', `Liczb pierwszych: [${Array.from({ length: 20 }, (_, i) => i).filter(isPrime).length}].`, 'To 2, 3, 5, 7, 11, 13, 17, 19: osiem liczb.'),
    choice('Który zestaw zawiera wyłącznie liczby złożone?', '33, 49, 77', ['1, 9, 25', '23, 27, 35', '2, 15, 45'], '33 = 3 · 11, 49 = 7 · 7, 77 = 7 · 11. Jedynka nie jest złożona.'),
    choice('Które uzasadnienie dowodzi, że 143 jest złożone?', '143 = 11 · 13', ['143 jest nieparzyste', '143 ma trzy cyfry', 'suma cyfr 143 wynosi 8'], 'Zapis jako iloczyn dwóch liczb większych od 1 wskazuje dodatkowe dzielniki.'),
    fill('Wpisz wszystkie liczby pierwsze większe od 100 i mniejsze od 110, rosnąco.', 'Liczby: [101], [103], [107], [109].', '104, 106 i 108 są parzyste; 102 i 105 dzielą się przez 3. Dla pozostałych kandydatów wystarczy sprawdzić dzielniki pierwsze 2, 3, 5 i 7.'),
    truth('Wykreślanie wielokrotności małych liczb pierwszych pomaga znaleźć liczby pierwsze.', true, 'Zaczynamy od wielokrotności większych od wykreślającej liczby, np. 4, 6, 8… dla 2. Samej 2 nie wykreślamy.'),
    // A
    classify(87),
    choice('Która z podanych liczb jest pierwsza?', 79, [77, 81, 85], '79 nie dzieli się przez 2, 3, 5 ani 7; większych kandydatów nie trzeba sprawdzać, bo 9 · 9 > 79.'),
    truth('Liczba 1 jest pierwsza, bo dzieli się przez samą siebie.', false, 'Pierwsza musi mieć dwa różne dzielniki. Jedynka ma tylko jeden.'),
    fill('Podaj jedną liczbę pierwszą większą od 50 i mniejszą od 60.', 'Liczba: [53|59].', 'Pasują 53 oraz 59; wystarczy jedna z nich. Pozostałe liczby w tym przedziale mają dodatkowe dzielniki.'),
    // B
    classify(121),
    choice('Który zestaw zawiera tylko liczby pierwsze?', '13, 29, 41', ['11, 21, 31', '1, 17, 19', '2, 27, 37'], '13, 29 i 41 mają dokładnie dwa różne dodatnie dzielniki; w pozostałych zestawach są 21, 1 lub 27.'),
    truth('Wszystkie liczby pierwsze większe od 2 są nieparzyste.', true, 'Parzysta liczba większa od 2 ma co najmniej trzy różne dzielniki: 1, 2 oraz siebie.'),
    numberChoice('Ile liczb złożonych jest większych od 20 i mniejszych od 30?', Array.from({ length: 9 }, (_, i) => 21 + i).filter((n) => !isPrime(n)).length, 'Złożone są 21, 22, 24, 25, 26, 27 i 28, czyli siedem. 23 i 29 są pierwsze.'),
  ], `
Liczba pierwsza: większa od 1, dokładnie dwa różne dodatnie dzielniki (1 i ona sama).
Liczba złożona: większa od 1, więcej niż dwa różne dodatnie dzielniki.
0 i 1 nie są ani pierwsze, ani złożone. 2 jest jedyną parzystą liczbą pierwszą.
Pierwsze do 30: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29.
Nieparzysta nie znaczy pierwsza: 9 = 3 · 3, 49 = 7 · 7, 91 = 7 · 13.
Aby wykazać złożoność, znajdź dzielnik różny od 1 i samej liczby, np. 77 = 7 · 11.
`, `
# Najważniejsze
Liczba pierwsza ma dokładnie dwa różne dodatnie dzielniki: 1 i siebie samą.
Liczba złożona jest większa od 1 i ma więcej niż dwa różne dodatnie dzielniki.
0 i 1 nie należą do żadnej z tych grup. 2 jest jedyną parzystą liczbą pierwszą.
## Przykłady i wyjątki
Liczby pierwsze: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29.
Liczby złożone: 4, 6, 8, 9, 10, 12; każdą można zapisać jako iloczyn dwóch liczb większych od 1.
Liczba 1: Ma tylko jeden dzielnik, więc nie jest pierwsza.
Liczba 0: Ma nieskończenie wiele dodatnich dzielników, ale nie jest większa od 1, więc nie jest złożona.
## Jak sprawdzać większe liczby
Złożoność: Wystarczy jeden dzielnik różny od 1 i badanej liczby.
Pierwszość: Sprawdzaj kolejne dzielniki pierwsze 2, 3, 5, 7…
Kiedy zakończyć: Gdy kwadrat kolejnego sprawdzanego dzielnika przewyższa badaną liczbę, nowej pary już nie znajdziesz.
# Krok po kroku
Najpierw wyklucz 0 i 1.
Sprawdź podzielność przez kolejne małe liczby pierwsze.
Znaleziony dodatkowy dzielnik oznacza liczbę złożoną; bez niego liczba jest pierwsza.
Przykład: 91 nie jest parzyste i nie dzieli się przez 3 ani 5. Jednak 91 = 7 · 13, więc jest złożone.
# Tak / nie tak
tak: 2 jest pierwsze. | nie: Każda liczba parzysta jest złożona. | bo: 2 ma dokładnie dwa dzielniki, 1 i 2.
tak: 25 jest złożone. | nie: Każda nieparzysta liczba jest pierwsza. | bo: 25 = 5 · 5, więc ma dodatkowy dzielnik 5.
tak: 1 nie jest liczbą pierwszą. | nie: Wystarczy, że liczba dzieli się przez siebie. | bo: liczba pierwsza wymaga dwóch różnych dzielników.
# Zapamiętaj
Pierwsza: dwa różne dzielniki. Złożona: więcej niż dwa. Osobno stoją 0 i 1.
# Sprawdź się
${classify(57)}
${classify(71)}
${truth('Liczba 49 ma dokładnie dwa różne dodatnie dzielniki.', false, 'Dzielniki 49 to 1, 7 i 49, czyli trzy różne liczby.')}
`);

const FACTORIZATION = topic('rozklad', 150, 'Rozkład liczby na czynniki pierwsze',
  'Rozkładaj liczby przez kolejne dzielenie, uzupełniaj czynniki i sprawdzaj poprawność rozkładu.', [
    choice('Co musi być prawdą w rozkładzie na czynniki pierwsze?', 'Wszystkie czynniki są pierwsze, a ich iloczyn daje badaną liczbę.', ['Wystarczy, że iloczyn daje badaną liczbę.', 'Każdy czynnik zapisuje się tylko raz.', 'Na końcu dopisuje się czynnik 1.'], 'Rozkład to iloczyn samych liczb pierwszych; czynniki mogą się powtarzać.'),
    ...[24, 28, 40, 45, 63, 66, 75, 88, 90, 98].map(factorTask),
    factorChoice(72, ['8 · 9', '2 · 2 · 3 · 3', '2 · 2 · 2 · 3 · 3 · 3']),
    truth('Zapis 36 = 4 · 9 jest rozkładem na czynniki pierwsze.', false, '4 i 9 nie są pierwsze. Trzeba rozłożyć dalej: 36 = 2 · 2 · 3 · 3.'),
    truth('Kolejność czynników pierwszych nie zmienia iloczynu.', true, 'Na przykład 2 · 3 · 5 = 5 · 2 · 3 = 30. W lukach prosimy o kolejność rosnącą wyłącznie dla wygodnego wpisywania.'),
    fill('Oblicz liczbę, której jedynymi czynnikami pierwszymi, z powtórzeniami, są 2, 2, 3 i 7.', `Liczba: [${product([2, 2, 3, 7])}].`, 'Mnożymy wszystkie czynniki: 2 · 2 · 3 · 7 = 84.'),
    fill('Uzupełnij rozkład 150 na czynniki pierwsze.', '150 = 2 · [3] · 5 · [5].', '150 = 2 · 75 = 2 · 3 · 25 = 2 · 3 · 5 · 5.'),
    fill('Ile dwójek występuje w rozkładzie liczby 64 na czynniki pierwsze?', `Dwójek: [${primeFactors(64).filter((n) => n === 2).length}].`, '64 = 2 · 2 · 2 · 2 · 2 · 2, czyli sześć dwójek.'),
    fill('Podaj największy czynnik pierwszy liczby 154.', `Największy czynnik: [${Math.max(...primeFactors(154))}].`, '154 = 2 · 7 · 11, więc największy czynnik pierwszy to 11.'),
    factorChoice(100, ['2 · 5 · 10', '2 · 2 · 5', '2 · 2 · 5 · 5 · 5']),
    truth('Zapis 30 = 1 · 2 · 3 · 5 zawiera wyłącznie czynniki pierwsze.', false, '1 nie jest pierwsze. Rozkład na czynniki pierwsze to 30 = 2 · 3 · 5.'),
    // A
    factorTask(108),
    fill('Odtwórz liczbę z rozkładu 2 · 3 · 3 · 5.', `Liczba: [${product([2, 3, 3, 5])}].`, '2 · 3 · 3 · 5 = 90. Każde powtórzenie czynnika ma znaczenie.'),
    factorChoice(42, ['6 · 7', '2 · 3 · 3 · 7', '2 · 7']),
    fill('Który czynnik pierwszy powtarza się w rozkładzie 147?', 'Powtarzający się czynnik: [7].', '147 = 3 · 7 · 7. Czynnik 7 występuje dwa razy.'),
    // B
    factorTask(120),
    fill('Odtwórz liczbę z rozkładu 2 · 2 · 5 · 7.', `Liczba: [${product([2, 2, 5, 7])}].`, '2 · 2 · 5 · 7 = 140.'),
    factorChoice(60, ['4 · 3 · 5', '2 · 3 · 5', '2 · 2 · 3 · 3 · 5']),
    fill('Podaj największy czynnik pierwszy liczby 165.', `Największy czynnik: [${Math.max(...primeFactors(165))}].`, '165 = 3 · 5 · 11. Największy czynnik pierwszy to 11.'),
  ], `
Rozkład na czynniki pierwsze: zapis liczby większej od 1 jako iloczynu samych liczb pierwszych.
Dziel kolejno przez małe dzielniki pierwsze: 2, 3, 5, 7… Każdy iloraz dziel dalej, aż otrzymasz 1.
Przykład: 84 → 42 → 21 → 7 → 1. Użyte dzielniki: 2, 2, 3, 7.
84 = 2 · 2 · 3 · 7. Sprawdź iloczyn, a nie tylko to, czy czynniki są pierwsze.
Powtarzające się czynniki zostają. 1 nie jest czynnikiem pierwszym.
Kolejność mnożenia nie zmienia wyniku; w lukach wpisuj czynniki od najmniejszego, zgodnie z poleceniem.
`, `
# Najważniejsze
Rozłożyć liczbę na czynniki pierwsze znaczy zapisać ją jako iloczyn samych liczb pierwszych.
Zapis musi odtwarzać wyjściową liczbę i zachowywać każde powtórzenie czynnika.
Możesz dzielić w słupku albo rysować drzewko. Wynik rozkładu jest ten sam z dokładnością do kolejności.
## Dwa warunki poprawności
Same liczby pierwsze: 4, 6, 9, 10 i 1 nie mogą być końcowymi czynnikami.
Właściwy iloczyn: Samo użycie liczb pierwszych nie wystarcza; pomnóż je i sprawdź wynik.
Powtórzenia: 2 · 2 · 3 różni się od 2 · 3; nie wolno usuwać drugiej dwójki.
## Zapis rozkładu
Kolejne dzielenie: Dziel aktualny wynik przez jego najmniejszy dzielnik pierwszy.
Drzewko: Rozbij liczbę na dowolne dwa czynniki większe od 1 i rozkładaj dalej czynniki złożone.
Potęgi: 2 · 2 · 2 · 3 można skrócić do 2³ · 3; w ćwiczeniach wpisujemy pojedyncze czynniki.
# Krok po kroku
Zacznij od najmniejszego dzielnika pierwszego liczby.
Dziel otrzymany iloraz dalej, aż po lewej stronie pozostanie 1.
Pomnóż wszystkie użyte dzielniki i sprawdź wyjściową liczbę.
Przykład: 126 : 2 = 63; 63 : 3 = 21; 21 : 3 = 7; 7 : 7 = 1. Zatem 126 = 2 · 3 · 3 · 7.
# Tak / nie tak
tak: 18 = 2 · 3 · 3. | nie: 18 = 2 · 9 to gotowy rozkład na czynniki pierwsze. | bo: 9 jest złożone i trzeba je rozłożyć dalej.
tak: 40 = 2 · 2 · 2 · 5. | nie: 40 = 2 · 5. | bo: pominięcie powtarzających się dwójek zmienia iloczyn.
tak: Rozkład 15 to 3 · 5. | nie: Trzeba do niego dopisać 1 jako liczbę pierwszą. | bo: 1 nie jest pierwsze.
# Zapamiętaj
Dwa sprawdzenia: czy wszystkie czynniki są pierwsze oraz czy ich iloczyn daje właściwą liczbę.
# Sprawdź się
${factorTask(78)}
${factorChoice(48, ['6 · 8', '2 · 2 · 2 · 3', '2 · 2 · 2 · 2 · 2 · 3'])}
${fill('Ile czynników pierwszych, licząc powtórzenia, ma rozkład 50?', 'Czynników: [3].', '50 = 2 · 5 · 5, więc liczymy trzy czynniki.')}
`);

const GCD_TOPIC = topic('nwd', 160, 'Największy wspólny dzielnik',
  'Znajduj wspólne dzielniki i układaj największą możliwą liczbę jednakowych zestawów. Ćwicz też cięcie na równe części.', [
    choice('Co oznacza NWD dwóch dodatnich liczb?', 'największą liczbę, która dzieli obie bez reszty', ['najmniejszą dodatnią liczbę podzielną przez obie', 'zawsze mniejszą z obu liczb', 'iloczyn wszystkich ich dzielników'], 'Wspólny dzielnik musi dzielić obie liczby; NWD jest największy z takich dzielników.'),
    ...[[18, 30], [28, 42], [36, 54], [48, 72], [35, 64], [84, 126]].map(([a, b]) => gcdTask(a, b)),
    choice('Przy obliczaniu NWD z rozkładów na czynniki pierwsze wybieramy…', 'tylko czynniki wspólne, z mniejszą liczbą powtórzeń', ['wszystkie czynniki z obu rozkładów', 'tylko czynniki różne', 'czynniki wspólne, z większą liczbą powtórzeń'], 'Na przykład 12 = 2 · 2 · 3 i 18 = 2 · 3 · 3. Wspólne są jedna 2 i jedna 3, więc NWD = 6.'),
    fill('Wpisz wszystkie wspólne dodatnie dzielniki 18 i 24, od najmniejszego.', 'Dzielniki: [1], [2], [3], [6].', 'Dzielniki 18 to 1, 2, 3, 6, 9, 18; dzielniki 24 to 1, 2, 3, 4, 6, 8, 12, 24. Wspólne: 1, 2, 3, 6.'),
    fill('Z 60 czerwonych i 84 niebieskich koralików zrób jak najwięcej jednakowych zestawów. Zużyj wszystkie koraliki. Ile zestawów powstanie?', `Zestawów: [${gcd(60, 84)}].`, 'Liczba zestawów musi dzielić 60 i 84. NWD(60, 84) = 12, więc powstanie 12 zestawów.'),
    fill('45 jabłek i 30 gruszek dzielimy na największą liczbę jednakowych paczek, zużywając wszystkie owoce. Ile owoców każdego rodzaju będzie w paczce?', `Jabłek: [${45 / gcd(45, 30)}]; gruszek: [${30 / gcd(45, 30)}].`, 'NWD(45, 30) = 15 paczek. W każdej są 45 : 15 = 3 jabłka i 30 : 15 = 2 gruszki.'),
    fill('Prostokąt 54 cm na 36 cm tniemy bez odpadów na jednakowe, możliwie największe kwadraty. Jaki bok ma kwadrat?', `Bok: [${gcd(54, 36)}] cm.`, 'Bok musi dzielić oba wymiary bez reszty. NWD(54, 36) = 18.'),
    fill('Dwie wstążki mają 42 cm i 56 cm. Tniemy je bez odpadów na najdłuższe jednakowe odcinki. Jaką długość ma odcinek?', `Długość: [${gcd(42, 56)}] cm.`, 'Szukamy największego wspólnego dzielnika długości. NWD(42, 56) = 14.'),
    fill('Oblicz największy wspólny dzielnik trzech liczb: 18, 30 i 42.', `NWD(18, 30, 42) = [${gcd(gcd(18, 30), 42)}].`, 'Wspólne dzielniki wszystkich trzech liczb to 1, 2, 3 i 6. Największy to 6.'),
    truth('Jeśli dwie dodatnie liczby nie mają wspólnego dzielnika większego od 1, ich NWD wynosi 1.', true, '1 zawsze dzieli obie liczby. Takie liczby nazywamy względnie pierwszymi; nie muszą same być pierwsze.'),
    truth('Jeśli mniejsza dodatnia liczba dzieli większą, NWD jest równe mniejszej liczbie.', true, 'Na przykład 8 dzieli 24 i NWD(8, 24) = 8. Większego wspólnego dzielnika nie może mieć liczba 8.'),
    choice('Chcesz rozdzielić wszystkie 28 ołówków i 42 gumki na największą liczbę jednakowych zestawów. Czego szukasz?', 'NWD(28, 42)', ['NWW(28, 42)', '28 + 42', '42 − 28'], 'Liczba zestawów musi dzielić obie ilości; szukamy największej takiej liczby.'),
    fill('30 cukierków i 45 naklejek podzielono na największą liczbę jednakowych nagród. Ile cukierków i naklejek jest w jednej?', `Cukierków: [${30 / gcd(30, 45)}]; naklejek: [${45 / gcd(30, 45)}].`, 'NWD(30, 45) = 15 nagród. 30 : 15 = 2 cukierki; 45 : 15 = 3 naklejki.'),
    choice('Kto poprawnie obliczył NWD(12, 20)?', 'Osoba, która wybrała wspólne czynniki 2 · 2 = 4.', ['Osoba, która wybrała 2 · 2 · 3 · 5 = 60.', 'Osoba, która dodała 12 + 20 = 32.', 'Osoba, która wybrała większą liczbę 20.'], 'NWD = 4. Wartość 60 to NWW, które nie jest dzielnikiem 12 ani 20.'),
    'pary: Połącz parę liczb z jej NWD. >> 12 i 18 = 6 ; 20 i 30 = 10 ; 28 i 42 = 14 ; 16 i 40 = 8 !! Wybieramy największy wspólny dzielnik: odpowiednio 6, 10, 14 i 8.',
    // A
    gcdTask(56, 72),
    fill('Zużyj 36 zakładek i 48 naklejek na największą liczbę jednakowych upominków. Ile upominków powstanie?', `Upominków: [${gcd(36, 48)}].`, 'NWD(36, 48) = 12. Każdy upominek zawiera 3 zakładki i 4 naklejki.'),
    fill('Prostokątną kartkę 72 cm na 90 cm tniemy bez odpadów na jednakowe, największe kwadraty. Podaj bok kwadratu.', `Bok: [${gcd(72, 90)}] cm.`, 'Największy bok dzielący oba wymiary to NWD(72, 90) = 18 cm.'),
    truth('NWD(9, 10) = 1, mimo że ani 9, ani 10 nie jest pierwsze.', true, 'Jedyny wspólny dodatni dzielnik 9 i 10 to 1. Pierwszość każdej z liczb to inne pojęcie.'),
    // B
    gcdTask(45, 75),
    fill('Sznurki 64 cm i 80 cm potnij bez odpadów na najdłuższe jednakowe odcinki. Jaka jest ich długość?', `Długość: [${gcd(64, 80)}] cm.`, 'NWD(64, 80) = 16, więc odcinki mają po 16 cm.'),
    fill('Podaj NWD trzech liczb 24, 36 i 60.', `NWD(24, 36, 60) = [${gcd(gcd(24, 36), 60)}].`, '24 = 2 · 2 · 2 · 3; 36 = 2 · 2 · 3 · 3; 60 = 2 · 2 · 3 · 5. Wspólne są 2 · 2 · 3 = 12.'),
    choice('Który wynik jest NWD liczb 14 i 21?', gcd(14, 21), [lcm(14, 21), 3, 1], 'Wspólne dzielniki 14 i 21 to 1 i 7. Największy to 7; 42 jest ich NWW.'),
  ], `
NWD to największa liczba naturalna dzieląca dwie dodatnie liczby bez reszty.
Sposób 1: wypisz dzielniki obu liczb, zaznacz wspólne i wybierz największy.
Sposób 2: rozłóż na czynniki pierwsze; dla wspólnych czynników wybierz mniejszą liczbę powtórzeń.
Przykład: 36 = 2 · 2 · 3 · 3, 60 = 2 · 2 · 3 · 5. NWD(36, 60) = 2 · 2 · 3 = 12.
Zastosowania: największa liczba identycznych zestawów, najdłuższe równe odcinki, największe kwadraty bez odpadów.
NWD może wynosić 1. Nie przekracza mniejszej dodatniej liczby.
`, `
# Najważniejsze
NWD jest największą liczbą, przez którą obie dodatnie liczby dzielą się bez reszty.
Przy podziale na jednakowe zestawy ich liczba musi być dzielnikiem każdej użytej ilości.
W rozkładach wybierz tylko wspólne czynniki pierwsze, z mniejszą liczbą powtórzeń.
## Dwie metody
Lista dzielników: Wypisz dzielniki obu liczb, zaznacz wspólne i wybierz największy.
Rozkład na czynniki: 18 = 2 · 3 · 3 oraz 24 = 2 · 2 · 2 · 3. Wspólne czynniki dają 2 · 3 = 6.
Trzy liczby: Wybierz czynniki występujące we wszystkich trzech rozkładach.
## Kiedy użyć NWD
Identyczne zestawy: Szukamy największej ich liczby, wykorzystując wszystkie przedmioty.
Cięcie bez odpadów: Szukamy największej wspólnej długości lub boku kwadratu.
Zawartość zestawu: Po znalezieniu liczby zestawów podziel przez nią każdą ilość osobno.
# Krok po kroku
Wypisz ilości i ustal, co trzeba dzielić bez reszty.
Oblicz NWD obu liczb jedną z poznanych metod.
Sprawdź, czy pytanie dotyczy liczby zestawów, czy zawartości pojedynczego zestawu.
Przykład: 42 jabłka i 70 gruszek dają NWD(42, 70) = 14 jednakowych paczek. W jednej są 3 jabłka oraz 5 gruszek.
# Tak / nie tak
tak: NWD(8, 12) = 4. | nie: NWD(8, 12) = 24. | bo: 24 nie dzieli 8 ani 12; jest ich wspólną wielokrotnością.
tak: NWD(8, 15) = 1. | nie: Skoro nie ma wspólnej liczby pierwszej, NWD nie istnieje. | bo: 1 jest wspólnym dzielnikiem każdej pary dodatnich liczb.
tak: NWD(30, 42) = 6 zestawów. | nie: Każdy z tych zestawów ma po 6 sztuk obu rodzajów. | bo: zawartość liczymy osobno: 30 : 6 = 5 i 42 : 6 = 7.
# Zapamiętaj
NWD dzieli liczby: sprawdź, czy oba dzielenia przez otrzymany wynik dają resztę 0.
# Sprawdź się
${gcdTask(40, 56)}
${fill('24 białe i 40 czarnych pionków dzielimy na największą liczbę jednakowych kompletów. Ile czarnych pionków jest w jednym?', 'Czarnych pionków: [5].', 'NWD(24, 40) = 8 kompletów. Czarnych pionków jest w każdym 40 : 8 = 5.')}
${truth('NWD(12, 48) = 12.', true, '12 dzieli 48 i jest największym dzielnikiem liczby 12.')}
`);

const LCM_TOPIC = topic('nww', 170, 'Najmniejsza wspólna wielokrotność',
  'Wyznaczaj wielokrotności i obliczaj, kiedy zdarzenia powtórzą się jednocześnie. Odróżniaj NWW od NWD.', [
    choice('Co oznacza NWW dwóch dodatnich liczb?', 'najmniejszą dodatnią liczbę podzielną przez obie', ['największy wspólny dzielnik', 'najmniejszą wspólną liczbę, czyli zawsze 0', 'zawsze iloczyn obu liczb'], '0 jest wspólną wielokrotnością, ale przy NWW wybieramy liczbę różną od zera.'),
    fill('Dokończ początek listy wielokrotności liczby 7.', '0, 7, 14, [21], [28], [35].', 'Mnożymy 7 przez 0, 1, 2, 3, 4, 5. Każdy kolejny wynik jest większy o 7.'),
    truth('0 jest wielokrotnością każdej dodatniej liczby naturalnej.', true, 'Dla każdej dodatniej liczby n zachodzi n · 0 = 0.'),
    truth('Wielokrotności dodatniej liczby naturalnej jest nieskończenie wiele.', true, 'Mnożąc dodatnią liczbę kolejno przez 0, 1, 2… otrzymujemy coraz większe wyniki. Uwaga: jedyną wielokrotnością 0 jest 0.'),
    ...[[4, 6], [6, 10], [8, 12], [9, 15], [12, 18], [7, 9], [8, 24]].map(([a, b]) => lcmTask(a, b)),
    choice('Jak dobierasz czynniki pierwsze do NWW?', 'Dla każdego czynnika biorę większą liczbę powtórzeń z obu rozkładów.', ['Biorę wyłącznie wspólne czynniki z mniejszą liczbą powtórzeń.', 'Dodaję wszystkie czynniki z obu rozkładów.', 'Zawsze mnożę obie liczby bez sprawdzania.'], 'NWW musi zawierać tyle kopii każdego czynnika, aby dzielić się przez obie liczby.'),
    fill('Dwie lampki migają co 8 s i co 12 s. Właśnie błysnęły razem. Po ilu sekundach błysną razem ponownie?', `Sekund: [${lcm(8, 12)}].`, 'Szukamy pierwszego dodatniego czasu wspólnego dla obu cykli: NWW(8, 12) = 24.'),
    fill('Autobusy odjeżdżają co 12 min i co 15 min. Ruszyły razem o 9:00. Po ilu minutach ponownie odjadą razem?', `Minut: [${lcm(12, 15)}].`, 'NWW(12, 15) = 60. Wspólny odjazd nastąpi o 10:00.'),
    fill('Pudełka mieszczą po 6 lub po 8 kredek. Jaka najmniejsza dodatnia liczba kredek pozwala wypełnić bez reszty pudełka każdego z tych rozmiarów?', `Kredek: [${lcm(6, 8)}].`, '24 kredki można zapakować w 4 pudełka po 6 albo w 3 pudełka po 8. NWW(6, 8) = 24.'),
    fill('Dwa treningi odbywają się co 6 dni i co 8 dni. Były razem w poniedziałek. Po ilu dniach znów wypadną razem?', `Dni: [${lcm(6, 8)}].`, 'NWW(6, 8) = 24 dni. To 3 tygodnie i 3 dni, więc kolejne wspólne zajęcia będą w czwartek.'),
    fill('Oblicz najmniejszą wspólną wielokrotność liczb 4, 6 i 10.', `NWW(4, 6, 10) = [${lcm(lcm(4, 6), 10)}].`, '4 = 2 · 2, 6 = 2 · 3, 10 = 2 · 5. Bierzemy 2 · 2 · 3 · 5 = 60.'),
    truth('Jeśli jedna dodatnia liczba jest wielokrotnością drugiej, ich NWW jest większą z nich.', true, 'Na przykład 24 dzieli się przez 8, więc NWW(8, 24) = 24.'),
    choice('Lampki migają co 9 s i co 12 s. Aby znaleźć pierwszy kolejny wspólny błysk, obliczysz…', 'NWW(9, 12)', ['NWD(9, 12)', '12 − 9', '9 + 12'], 'Czas musi być wielokrotnością obu odstępów. Nie szukamy ich dzielnika.'),
    fill('Dla liczb 12 i 20 oblicz oba wyniki i porównaj je.', `NWD = [${gcd(12, 20)}]; NWW = [${lcm(12, 20)}].`, '12 = 2 · 2 · 3, 20 = 2 · 2 · 5. NWD = 4; NWW = 60. Dzielnik jest mały, a wspólna dodatnia wielokrotność nie może być mniejsza od żadnej z liczb.'),
    // A
    lcmTask(10, 14),
    fill('Dzwonki odzywają się co 6 min i co 15 min. Właśnie zabrzmiały razem. Po ilu minutach zabrzmią razem ponownie?', `Minut: [${lcm(6, 15)}].`, 'Pierwszy dodatni wspólny czas to NWW(6, 15) = 30 minut.'),
    fill('Autobusy odjeżdżają co 8 min i co 20 min. Odjechały razem o 10:00. O której nastąpi pierwszy kolejny wspólny odjazd?', 'Godzina: [10]:[40].', 'NWW(8, 20) = 40 minut. 10:00 + 40 minut = 10:40.'),
    truth('NWW(6, 9) wynosi 0, bo 0 jest wspólną wielokrotnością.', false, 'NWW musi być dodatnie. NWW(6, 9) = 18.'),
    // B
    lcmTask(12, 16),
    fill('Dwie osoby chodzą na basen co 4 i co 10 dni. Dziś spotkały się na basenie. Po ilu dniach spotkają się tam ponownie?', `Dni: [${lcm(4, 10)}].`, 'Pierwszy wspólny termin po dzisiejszym dniu przypada po NWW(4, 10) = 20 dniach.'),
    fill('Dla liczb 18 i 24 wpisz największy wspólny dzielnik i najmniejszą wspólną wielokrotność.', `NWD = [${gcd(18, 24)}]; NWW = [${lcm(18, 24)}].`, '18 = 2 · 3 · 3; 24 = 2 · 2 · 2 · 3. NWD = 2 · 3 = 6; NWW = 2 · 2 · 2 · 3 · 3 = 72.'),
    choice('Które zadanie wymaga obliczenia NWW?', 'Zdarzenia powtarzają się co 5 i co 8 dni. Kiedy znów wystąpią razem?', ['Ile jednakowych paczek zrobisz z 20 i 30 przedmiotów?', 'Na jakie najdłuższe równe kawałki pociąć 20 cm i 30 cm?', 'Jaki jest największy wspólny dzielnik 20 i 30?'], 'Wspólny przyszły termin jest wielokrotnością obu okresów. Dwa kolejne zadania dotyczą największego wspólnego dzielnika.'),
  ], `
Wielokrotności dodatniej liczby a: 0, a, 2 · a, 3 · a… Jest ich nieskończenie wiele.
0 jest wielokrotnością każdej liczby, ale NWW dodatnich liczb szukamy wśród liczb dodatnich.
NWW to najmniejsza dodatnia liczba podzielna przez obie badane liczby.
Metody: wypisz wielokrotności lub rozłóż na czynniki pierwsze. Dla każdego czynnika wybierz większą liczbę powtórzeń.
Przykład: 12 = 2 · 2 · 3, 18 = 2 · 3 · 3. NWW(12, 18) = 2 · 2 · 3 · 3 = 36.
NWW: pierwszy kolejny wspólny termin. NWD: równy podział wszystkich przedmiotów na największą liczbę zestawów.
`, `
# Najważniejsze
Wielokrotności otrzymujesz, mnożąc liczbę przez 0, 1, 2, 3…
NWW dwóch dodatnich liczb to ich najmniejsza wspólna wielokrotność różna od 0.
Użyj NWW, gdy szukasz pierwszego kolejnego wspólnego terminu powtarzających się zdarzeń.
## Jak wyznaczyć NWW
Lista wielokrotności: Wypisuj dodatnie wielokrotności obu liczb do pierwszej wspólnej.
Czynniki pierwsze: Dla każdego czynnika weź większą liczbę powtórzeń w obu rozkładach.
Kontrola: Wynik musi dzielić się przez obie liczby bez reszty i być możliwie najmniejszy dodatni.
## NWD czy NWW
NWD: Dzielisz całe zapasy na największą liczbę jednakowych paczek albo szukasz najdłuższych równych odcinków.
NWW: Szukasz wspólnej dodatniej ilości lub pierwszego kolejnego wspólnego terminu.
Przypadek zera: 0 jest wspólną wielokrotnością, ale nie wynikiem NWW dodatnich liczb.
# Krok po kroku
Ustal odstępy czasowe albo liczby, których wielokrotności są potrzebne.
Oblicz pierwszą dodatnią wspólną wielokrotność.
Jeśli zadanie pyta o godzinę lub dzień tygodnia, dodaj otrzymany odstęp do chwili początkowej.
Przykład: Lampki migają co 10 i co 15 sekund. Wielokrotności to 10, 20, 30… oraz 15, 30… Pierwszy kolejny wspólny błysk nastąpi po 30 sekundach.
# Tak / nie tak
tak: NWW(4, 6) = 12. | nie: NWW(4, 6) = 0. | bo: definicja NWW wymaga liczby różnej od zera.
tak: NWW(6, 8) = 24. | nie: Wystarczy zawsze pomnożyć 6 · 8 = 48. | bo: 48 jest wspólne, ale nie najmniejsze; wspólne czynniki liczymy tylko w potrzebnej liczbie powtórzeń.
tak: Ponowny wspólny termin liczymy przez NWW. | nie: NWD określa pierwszy kolejny wspólny termin. | bo: czas musi być wielokrotnością obu okresów, nie ich dzielnikiem.
# Zapamiętaj
NWD dzieli. NWW jest podzielne przez obie liczby. Po obliczeniu zadaj sobie pytanie, czy wynik ma sens w treści zadania.
# Sprawdź się
${lcmTask(15, 20)}
${fill('Dzwonki dzwonią co 4 i co 9 minut. Po ilu minutach od wspólnego dźwięku zabrzmią razem ponownie?', 'Minut: [36].', 'NWW(4, 9) = 36. Dopiero ten dodatni odstęp jest wielokrotnością 4 i 9.')}
${truth('NWW(5, 15) = 15.', true, '15 jest wielokrotnością 5 i siebie; mniejsza dodatnia wspólna wielokrotność nie istnieje.')}
`);

export const MATH_NATURAL5: Topic[] = [DIVISIBILITY_2_5, DIVISIBILITY_3_9, DIVISORS, PRIMES, FACTORIZATION, GCD_TOPIC, LCM_TOPIC];
