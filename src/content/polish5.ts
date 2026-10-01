import type { Topic } from '../types';
import { builtin } from './util';

/*
 * Język polski — klasa 5. Każde zdanie sprawdzone pod kątem jednoznaczności.
 * Celowo pomijamy pisownię „nie” ze stopniem wyższym/najwyższym przymiotników i z imiesłowami —
 * te zasady zmieniła reforma pisowni obowiązująca od 2026 r.
 */

export const POLISH_GRADE5: Topic[] = [
  builtin(
    'b-p5-przypadki',
    'pl',
    10,
    'Przypadki rzeczownika',
    'Mianownik: kto? co? · Dopełniacz: kogo? czego? · Celownik: komu? czemu? · Biernik: kogo? co? · Narzędnik: z kim? z czym? · Miejscownik: o kim? o czym? · Wołacz: o!',
    `
pary: Połącz przypadek z pytaniami. >> mianownik = kto? co? ; dopełniacz = kogo? czego? ; celownik = komu? czemu? ; narzędnik = z kim? z czym? ; miejscownik = o kim? o czym? !! Biernik ma pytania kogo? co? — podobne do dopełniacza i mianownika.
wybierz: W jakim przypadku jest wyróżniony rzeczownik? >> Nie mam {czasu}. | *dopełniacz | mianownik | biernik | narzędnik !! Nie mam czego? Czasu — dopełniacz.
wybierz: W jakim przypadku jest wyróżniony rzeczownik? >> Daję prezent {siostrze}. | *celownik | dopełniacz | miejscownik | biernik !! Daję komu? Siostrze — celownik.
wybierz: W jakim przypadku jest wyróżniony rzeczownik? >> Jadę na wycieczkę z {tatą}. | *narzędnik | celownik | miejscownik | mianownik !! Z kim? Z tatą — narzędnik.
wybierz: W jakim przypadku jest wyróżniony rzeczownik? >> Myślę o {wakacjach}. | *miejscownik | dopełniacz | narzędnik | celownik !! O czym? O wakacjach — miejscownik.
wybierz: W jakim przypadku jest wyróżniony rzeczownik? >> {Pies} szczeka na kota. | *mianownik | biernik | dopełniacz | wołacz !! Kto szczeka? Pies — mianownik.
wybierz: W jakim przypadku jest wyróżniony rzeczownik? >> Widzę piękny {zamek}. | *biernik | mianownik | dopełniacz | miejscownik !! Widzę kogo? co? Zamek — biernik.
wybierz: W jakim przypadku jest wyróżniony rzeczownik? >> {Mamo}, pomóż mi! | *wołacz | mianownik | celownik | biernik !! Zwracamy się do kogoś — wołacz.
wpisz: Odmień rzeczownik „kot” przez przypadki. >> M. kot, D. [kota], C. [kotu], B. [kota], N. [kotem], Ms. [kocie], W. [kocie] !! Nie ma kogo? kota. Przyglądam się komu? kotu. Widzę kogo? kota. Z kim? z kotem. O kim? o kocie. O! kocie!
wpisz: Uzupełnij formami rzeczownika „szkoła”. >> Idę do [szkoły]. Jestem w [szkole]. Lubię swoją [szkołę]. !! Do czego? szkoły. W czym? w szkole. Kogo? co? szkołę.
wybierz: Która forma to dopełniacz rzeczownika „książka”? | *książki | książce | książkę | książką !! Nie ma czego? Książki.
wybierz: Która forma to narzędnik rzeczownika „kolega”? | *kolegą | koledze | kolegę | kolegi !! Z kim? Z kolegą.
`,
    [5],
  ),
  builtin(
    'b-p5-stopniowanie',
    'pl',
    20,
    'Stopniowanie przymiotnika',
    'Stopień równy: miły. Wyższy: milszy. Najwyższy: najmilszy. Niektóre przymiotniki stopniujemy nieregularnie (dobry – lepszy – najlepszy) albo opisowo (bardziej, najbardziej).',
    `
wpisz: Stopniuj przymiotnik. >> szybki – [szybszy] – [najszybszy] !! Szybki, szybszy, najszybszy.
wpisz: Stopniuj przymiotnik. >> wysoki – [wyższy] – [najwyższy] !! Wysoki, wyższy, najwyższy.
wpisz: Stopniuj przymiotnik. >> ładny – [ładniejszy] – [najładniejszy] !! Ładny, ładniejszy, najładniejszy.
wpisz: Stopniuj przymiotnik. >> dobry – [lepszy] – [najlepszy] !! To stopniowanie nieregularne — trzeba je zapamiętać.
wpisz: Stopniuj przymiotnik. >> zły – [gorszy] – [najgorszy] !! To stopniowanie nieregularne.
wpisz: Stopniuj przymiotnik. >> mały – [mniejszy] – [najmniejszy] !! To stopniowanie nieregularne.
wpisz: Stopniuj przymiotnik. >> duży – [większy] – [największy] !! To stopniowanie nieregularne.
wybierz: W jakim stopniu jest przymiotnik? >> To {najciekawsza} książka w bibliotece. | *najwyższym | wyższym | równym !! Naj- na początku — stopień najwyższy.
wybierz: W jakim stopniu jest przymiotnik? >> Mój brat jest {starszy} ode mnie. | *wyższym | najwyższym | równym !! Starszy (od kogoś) — stopień wyższy.
wybierz: W jakim stopniu jest przymiotnik? >> Mamy {zielony} płot. | *równym | wyższym | najwyższym !! Zielony — podstawowa forma, stopień równy.
wybierz: Który przymiotnik stopniujemy opisowo (bardziej, najbardziej)? | *zmęczony | miły | tani | długi !! Mówimy: bardziej zmęczony, najbardziej zmęczony.
pary: Połącz stopień równy z najwyższym. >> dobry = najlepszy ; zły = najgorszy ; mały = najmniejszy ; duży = największy !! To przymiotniki stopniowane nieregularnie.
`,
    [5],
  ),
  builtin(
    'b-p5-o-u',
    'pl',
    30,
    'Ó czy u?',
    'Piszemy ó, gdy wymienia się na o, e lub a (wóz – wozy, mówić – mowa). Piszemy u w końcówkach -uje, -unek, -uszek, -utki (kupuje, rysunek).',
    `
wybierz: Wybierz poprawny zapis. | *wóz | wuz !! Wóz – wozy: ó wymienia się na o.
wybierz: Wybierz poprawny zapis. | *stół | stuł !! Stół – stoły: ó wymienia się na o.
wybierz: Wybierz poprawny zapis. | *mówić | muwić !! Mówić – mowa: ó wymienia się na o.
wybierz: Wybierz poprawny zapis. | *róg | rug !! Róg – rogi: ó wymienia się na o.
wybierz: Wybierz poprawny zapis. | *kupuje | kupóje !! Końcówkę -uje piszemy przez u.
wybierz: Wybierz poprawny zapis. | *rysunek | rysónek !! Końcówkę -unek piszemy przez u.
wybierz: Wybierz poprawny zapis. | *kwiatuszek | kwiatószek !! Końcówkę -uszek piszemy przez u.
wybierz: Wybierz poprawny zapis. | *malutki | malótki !! Końcówkę -utki piszemy przez u.
wpisz: Uzupełnij ó albo u. >> n[ó]żka (noga), dr[ó]żka (droga), kup[u]je, rys[u]nek !! Nóżka – noga, dróżka – droga: ó wymienia się na o. Kupuje, rysunek: końcówki -uje, -unek.
sortuj: Posegreguj wyrazy. >> piszemy ó = wóz, stół, mówić, sól ; piszemy u = kupuje, rysunek, malutki, kwiatuszek !! Ó wymienne (wozy, stoły, mowa, solić) i u w końcówkach -uje, -unek, -utki, -uszek.
wybierz: Dlaczego w wyrazie „lód” piszemy ó? | *bo lody | bo to wyjątek | bo końcówka -ód !! Lód – lody: ó wymienia się na o.
wybierz: Dlaczego w wyrazie „gotuje” piszemy u? | *bo końcówka -uje | bo gotować | bo to wyjątek !! Czasowniki z końcówką -uje piszemy przez u.
`,
    [5],
  ),
  builtin(
    'b-p5-nie',
    'pl',
    40,
    '„Nie” z czasownikami, rzeczownikami i przymiotnikami',
    'Nie z czasownikami piszemy osobno (nie wiem). Wyjątki: nienawidzić, niepokoić. Nie z rzeczownikami i przymiotnikami piszemy razem (nieprawda, niemiły).',
    `
wybierz: Uzupełnij zdanie. >> Ja ___ tego zadania. | *nie rozumiem | nierozumiem !! Nie z czasownikami piszemy osobno.
wybierz: Uzupełnij zdanie. >> Ola ___ dziś do szkoły. | *nie poszła | nieposzła !! Nie z czasownikami piszemy osobno.
wybierz: Uzupełnij zdanie. >> Mój brat ___ szpinaku. | *nienawidzi | nie nawidzi !! To wyjątek: nienawidzić piszemy razem.
wybierz: Uzupełnij zdanie. >> Tata się ___, gdy późno wracam. | *niepokoi | nie pokoi !! To wyjątek: niepokoić piszemy razem.
wybierz: Uzupełnij zdanie. >> To jest ___ pies. | *niegroźny | nie groźny !! Nie z przymiotnikami piszemy razem.
wybierz: Uzupełnij zdanie. >> To był bardzo ___ dzień. | *nieudany | nie udany !! Nie z przymiotnikami piszemy razem.
wybierz: Uzupełnij zdanie. >> W pokoju panował ___. | *nieporządek | nie porządek !! Nie z rzeczownikami piszemy razem.
wybierz: Uzupełnij zdanie. >> Kasia powiedziała ___. | *nieprawdę | nie prawdę !! Nie z rzeczownikami piszemy razem.
wybierz: Uzupełnij zdanie. >> Ten film był ___. | *nieciekawy | nie ciekawy !! Nie z przymiotnikami piszemy razem.
sortuj: Razem czy osobno? >> razem = nieprawda, niemiły, nienawidzić, niepokój ; osobno = nie wiem, nie lubię, nie chcę, nie pływa !! Czasowniki osobno (z wyjątkami), rzeczowniki i przymiotniki razem.
wybierz: Jak piszemy „nie” z czasownikami? | *osobno | razem !! Nie wiem, nie lubię, nie chcę — osobno.
wybierz: Jak piszemy „nie” z rzeczownikami? | *razem | osobno !! Nieprawda, niepokój, nieporządek — razem.
`,
    [5],
  ),
  builtin(
    'b-p5-odmienne',
    'pl',
    50,
    'Części mowy odmienne i nieodmienne',
    'Odmienne: rzeczownik, czasownik, przymiotnik, liczebnik, zaimek. Nieodmienne: przysłówek, przyimek, spójnik, wykrzyknik, partykuła.',
    `
sortuj: Posegreguj części mowy. >> odmienne = rzeczownik, czasownik, przymiotnik, liczebnik, zaimek ; nieodmienne = przysłówek, przyimek, spójnik, wykrzyknik, partykuła !! Części mowy odmienne zmieniają swoją formę (kot – kota – kotem).
wybierz: Jaką częścią mowy jest wyróżnione słowo? >> Ola {szybko} biegnie. | *przysłówek | przymiotnik | czasownik | rzeczownik !! Jak biegnie? Szybko — przysłówek.
wybierz: Jaką częścią mowy jest wyróżnione słowo? >> Mam {pięć} kredek. | *liczebnik | przymiotnik | rzeczownik | przysłówek !! Ile? Pięć — liczebnik.
wybierz: Jaką częścią mowy jest wyróżnione słowo? >> {On} lubi czytać. | *zaimek | rzeczownik | spójnik | przyimek !! On zastępuje rzeczownik — zaimek.
wybierz: Jaką częścią mowy jest wyróżnione słowo? >> Kot leży {na} kanapie. | *przyimek | spójnik | przysłówek | partykuła !! Na (kanapie) — przyimek łączy się z rzeczownikiem.
wybierz: Jaką częścią mowy jest wyróżnione słowo? >> Mama {i} tata idą do kina. | *spójnik | przyimek | partykuła | zaimek !! I łączy dwa wyrazy — spójnik.
wybierz: Jaką częścią mowy jest wyróżnione słowo? >> {Ach}, jak tu pięknie! | *wykrzyknik | partykuła | spójnik | przysłówek !! Ach wyraża uczucie — wykrzyknik.
wybierz: Jaką częścią mowy jest wyróżnione słowo? >> Ola {nie} lubi szpinaku. | *partykuła | przysłówek | spójnik | przyimek !! Nie — partykuła.
wybierz: Jaką częścią mowy jest wyróżnione słowo? >> To był {trzeci} dzień ferii. | *liczebnik | przymiotnik | rzeczownik !! Który z kolei? Trzeci — liczebnik porządkowy.
kliknij: Kliknij wszystkie przysłówki. >> Pies *szybko* biegł, a kot *spokojnie* spał. !! Jak biegł? Szybko. Jak spał? Spokojnie.
kliknij: Kliknij wszystkie przyimki. >> Książka leży *na* stole, a zeszyt *pod* krzesłem. !! Na, pod — przyimki.
pary: Połącz słowo z częścią mowy. >> siedem = liczebnik ; my = zaimek ; lecz = spójnik ; przed = przyimek ; hej = wykrzyknik !! Siedem (ile?), my (zamiast rzeczownika), lecz (łączy zdania), przed (z rzeczownikiem), hej (woła).
`,
    [5],
  ),
  builtin(
    'b-p5-podmiot',
    'pl',
    60,
    'Podmiot i orzeczenie',
    'Podmiot to wykonawca czynności — pytamy: kto? co? Orzeczenie mówi, co robi podmiot — najczęściej to czasownik.',
    `
kliknij: Kliknij orzeczenie. >> Kot *śpi* na kanapie. !! Co robi kot? Śpi.
kliknij: Kliknij podmiot. >> *Mama* czyta gazetę. !! Kto czyta? Mama.
kliknij: Kliknij podmiot. >> Na drzewie siedzi *wiewiórka*. !! Kto siedzi? Wiewiórka.
kliknij: Kliknij orzeczenie. >> W nocy *padał* deszcz. !! Co robił deszcz? Padał.
kliknij: Kliknij podmiot i orzeczenie. >> *Tomek* *gra* w piłkę. !! Kto? Tomek. Co robi? Gra.
kliknij: Kliknij podmiot i orzeczenie. >> Wczoraj *babcia* *upiekła* ciasto. !! Kto? Babcia. Co zrobiła? Upiekła.
kliknij: Kliknij podmiot. >> Po niebie płyną białe *chmury*. !! Co płynie? Chmury.
wybierz: Co jest podmiotem? >> Nad łąką latają motyle. | *motyle | latają | łąką | nad !! Kto lata? Motyle.
wybierz: Co jest orzeczeniem? >> Moja siostra pięknie rysuje. | *rysuje | siostra | pięknie | moja !! Co robi siostra? Rysuje.
wybierz: Co jest orzeczeniem? >> Uczniowie piszą sprawdzian. | *piszą | uczniowie | sprawdzian !! Co robią uczniowie? Piszą.
wybierz: Na jakie pytanie odpowiada podmiot? | *kto? co? | co robi? | gdzie? | jaki? !! Podmiot to wykonawca czynności: kto? co?
wybierz: W którym zdaniu podmiotem jest pies? | *Pies goni kota. | Kot goni psa. | Dziecko głaszcze psa. !! Kto goni? Pies — to on wykonuje czynność.
`,
    [5],
  ),
];
