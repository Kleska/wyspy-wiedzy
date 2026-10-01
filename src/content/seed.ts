import type { Subject, Topic } from '../types';
import { DICTATION_GRADE3, DICTATION_GRADE5 } from './dictation';
import { GUIDES } from './guides';
import { MATH_GRADE3, MATH_GRADE5 } from './math';
import { POLISH_GRADE5 } from './polish5';
import { builtin } from './util';

export const SUBJECTS: Subject[] = [
  { id: 'pl', name: 'Język polski', short: 'Aa', island: 'Wyspa Polskiego' },
  { id: 'mat', name: 'Matematyka', short: '123', island: 'Wyspa Matematyki' },
  { id: 'ang', name: 'Angielski', short: 'ENG', island: 'Wyspa Angielskiego' },
  { id: 'prz', name: 'Przyroda', short: 'PRZ', island: 'Wyspa Przyrody' },
  { id: 'inne', name: 'Inne', short: 'INNE', island: 'Wyspa Różności' },
];

export function subjectOf(id: string): Subject {
  return SUBJECTS.find((s) => s.id === id) ?? { id, name: id, short: id.slice(0, 4).toUpperCase(), island: `Wyspa: ${id}` };
}

export function subjectName(id: string): string {
  return SUBJECTS.find((s) => s.id === id)?.name ?? id;
}



/*
 * Tematy wbudowane. Każda zmiana linii zmienia identyfikator zadania (postęp tego
 * jednego zadania zacznie się od nowa), więc poprawiaj rozważnie.
 */
const GRADE3_BASE: Topic[] = [
  builtin(
    'b-rzeczownik',
    'pl',
    10,
    'Rzeczownik — kto? co?',
    'Rzeczownik to nazwa osoby, zwierzęcia, rośliny, rzeczy albo zjawiska. Pytamy o niego: kto? co?',
    `
wybierz: Które słowo jest rzeczownikiem? | *pies | biega | wesoły | szybko !! Pies — kto to? To nazwa zwierzęcia, czyli rzeczownik.
wybierz: Które słowo jest rzeczownikiem? | *książka | czyta | ciekawa | głośno !! Książka — co to? To nazwa rzeczy, czyli rzeczownik.
wybierz: Które słowo jest rzeczownikiem? | *deszcz | pada | mokry | wczoraj !! Deszcz — co to? Zjawiska przyrody też są rzeczownikami.
wybierz: Które słowo NIE jest rzeczownikiem? | *skacze | kot | drzewo | mama !! „Skacze” mówi, co ktoś robi — to czasownik.
wybierz: Które słowo jest nazwą osoby? | *lekarz | leczy | zdrowy | pomaga !! Lekarz — kto to? To rzeczownik, nazwa osoby.
wybierz: Na jakie pytania odpowiada rzeczownik? | *kto? co? | co robi? | jaki? jaka? jakie? | kiedy? !! Rzeczownik to nazwa, więc pytamy: kto? co?
kliknij: Kliknij wszystkie rzeczowniki. >> *Kot* śpi na *kanapie*. !! Kto śpi? Kot. Na czym? Na kanapie. Oba słowa to nazwy — rzeczowniki.
kliknij: Kliknij wszystkie rzeczowniki. >> *Tata* kupił nową *piłkę*. !! Kto kupił? Tata. Co kupił? Piłkę.
kliknij: Kliknij wszystkie rzeczowniki. >> W *ogrodzie* rosną *róże* i *tulipany*. !! Ogród, róże, tulipany — to nazwy miejsca i roślin.
kliknij: Kliknij wszystkie rzeczowniki. >> *Ola* rysuje *słońce* *kredkami*. !! Ola (kto?), słońce (co?), kredki (czym? — to też nazwa rzeczy).
kliknij: Kliknij wszystkie rzeczowniki. >> *Dzieci* budują *zamek* z *piasku*. !! Dzieci, zamek, piasek — to nazwy osób i rzeczy.
sortuj: Rzeczownik czy inne słowo? >> rzeczownik = rower, lampa, żaba, mleko ; inne słowo = jedzie, mały, śpiewa, zielona !! Rzeczownik to nazwa: rower, lampa, żaba, mleko.
wpisz: Dopisz rzeczownik, który pasuje. >> Na niebie świeci [słońce|księżyc|gwiazda]. !! Co świeci na niebie? Słońce, księżyc albo gwiazda — to rzeczowniki.
pary: Połącz rzeczownik z grupą, do której należy. >> jabłko = owoc ; marchewka = warzywo ; wróbel = ptak ; dąb = drzewo !! Wszystkie te słowa to rzeczowniki — nazwy rzeczy, roślin i zwierząt.
`,
  ),
  builtin(
    'b-czasownik',
    'pl',
    20,
    'Czasownik — co robi?',
    'Czasownik mówi, co ktoś lub coś robi albo co się z nim dzieje. Pytamy: co robi? co się z nim dzieje?',
    `
wybierz: Które słowo jest czasownikiem? | *biega | kot | szybki | bardzo !! Biega — co robi? To czynność, więc czasownik.
wybierz: Które słowo jest czasownikiem? | *pisze | zeszyt | niebieski | ładnie !! Pisze — co robi? To czasownik.
wybierz: Które słowo jest czasownikiem? | *śpiewa | piosenka | głośny | wesoło !! Śpiewa — co robi? To czasownik.
wybierz: Które słowo NIE jest czasownikiem? | *stół | je | pływa | czyta !! Stół to nazwa rzeczy — rzeczownik. Pozostałe słowa mówią, co ktoś robi.
wybierz: Na jakie pytanie odpowiada czasownik? | *co robi? | kto? co? | jaki? | ile? !! Czasownik mówi o czynności — pytamy: co robi? co się z nim dzieje?
wybierz: Co się dzieje ze śniegiem? Wybierz czasownik. >> Śnieg ___ na słońcu. | *topnieje | biały | zima | zimny !! Co się dzieje ze śniegiem? Topnieje. To czasownik.
kliknij: Kliknij czasownik. >> Mama *piecze* pyszne ciasto. !! Co robi mama? Piecze.
kliknij: Kliknij czasownik. >> Pies głośno *szczeka* na listonosza. !! Co robi pies? Szczeka.
kliknij: Kliknij czasownik. >> Liście *spadają* z drzew. !! Co się dzieje z liśćmi? Spadają.
kliknij: Kliknij wszystkie czasowniki. >> Kasia *śpiewa* i *tańczy*. !! Co robi Kasia? Śpiewa i tańczy — dwa czasowniki.
kliknij: Kliknij wszystkie czasowniki. >> Rano *wstaję*, *myję* zęby i *jem* śniadanie. !! Co robię? Wstaję, myję, jem.
sortuj: Czasownik czy inne słowo? >> czasownik = skacze, rysuje, płynie, śpi ; inne słowo = rybka, miękki, dom, wysoka !! Czasowniki mówią, co ktoś robi: skacze, rysuje, płynie, śpi.
wpisz: Co robi ptak? Dopisz czasownik. >> Ptak [lata|leci|śpiewa|fruwa|szybuje|krąży] nad łąką. !! Na przykład: ptak lata, leci albo śpiewa.
pary: Połącz, kto co robi. >> kucharz = gotuje ; malarz = maluje ; pilot = kieruje samolotem ; listonosz = roznosi listy !! Gotuje, maluje, kieruje, roznosi — to czasowniki.
`,
  ),
  builtin(
    'b-przymiotnik',
    'pl',
    30,
    'Przymiotnik — jaki? jaka? jakie?',
    'Przymiotnik opisuje, jaki jest ktoś lub coś. Pytamy: jaki? jaka? jakie?',
    `
wybierz: Które słowo jest przymiotnikiem? | *czerwony | jabłko | rośnie | wysoko !! Jaki? Czerwony — opisuje cechę, więc to przymiotnik.
wybierz: Które słowo jest przymiotnikiem? | *miękka | poduszka | leży | tutaj !! Jaka? Miękka — to przymiotnik.
wybierz: Które słowo jest przymiotnikiem? | *wesołe | dziecko | skacze | razem !! Jakie? Wesołe — to przymiotnik.
wybierz: Na jakie pytania odpowiada przymiotnik? | *jaki? jaka? jakie? | kto? co? | co robi? | gdzie? !! Przymiotnik opisuje cechy — pytamy: jaki? jaka? jakie?
wybierz: Który wyraz mówi, JAKA jest zupa? | *gorąca | zupa | gotuje | talerz !! Jaka zupa? Gorąca.
kliknij: Kliknij przymiotnik. >> Mam *nowy* rower. !! Jaki rower? Nowy.
kliknij: Kliknij wszystkie przymiotniki. >> *Mały* kotek pije *ciepłe* mleko. !! Jaki kotek? Mały. Jakie mleko? Ciepłe.
kliknij: Kliknij wszystkie przymiotniki. >> Na *zielonej* łące pasie się *brązowa* krowa. !! Jakiej łące? Zielonej. Jaka krowa? Brązowa.
kliknij: Kliknij wszystkie przymiotniki. >> *Stary* dąb ma *grube* gałęzie. !! Jaki dąb? Stary. Jakie gałęzie? Grube.
sortuj: Przymiotnik czy inne słowo? >> przymiotnik = zimny, słodka, duże, puszysty ; inne słowo = lody, czyta, kwiat, biegnie !! Przymiotniki opisują: zimny, słodka, duże, puszysty.
wpisz: Jaka jest cytryna? Dopisz przymiotnik. >> Cytryna jest [kwaśna|żółta|soczysta]. !! Na przykład: kwaśna albo żółta.
pary: Połącz rzeczownik z pasującym przymiotnikiem. >> słoń = ogromny ; mysz = malutka ; lód = zimny ; ogień = gorący !! Przymiotnik mówi, jaki jest słoń, mysz, lód i ogień.
`,
  ),
  builtin(
    'b-czesci-mowy',
    'pl',
    40,
    'Części mowy — mieszanka',
    'Rzeczownik: kto? co? · Czasownik: co robi? · Przymiotnik: jaki? jaka? jakie?',
    `
sortuj: Posegreguj słowa. >> rzeczownik = kot, szkoła, rower ; czasownik = biega, czyta, pływa !! Kto? co? — rzeczownik. Co robi? — czasownik.
sortuj: Posegreguj słowa. >> rzeczownik = żyrafa, kredka, chmura ; czasownik = rysuje, śpi, gotuje ; przymiotnik = wysoka, szary, słodki !! Kto? co? — rzeczownik. Co robi? — czasownik. Jaki? — przymiotnik.
sortuj: Posegreguj słowa. >> rzeczownik = morze, piłka, brat ; czasownik = skacze, płacze, jedzie ; przymiotnik = głośny, mokra, wesoły !! Kto? co? — rzeczownik. Co robi? — czasownik. Jaki? — przymiotnik.
wybierz: Jaką częścią mowy jest wyróżnione słowo? >> Babcia {robi} szalik na drutach. | *czasownik | rzeczownik | przymiotnik !! Co robi babcia? Robi — to czasownik.
wybierz: Jaką częścią mowy jest wyróżnione słowo? >> Babcia robi {ciepły} szalik. | *przymiotnik | rzeczownik | czasownik !! Jaki szalik? Ciepły — to przymiotnik.
wybierz: Jaką częścią mowy jest wyróżnione słowo? >> Babcia robi ciepły {szalik}. | *rzeczownik | czasownik | przymiotnik !! Co? Szalik — to nazwa rzeczy, czyli rzeczownik.
wybierz: Jaką częścią mowy jest wyróżnione słowo? >> {Wiewiórka} zbiera orzechy. | *rzeczownik | czasownik | przymiotnik !! Kto zbiera? Wiewiórka — rzeczownik.
wybierz: Jaką częścią mowy jest wyróżnione słowo? >> Wiewiórka {zbiera} orzechy. | *czasownik | rzeczownik | przymiotnik !! Co robi wiewiórka? Zbiera — czasownik.
wybierz: Jaką częścią mowy jest wyróżnione słowo? >> Dziś jest {słoneczny} dzień. | *przymiotnik | rzeczownik | czasownik !! Jaki dzień? Słoneczny — przymiotnik.
kliknij: Kliknij wszystkie czasowniki. >> Chłopiec *biegnie* do szkoły i *macha* do kolegi. !! Co robi chłopiec? Biegnie i macha.
kliknij: Kliknij wszystkie rzeczowniki. >> Mała *dziewczynka* karmi *kaczki* *chlebem*. !! Kto? Dziewczynka. Kogo karmi? Kaczki. Czym? Chlebem.
kliknij: Kliknij wszystkie przymiotniki. >> *Duży* pies ma *długi* ogon i *czarne* uszy. !! Jaki pies? Duży. Jaki ogon? Długi. Jakie uszy? Czarne.
pary: Połącz część mowy z pytaniem. >> rzeczownik = kto? co? ; czasownik = co robi? ; przymiotnik = jaki? jaka? jakie? !! Te pytania pomagają rozpoznać część mowy.
wybierz: W którym zestawie są same czasowniki? | *śpi, je, pije | kot, pies, mysz | duży, mały, gruby | stół, je, zielony !! Śpi, je, pije — każde mówi, co ktoś robi.
wybierz: W którym zestawie są same przymiotniki? | *żółty, kwaśny, okrągły | cytryna, banan, śliwka | rośnie, dojrzewa, spada | słońce, świeci, jasne !! Żółty, kwaśny, okrągły — każde odpowiada na pytanie „jaki?”.
wybierz: W którym zestawie są same rzeczowniki? | *mama, tata, siostra | idzie, stoi, siedzi | ładna, miła, mądra | brat, biega, szybki !! Mama, tata, siostra — kto? To rzeczowniki.
`,
  ),
  builtin(
    'b-czasy',
    'pl',
    50,
    'Czasownik: przeszły, teraźniejszy, przyszły',
    'Czas przeszły — to już było (wczoraj). Czas teraźniejszy — dzieje się teraz (dziś, teraz). Czas przyszły — dopiero będzie (jutro).',
    `
wybierz: W jakim czasie jest czasownik? >> Wczoraj {pojechałem} rowerem nad Wisłę. | *przeszłym | teraźniejszym | przyszłym !! Słowo „wczoraj” podpowiada, że to już się wydarzyło.
wybierz: W jakim czasie jest czasownik? >> Teraz {czytam} książkę o dinozaurach. | *teraźniejszym | przeszłym | przyszłym !! „Teraz” — to dzieje się w tej chwili.
wybierz: W jakim czasie jest czasownik? >> Jutro {będziemy grać} w piłkę. | *przyszłym | teraźniejszym | przeszłym !! „Jutro” i „będziemy” — to dopiero się wydarzy.
wybierz: W jakim czasie jest czasownik? >> Latem {pojedziemy} nad morze. | *przyszłym | przeszłym | teraźniejszym !! Pojedziemy — to dopiero będzie, więc czas przyszły.
wybierz: W jakim czasie jest czasownik? >> Kot {spał} cały dzień. | *przeszłym | teraźniejszym | przyszłym !! Spał — to już było, czas przeszły.
wybierz: W jakim czasie jest czasownik? >> Mama {gotuje} obiad. | *teraźniejszym | przeszłym | przyszłym !! Gotuje — dzieje się teraz.
wybierz: W jakim czasie jest czasownik? >> {Narysuję} ci smoka. | *przyszłym | teraźniejszym | przeszłym !! Narysuję — dopiero to zrobię, więc czas przyszły.
wybierz: Które słowo podpowiada czas przeszły? | *wczoraj | jutro | teraz | za tydzień !! Wczoraj — to, co już minęło.
sortuj: Kiedy to się dzieje? >> przeszły = biegałem, zjadła, padał ; teraźniejszy = biegam, je, pada ; przyszły = pobiegnę, zje, będzie padać !! Przeszły — już było. Teraźniejszy — dzieje się teraz. Przyszły — dopiero będzie.
kliknij: Kliknij czasownik w czasie przeszłym. >> Wczoraj *padał* deszcz, a dziś świeci słońce. !! Padał — to było wczoraj. „Świeci” dzieje się dziś.
kliknij: Kliknij czasownik w czasie przyszłym. >> Dziś jest zimno, ale jutro *będzie* ciepło. !! Będzie — to dopiero jutro.
wpisz: Zamień na czas przeszły. >> Teraz rysuję. Wczoraj też [rysowałem|rysowałam]. !! Chłopiec: rysowałem. Dziewczynka: rysowałam.
wpisz: Zamień na czas przeszły. >> Dziś idę do kina. Wczoraj też [szedłem|szłam|poszedłem|poszłam] do kina. !! Na przykład: wczoraj poszedłem (chłopiec) albo poszłam (dziewczynka).
wpisz: Napisz czasownik w czasie przyszłym. >> Jutro [napiszę|będę pisać|będę pisał|będę pisała] list do babci. !! Jutro → czas przyszły: napiszę albo będę pisać.
`,
  ),
  builtin(
    'b-osoby',
    'pl',
    60,
    'Czasownik: osoba i liczba',
    'Czasownik zmienia końcówkę zależnie od tego, kto wykonuje czynność: ja, ty, on/ona/ono (liczba pojedyncza) oraz my, wy, oni/one (liczba mnoga).',
    `
wpisz: Odmień czasownik „pisać”. >> ja piszę, ty [piszesz], on [pisze], my [piszemy], wy [piszecie], oni [piszą] !! Uwaga na końcówkę: oni piszą (z „ą”).
wpisz: Odmień czasownik „czytać”. >> ja [czytam], ty [czytasz], ona [czyta], my [czytamy], wy [czytacie], one [czytają] !! One czytają — na końcu „ą”.
wpisz: Odmień czasownik „robić”. >> ja [robię], ty [robisz], on [robi], my [robimy], wy [robicie], oni [robią] !! Ja robię — na końcu „ę”. Oni robią — na końcu „ą”.
wybierz: Dokończ zdanie. >> My ___ w piłkę. | *gramy | gram | grają | grasz !! My → gramy.
wybierz: Dokończ zdanie. >> Oni ___ do szkoły. | *idą | idę | idziesz | idziemy !! Oni → idą.
wybierz: Dokończ zdanie. >> Ty ___ bardzo ładnie. | *śpiewasz | śpiewam | śpiewają | śpiewa !! Ty → śpiewasz.
wybierz: Kto to robi? >> ___ czytamy komiks. | *My | Ja | Ty | Oni !! Czytamy — to my.
wybierz: Kto to robi? >> ___ jecie lody. | *Wy | My | Ja | Ona !! Jecie — to wy.
pary: Połącz osobę z czasownikiem. >> ja = skaczę ; ty = skaczesz ; my = skaczemy ; oni = skaczą !! Końcówka czasownika pokazuje, kto skacze.
wybierz: W jakiej liczbie jest czasownik? >> Dzieci {bawią się} na podwórku. | *mnogiej | pojedynczej !! Dzieci to wiele osób, więc liczba mnoga.
wybierz: W jakiej liczbie jest czasownik? >> Pies {szczeka}. | *pojedynczej | mnogiej !! Jeden pies — liczba pojedyncza.
wpisz: Dopisz brakujący czasownik. >> Ja jem zupę, a oni [jedzą] pierogi. !! Ja jem, oni jedzą.
`,
  ),
  builtin(
    'b-mnozenie-6-7',
    'mat',
    10,
    'Mnożenie przez 6 i 7',
    'Mnożenie to szybkie dodawanie: 6 · 3 = 6 + 6 + 6 = 18.',
    `
wpisz: Oblicz. >> 6 · 3 = [18] !! 6 + 6 + 6 = 18
wpisz: Oblicz. >> 6 · 7 = [42] !! 6 · 7 = 42
wpisz: Oblicz. >> 7 · 8 = [56] !! 7 · 8 = 56
wpisz: Oblicz. >> 7 · 6 = [42] !! Kolejność nie zmienia wyniku: 7 · 6 = 6 · 7 = 42
wpisz: Oblicz. >> 6 · 9 = [54] !! 6 · 9 = 54
wpisz: Oblicz. >> 7 · 7 = [49] !! 7 · 7 = 49
wpisz: Oblicz. >> 7 · 4 = [28] !! 7 · 4 = 28
wybierz: Ile to jest 6 · 8? | *48 | 42 | 54 | 46 !! 6 · 8 = 48
wybierz: Ile to jest 7 · 9? | *63 | 56 | 72 | 64 !! 7 · 9 = 63
wybierz: Który wynik jest większy? | *7 · 8 | 6 · 9 !! 7 · 8 = 56, a 6 · 9 = 54.
pary: Połącz działanie z wynikiem. >> 6 · 4 = 24 ; 7 · 5 = 35 ; 6 · 6 = 36 ; 7 · 3 = 21 !! Sprawdź: 6 · 4 = 24, 7 · 5 = 35, 6 · 6 = 36, 7 · 3 = 21.
wpisz: W pudełku jest 6 rzędów po 7 cukierków. Ile cukierków jest w pudełku? >> W pudełku są [42] cukierki. !! 6 · 7 = 42
`,
  ),
];

export const BUILTIN_TOPICS: Topic[] = [...GRADE3_BASE, DICTATION_GRADE3, ...MATH_GRADE3, ...POLISH_GRADE5, DICTATION_GRADE5, ...MATH_GRADE5].map((t) => ({
  ...t,
  guide: GUIDES[t.id],
}));
