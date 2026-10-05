import { BOOKS_UNIT } from '../engine';
import type { Topic } from '../types';
import { builtin } from './util';

/*
 * Lektury (dział „Lektury” w języku polskim). Każda książka to trzy tematy z kolejnymi numerami `order`:
 * bohaterowie, wydarzenia, omówienie. Ściąga i lekcja stoją tutaj, przy temacie — całą książkę widać w jednym miejscu.
 *
 * Zasady pisania:
 * - Fakty sprawdzamy w co najmniej dwóch opracowaniach; pytamy tylko o to, co jest w nich zgodne. Nie cytujemy książki.
 * - Polskie przekłady różnią się imionami (Ernest / Erno Nemeczek, Deżo / Deży Gereb) — w pytaniach używamy nazwisk,
 *   a w lukach przyjmujemy oba warianty.
 * - Pytania są takie jak na kartkówce ze znajomości lektury: kto, gdzie, kiedy, co zrobił, co było wcześniej.
 *   Kolejność wydarzeń ćwiczymy zadaniem „pary” z numerami 1–4 po lewej stronie.
 * - `description` to także podpowiedź w trakcie ćwiczenia, więc nie może zdradzać odpowiedzi z tego tematu.
 * - Lekcja: „## Bohaterowie”, „## Streszczenie” itp. to karty-listy (linie „Hasło: opis”); streszczenie jest numerowane,
 *   a jego hasła tworzą plan wydarzeń na stronie powtórki — hasło ma więc być krótkim tytułem punktu.
 * - Pytania kontrolne lekcji nie mogą powtarzać zadań tematu (test to sprawdza).
 */

/** Nazwa działu — ta sama, po której silnik rozpoznaje lektury (nie trafiają do testu na start). */
export const LEKTURY = BOOKS_UNIT;

function lektura(id: string, order: number, title: string, description: string, grades: number[], dsl: string, guide: string, lesson: string): Topic {
  return { ...builtin(id, 'pl', order, title, description, dsl, grades), unit: LEKTURY, guide: guide.trim(), lesson: lesson.trim() };
}

// ─── Ferenc Molnár, „Chłopcy z Placu Broni” (klasa 5) ─────────────────────────

const CHLOPCY = 'Chłopcy z Placu Broni';

const CHLOPCY_BOHATEROWIE = lektura(
  'b-p5-lek-chlopcy-bohaterowie',
  110,
  `${CHLOPCY}: bohaterowie`,
  'Kto jest kim w powieści Ferenca Molnára. Najpierw ustal, do której grupy należy bohater — do chłopców z Placu Broni czy do Czerwonych Koszul — a potem przypomnij sobie, co zrobił.',
  [5],
  `
wybierz: Kto był przywódcą chłopców z Placu Broni? | *Boka | Gereb | Feri Acz | Czonakosz !! Koledzy wybrali Bokę w głosowaniu, bo był rozważny i sprawiedliwy.
wybierz: Kto był wodzem Czerwonych Koszul podczas walki o Plac Broni? | *Feri Acz | starszy Pastor | Boka | Sebenicz !! Czerwonymi Koszulami dowodził Feri Acz — silny, odważny i honorowy.
wybierz: Kto był jedynym szeregowcem wśród chłopców z Placu Broni? | *Nemeczek | Czele | Kolnay | Barabasz !! Wszyscy pozostali chłopcy byli oficerami, więc Nemeczek musiał słuchać każdego z nich.
wybierz: Który z chłopców zdradził kolegów z Placu Broni? | *Gereb | Nemeczek | Czonakosz | Weiss !! Zdradził Gereb. Nemeczka koledzy tylko niesłusznie posądzili o zdradę.
wybierz: Dlaczego Gereb zdradził kolegów? | *bo zazdrościł Boce i sam chciał dowodzić | bo Czerwone Koszule mu groziły | bo pokłócił się z Nemeczkiem | bo ojciec zabronił mu chodzić na plac !! W wyborach przywódcy Gereb przegrał z Boką. Urażony, przeszedł na stronę Czerwonych Koszul.
wybierz: Kim z zawodu był ojciec Nemeczka? | *krawcem | stolarzem | nauczycielem | lekarzem !! Ojciec Nemeczka był ubogim krawcem.
wybierz: Kim był Jano? | *stróżem, który pilnował składu drewna przy placu | nauczycielem chłopców | wodzem Czerwonych Koszul | sprzedawcą słodyczy !! Jano pilnował składu drewna przy Placu Broni. Mieszkał w budce z psem.
wybierz: Jak wabił się pies stróża? | *Hektor | Reks | Burek | Azor !! Pies stróża wabił się Hektor.
wybierz: Kto był nauczycielem chłopców? | *profesor Rac | Jano | pan Gereb | Feri Acz !! Profesor Rac był surowym nauczycielem. To on rozwiązał Związek Kitowców.
wybierz: Którzy bohaterowie zabrali młodszym chłopcom kulki? | *bracia Pastorowie | Kolnay i Barabasz | Boka i Czonakosz | Weiss i Rychter !! Kulki zabrali bracia Pastorowie z Czerwonych Koszul. Powiedzieli przy tym „einstand”.
sortuj: Do której grupy należeli ci bohaterowie? >> chłopcy z Placu Broni = Boka, Nemeczek, Czonakosz, Czele ; Czerwone Koszule = Feri Acz, Pastorowie, Sebenicz !! Boka, Nemeczek, Czonakosz i Czele bronili placu. Feri Acz, bracia Pastorowie i Sebenicz należeli do Czerwonych Koszul.
pary: Połącz bohatera z tym, kim był. >> Boka = przywódca ; Nemeczek = szeregowiec ; Gereb = zdrajca ; Czonakosz = mistrz gwizdania ; Czele = elegant !! Boka dowodził, Nemeczek był jedynym szeregowcem, Gereb zdradził, Czonakosz najlepiej gwizdał, a Czele lubił się stroić.
wybierz: Jak wyglądał Nemeczek? | *był drobnym, wątłym blondynkiem | był wysoki i barczysty | był najsilniejszy w klasie | był gruby i rumiany !! Nemeczek był najmniejszy i najsłabszy z chłopców — drobny, jasnowłosy.
wybierz: Która cecha najlepiej opisuje Bokę? | *rozwaga | porywczość | zazdrość | lenistwo !! Boka był spokojny i rozważny — najpierw myślał, potem działał.
wybierz: Jaki był Feri Acz? | *silny, odważny i honorowy | słaby i tchórzliwy | chytry i przekupny | leniwy i obojętny !! Feri Acz był groźnym, ale honorowym przeciwnikiem: chciał wygrać tylko w uczciwej walce.
wybierz: Którzy dwaj chłopcy bez przerwy się ze sobą kłócili? | *Kolnay i Barabasz | Boka i Nemeczek | Czele i Weiss | Czonakosz i Rychter !! Kolnay i Barabasz sprzeczali się niemal o wszystko.
wpisz: Wpisz nazwiska przywódców. >> Chłopcami z Placu Broni dowodził [Boka|Janosz Boka], a Czerwonymi Koszulami — Feri [Acz]. !! Boka dowodził chłopcami z Placu Broni, a Feri Acz — Czerwonymi Koszulami.
wybierz: Kogo Feri Acz ukarał kąpielą w stawie za zabranie kulek młodszym? | *braci Pastorów | Gereba | Sebenicza | Nemeczka !! Feri Acz uznał, że okradanie słabszych to wstyd, i kazał braciom Pastorom wejść do stawu.
wybierz: W jaki sposób Boka został przywódcą? | *koledzy wybrali go w głosowaniu | sam ogłosił się wodzem | wyznaczył go profesor Rac | wygrał pojedynek z Gerebem !! Chłopcy głosowali na kartkach. Boka dostał o wiele więcej głosów niż Gereb.
wybierz: Kto był prezesem Związku Kitowców, gdy rozwiązał go profesor Rac? | *Weiss | Boka | Gereb | Czonakosz !! Prezesem był Weiss — dlatego dostał najsurowszą karę.
kliknij: Kliknij nazwiska chłopców z Placu Broni. >> *Boka* Acz *Nemeczek* Pastor *Czonakosz* Sebenicz *Czele* !! Acz, Pastor i Sebenicz to Czerwone Koszule.
wybierz: Co zrobił Nemeczek, gdy ojciec Gereba zapytał, czy jego syn jest zdrajcą? | *zaprzeczył, żeby oszczędzić ojcu zmartwienia | opowiedział o wszystkim | uciekł bez słowa | odesłał go do profesora Raca !! Nemeczek wiedział o zdradzie, ale nie chciał zasmucić ojca Gereba. To pokazuje, jak dobre miał serce.
`,
  `
Dwie grupy: chłopcy z Placu Broni (przywódca: Boka) i Czerwone Koszule z Ogrodu Botanicznego (wódz: Feri Acz).
Nemeczek — najmniejszy z chłopców, jedyny szeregowiec, syn ubogiego krawca. Odważny i wierny.
Gereb — zazdrościł Boce, zdradził kolegów, potem żałował i wrócił.
Czonakosz — siłacz, świetnie gwiżdże. Czele — elegant. Kolnay i Barabasz — ciągle się kłócą. Weiss — prezes Związku Kitowców.
Czerwone Koszule: Feri Acz — honorowy wódz. Bracia Pastorowie — zabrali młodszym kulki. Sebenicz.
Dorośli: stróż Jano z psem Hektorem, profesor Rac (nauczyciel), ojciec Nemeczka (krawiec).
Sposób: najpierw ustal, do której grupy należy bohater, a potem przypomnij sobie, co zrobił.
`,
  `
# Najważniejsze
W powieści walczą ze sobą dwie grupy: chłopcy z Placu Broni i Czerwone Koszule z Ogrodu Botanicznego.
Chłopcami z Placu Broni dowodzi Boka, a Czerwonymi Koszulami — Feri Acz.
Najważniejszym bohaterem jest Nemeczek: najmniejszy z chłopców i jedyny szeregowiec.
## Chłopcy z Placu Broni
Boka: Przywódca. Rozważny, spokojny i sprawiedliwy — dlatego koledzy go wybrali.
Nemeczek: Drobny blondynek, syn ubogiego krawca. Jedyny szeregowiec, a przy tym najodważniejszy i najwierniejszy.
Gereb: Zazdrościł Boce dowództwa i zdradził kolegów. Potem szczerze żałował i wrócił.
Czonakosz: Silny i wesoły, gwiżdże najlepiej ze wszystkich.
Czele: Elegant, zawsze starannie ubrany.
Kolnay i Barabasz: Bez przerwy się ze sobą kłócą.
## Czerwone Koszule i dorośli
Feri Acz: Wódz Czerwonych Koszul. Silny, odważny i honorowy — chce wygrać tylko w uczciwej walce.
Bracia Pastorowie: Silni chłopcy z Czerwonych Koszul. To oni zabrali młodszym kulki.
Jano: Stróż, który pilnuje składu drewna przy placu. Ma psa Hektora.
Profesor Rac: Surowy nauczyciel chłopców.
# Tak / nie tak
tak: Zdrajcą był Gereb. | nie: Zdrajcą był Nemeczek. | bo: Nemeczka koledzy ze Związku Kitowców tylko niesłusznie posądzili o zdradę. Naprawdę zdradził Gereb.
tak: Boka dowodził chłopcami z Placu Broni. | nie: Boka dowodził Czerwonymi Koszulami. | bo: wodzem Czerwonych Koszul był Feri Acz.
tak: Feri Acz był honorowym przeciwnikiem. | nie: Feri Acz był złym charakterem. | bo: nie chciał zdobyć placu przekupstwem, a za odwagę kazał oddać Nemeczkowi honory.
tak: Kulki zabrali bracia Pastorowie. | nie: Kulki zabrał Feri Acz. | bo: Feri Acz zabrał chorągiew. Braci Pastorów za zabranie kulek sam ukarał.
# Zapamiętaj
B jak Boka i B jak Broni — Boka dowodzi chłopcami z Placu Broni.
Nemeczek: najmniejszy wzrostem, największy odwagą.
W różnych wydaniach imiona zapisano trochę inaczej, na przykład Ernest albo Erno Nemeczek. Nazwiska są zawsze te same — na kartkówce pisz nazwiska.
# Sprawdź się
wybierz: Który bohater był przeciwnikiem chłopców z Placu Broni, a mimo to zachowywał się honorowo? | *Feri Acz | Gereb | Czele !! Feri Acz dowodził Czerwonymi Koszulami, ale walczył uczciwie i szanował odwagę przeciwnika.
wybierz: Kto był synem krawca? | *Nemeczek | Boka | Czonakosz !! Ojciec Nemeczka był ubogim krawcem.
wybierz: Do której grupy należeli bracia Pastorowie? | *do Czerwonych Koszul | do chłopców z Placu Broni | do Związku Kitowców !! Bracia Pastorowie byli Czerwonymi Koszulami — to oni zabrali młodszym kulki.
`,
);

const CHLOPCY_WYDARZENIA = lektura(
  'b-p5-lek-chlopcy-wydarzenia',
  111,
  `${CHLOPCY}: wydarzenia`,
  'Co po kolei wydarzyło się w powieści. Przy każdym pytaniu przypomnij sobie, co było wcześniej, a co później, i kto brał w tym udział.',
  [5],
  `
wybierz: Co Feri Acz zabrał chłopcom z Placu Broni? | *chorągiew | kulki | trąbkę | pieczątkę !! Feri Acz zakradł się na plac i zabrał chorągiew. Kulki zabrali wcześniej bracia Pastorowie.
wybierz: Jakie kolory miała chorągiew, którą zabrał Feri Acz? | *czerwony i zielony | biały i czerwony | niebieski i żółty | czarny i biały !! Chorągiew chłopców z Placu Broni była czerwono-zielona.
wybierz: Ile głosów dostał Boka w wyborach przywódcy? | *jedenaście | trzy | siedem | czternaście !! Boka dostał 11 głosów, a Gereb tylko 3.
wpisz: Uzupełnij liczby. >> W wyborach przywódcy Boka dostał [11|jedenaście] głosów, a Gereb — [3|trzy]. !! Głosowało czternastu chłopców: 11 głosów dostał Boka, 3 — Gereb.
wybierz: Kto poszedł z Boką na wyprawę do Ogrodu Botanicznego? | *Nemeczek i Czonakosz | Gereb i Czele | Kolnay i Barabasz | Weiss i Rychter !! Do obozu Czerwonych Koszul zakradli się Boka, Nemeczek i Czonakosz.
wybierz: Co chłopcy zostawili na wyspie w Ogrodzie Botanicznym? | *kartkę z napisem, że byli tu chłopcy z Placu Broni | swoją chorągiew | list z prośbą o pokój | woreczek kulek !! Boka przypiął do drzewa kartkę. Chciał pokazać, że chłopcy z Placu Broni też są odważni.
wybierz: Kogo chłopcy zobaczyli na wyspie wśród Czerwonych Koszul? | *Gereba | Czelego | profesora Raca | stróża Jano !! W ten sposób wyszła na jaw zdrada Gereba.
wybierz: Co przydarzyło się Nemeczkowi podczas wyprawy do Ogrodu Botanicznego? | *wpadł do wody i cały przemókł | zgubił się w ruinach | skręcił nogę | trafił do niewoli !! Nemeczek wpadł do zimnej wody. Od tego zaczęła się jego choroba.
wybierz: Czym zajmował się Związek Kitowców? | *zbieraniem i żuciem kitu | zbieraniem znaczków | pisaniem gazetki | hodowlą rybek !! Chłopcy zbierali kit z okien i żuli go, żeby nie wysechł.
wybierz: Dlaczego Związek Kitowców wpisał nazwisko Nemeczka małymi literami? | *bo niesłusznie uznał go za zdrajcę | bo był najmłodszy | bo nie chciał żuć kitu | bo przegrał wybory !! Nemeczek wybiegł z zebrania, żeby śledzić Gereba. Koledzy nie znali powodu i uznali to za zdradę.
wybierz: Czym Gereb przekupił stróża, żeby ten wypędził chłopców z placu? | *cygarami | słodyczami | kulkami | kitem !! Gereb dał stróżowi cygara i obiecał mu pieniądze.
wybierz: Jak Feri Acz zareagował na wiadomość, że Gereb przekupił stróża? | *oburzył się, bo chciał zdobyć plac w uczciwej walce | ucieszył się z łatwego zwycięstwa | dał Gerebowi nagrodę | kazał przekupić także Bokę !! Feri Acz nie chciał wygrać podstępem. Postanowił zdobyć plac w otwartej bitwie.
wybierz: Dlaczego Czerwone Koszule chciały zdobyć Plac Broni? | *bo nie miały gdzie grać w palanta | bo chciały postawić tam dom | bo zgubiły tam swoją chorągiew | bo kazał im stróż !! Czerwone Koszule nie miały dobrego miejsca do gry w palanta, a Plac Broni świetnie się do tego nadawał.
wybierz: Jak Czerwone Koszule ukarały Nemeczka, gdy znalazły go w swoim obozie? | *bracia Pastorowie wykąpali go w stawie | zamknęły go w ruinach | zabrały mu buty | związały go i odesłały do Boki !! Nemeczek, choć już przeziębiony, zniósł kąpiel w zimnej wodzie bez skargi.
wybierz: Co zrobił Nemeczek, gdy Feri Acz chciał go przyjąć do Czerwonych Koszul? | *odmówił | zgodził się | poprosił o czas do namysłu | uciekł bez słowa !! Nemeczek wolał zimną kąpiel niż zdradę kolegów.
wybierz: Jak Czerwone Koszule pożegnały przemoczonego Nemeczka? | *oddały mu honory | wyśmiały go | obrzuciły go piaskiem | goniły go do bramy !! Feri Acz docenił odwagę małego przeciwnika i kazał oddać mu honory.
wybierz: Jak skończyła się sprawa Gereba? | *przeprosił, a chłopcy przyjęli go z powrotem | został wodzem Czerwonych Koszul | wyjechał z miasta | nigdy więcej nie przyszedł na plac !! Gereb szczerze żałował zdrady. Chłopcy mu wybaczyli, a w bitwie walczył po ich stronie.
wybierz: Kto odwiedził chorego Nemeczka przed bitwą, żeby życzyć mu zdrowia? | *posłowie Czerwonych Koszul | profesor Rac | stróż Jano | ojciec Gereba !! Przeciwnicy tak szanowali odwagę Nemeczka, że przyszli go odwiedzić.
wybierz: Czym walczono w bitwie o Plac Broni? | *bombami z piasku, na włócznie i w zapasach | kamieniami i kijami | pięściami bez żadnych zasad | śnieżkami !! Obie strony ustaliły zasady uczciwej walki: bomby z piasku, zapasy i walka na włócznie.
wybierz: Kto w decydującej chwili bitwy powalił Feriego Acza? | *Nemeczek | Boka | Czonakosz | Gereb !! Chory Nemeczek przybiegł na plac i powalił wodza Czerwonych Koszul. To przesądziło o zwycięstwie.
wybierz: Kto wygrał bitwę o Plac Broni? | *chłopcy z Placu Broni | Czerwone Koszule | nikt, bo bitwę przerwał stróż | nikt, bo był remis !! Chłopcy z Placu Broni obronili swój plac.
wybierz: Na jaki stopień awansował Nemeczek po bitwie? | *kapitana | generała | porucznika | sierżanta !! Jedyny szeregowiec został po bitwie kapitanem.
wybierz: Na co zmarł Nemeczek? | *na zapalenie płuc | od rany odniesionej w bitwie | w wypadku na ulicy | utonął w stawie !! Nemeczek kilka razy przemókł w zimnej wodzie i ciężko się rozchorował.
wybierz: Jak Związek Kitowców przeprosił Nemeczka? | *wpisał jego nazwisko wielkimi literami | wybrał go na prezesa | oddał mu cały kit | kupił mu chorągiew !! Koledzy zrozumieli, że skrzywdzili Nemeczka. Przyszli z przeprosinami, ale było już za późno.
wybierz: Co stało się z Placem Broni na końcu powieści? | *miała na nim stanąć kamienica | zamieniono go w park | przejęły go Czerwone Koszule | chłopcy dostali go na własność !! Boka dowiedział się od stróża, że na placu zacznie się budowa domu.
pary: Ułóż wydarzenia w kolejności: połącz numer z wydarzeniem. >> 1 = bracia Pastorowie zabierają kulki ; 2 = Boka zostaje przywódcą ; 3 = wyprawa do Ogrodu Botanicznego ; 4 = profesor Rac rozwiązuje Związek Kitowców !! Najpierw był „einstand”, potem wybory, wyprawa do obozu wroga i sprawa Związku Kitowców.
pary: Ułóż wydarzenia w kolejności: połącz numer z wydarzeniem. >> 1 = Nemeczek słyszy, jak Gereb przekupuje stróża ; 2 = Pastorowie kąpią Nemeczka w stawie ; 3 = bitwa o Plac Broni ; 4 = Związek Kitowców przeprasza Nemeczka !! Najpierw wychodzi na jaw przekupstwo, potem Nemeczek idzie sam do obozu wroga, a przeprosiny są dopiero po bitwie.
pary: Ułóż wydarzenia w kolejności: połącz numer z wydarzeniem. >> 1 = chłopcy wygrywają bitwę ; 2 = Nemeczek zostaje kapitanem ; 3 = Nemeczek umiera ; 4 = Boka dowiaduje się o budowie kamienicy !! Powieść kończy się smutno: po zwycięstwie umiera Nemeczek, a plac ma zostać zabudowany.
`,
  `
1. Bracia Pastorowie zabierają młodszym kulki („einstand”).
2. Feri Acz zabiera chorągiew. Boka zostaje przywódcą (11 głosów, Gereb 3).
3. Wyprawa do Ogrodu Botanicznego: kartka na wyspie, zdrada Gereba wychodzi na jaw, Nemeczek wpada do wody.
4. Profesor Rac rozwiązuje Związek Kitowców. Nemeczek zostaje wpisany do księgi małymi literami.
5. Gereb przekupuje stróża cygarami. Nemeczek to słyszy.
6. Nemeczek sam w obozie wroga: odmawia zdrady, kąpiel w stawie, honory od Czerwonych Koszul.
7. Gereb przeprasza i wraca do kolegów.
8. Wypowiedzenie wojny i zasady walki: bomby z piasku, zapasy, włócznie.
9. Bitwa: chory Nemeczek powala Feriego Acza. Zwycięstwo chłopców z Placu Broni.
10. Nemeczek zostaje kapitanem. Choroba i śmierć Nemeczka.
11. Na Placu Broni ma stanąć kamienica.
`,
  `
# Najważniejsze
Chłopcy z Placu Broni bronią swojego placu przed Czerwonymi Koszulami, które chcą go zdobyć.
Gereb zdradza kolegów, a mały Nemeczek naraża dla nich zdrowie.
Chłopcy wygrywają bitwę, ale Nemeczek umiera, a na placu ma stanąć kamienica.
## Streszczenie
Einstand: Bracia Pastorowie zabierają Nemeczkowi i jego kolegom kulki. Mówią „einstand” — silniejszy bierze, co chce.
Zabrana chorągiew: Feri Acz zakrada się na Plac Broni i zabiera czerwono-zieloną chorągiew. Chłopcy wybierają przywódcę: Boka dostaje 11 głosów, Gereb 3.
Wyprawa do Ogrodu Botanicznego: Boka, Czonakosz i Nemeczek zostawiają w obozie wroga kartkę, że tu byli. Widzą wśród Czerwonych Koszul Gereba. Nemeczek wpada do wody.
Związek Kitowców: Profesor Rac rozwiązuje związek. Nemeczek wybiega z zebrania śledzić Gereba, więc koledzy wpisują go do księgi małymi literami — jak zdrajcę.
Przekupiony stróż: Gereb daje stróżowi cygara, żeby wypędził chłopców z placu. Nemeczek to słyszy i mówi o wszystkim Boce.
Nemeczek w obozie wroga: Sam staje przed Czerwonymi Koszulami i nie chce do nich przejść. Pastorowie kąpią go w stawie, ale Feri Acz każe oddać mu honory.
Powrót Gereba: Gereb żałuje zdrady i prosi o wybaczenie. Nemeczek nie wydaje go przed jego ojcem. Chłopcy przyjmują Gereba z powrotem.
Wypowiedzenie wojny: Posłowie Czerwonych Koszul ustalają z Boką zasady: bomby z piasku, zapasy i walka na włócznie. Odwiedzają też chorego Nemeczka.
Bitwa o Plac Broni: Część napastników zostaje zamknięta w budce stróża. W decydującej chwili chory Nemeczek powala Feriego Acza. Chłopcy z Placu Broni wygrywają.
Kapitan Nemeczek: Nemeczek awansuje na kapitana, ale jest już ciężko chory. Matka zabiera go do domu.
Śmierć Nemeczka: Związek Kitowców przeprasza i wpisuje jego nazwisko wielkimi literami — za późno. Nemeczek umiera na zapalenie płuc.
Koniec placu: Boka dowiaduje się od stróża, że na Placu Broni stanie kamienica. Plac, o który walczyli, przepada.
# Tak / nie tak
tak: Feriego Acza powalił Nemeczek. | nie: Feriego Acza powalił Boka. | bo: to chory Nemeczek przybiegł na plac w ostatniej chwili i przesądził o zwycięstwie.
tak: Nemeczek zmarł w domu, już po bitwie. | nie: Nemeczek zginął w bitwie. | bo: w bitwie nikt nie zginął. Nemeczek zmarł na zapalenie płuc, bo kilka razy przemókł w zimnej wodzie.
tak: Chłopcy wygrali bitwę, ale stracili plac. | nie: Po bitwie plac został ich na zawsze. | bo: na placu miała stanąć kamienica.
tak: Nemeczka wpisano małymi literami przez pomyłkę. | nie: Nemeczka wpisano małymi literami, bo zdradził. | bo: wyszedł z zebrania, żeby śledzić prawdziwego zdrajcę — Gereba.
# Zapamiętaj
Kolejność w pięciu słowach: chorągiew → wyprawa → zdrada → bitwa → kamienica.
Zimna woda to przyczyna choroby Nemeczka: najpierw wpadł do niej podczas wyprawy, potem wykąpali go Pastorowie.
# Sprawdź się
wybierz: Co wydarzyło się najwcześniej? | *wybory przywódcy | bitwa o Plac Broni | śmierć Nemeczka !! Boka został przywódcą na samym początku — zaraz po tym, jak Feri Acz zabrał chorągiew.
wybierz: Kto powiedział Boce, że Gereb przekupił stróża? | *Nemeczek | Czonakosz | profesor Rac !! Nemeczek podsłuchał rozmowę Gereba ze stróżem i od razu powtórzył ją Boce.
wybierz: Co wydarzyło się na samym końcu? | *Boka dowiaduje się o budowie kamienicy | chłopcy wygrywają bitwę | Gereb wraca do kolegów !! Ostatnia scena to rozmowa Boki ze stróżem na placu.
`,
);

const CHLOPCY_OMOWIENIE = lektura(
  'b-p5-lek-chlopcy-omowienie',
  112,
  `${CHLOPCY}: omówienie`,
  'Najważniejsze informacje o książce: autor, czas i miejsce akcji, ważne pojęcia i to, czego ta historia uczy. Zastanów się, jak zachowali się bohaterowie i dlaczego.',
  [5],
  `
wybierz: Kto napisał „Chłopców z Placu Broni”? | *Ferenc Molnár | Henryk Sienkiewicz | Janusz Korczak | Mark Twain !! Autorem jest Ferenc Molnár.
wpisz: Uzupełnij nazwisko autora. >> „Chłopców z Placu Broni” napisał Ferenc [Molnár|Molnar]. !! Ferenc Molnár — nazwisko piszemy przez „á”, ale na kartkówce liczy się też zapis „Molnar”.
wybierz: Jakiej narodowości był autor powieści? | *Węgrem | Polakiem | Niemcem | Czechem !! Ferenc Molnár był pisarzem węgierskim.
wybierz: W jakim mieście rozgrywa się akcja powieści? | *w Budapeszcie | w Wiedniu | w Pradze | w Warszawie !! Akcja rozgrywa się w Budapeszcie, stolicy Węgier.
wpisz: Wpisz miejsce akcji. >> Miasto: [Budapeszt]. Kraj: [Węgry]. !! Akcja rozgrywa się w Budapeszcie, stolicy Węgier.
wybierz: Kiedy rozgrywa się akcja powieści? | *wiosną 1889 roku | zimą 1889 roku | wiosną 1989 roku | latem 1907 roku !! Akcja trwa niespełna dwa tygodnie w marcu 1889 roku.
wybierz: Gdzie mieli swój obóz chłopcy z Czerwonych Koszul? | *w Ogrodzie Botanicznym | na Placu Broni | w szkole | w składzie drewna !! Czerwone Koszule zbierały się na wyspie w Ogrodzie Botanicznym.
wybierz: Czym był Plac Broni? | *pustym placem przy ulicy Pawła, obok składu drewna | boiskiem przy szkole | rynkiem w środku miasta | wyspą na stawie !! Plac leżał przy ulicy Pawła i sąsiadował ze składem drewna, w którym chłopcy mieli swoje twierdze.
wybierz: Co oznaczało słowo „einstand”? | *silniejszy zabiera słabszemu jego rzeczy | uroczyste powitanie wodza | hasło wartownika | koniec bitwy !! Kto mówił „einstand”, ogłaszał, że zabiera cudzą rzecz, bo jest silniejszy.
wybierz: Czym dla chłopców był Plac Broni? | *małą ojczyzną, której trzeba bronić | zwykłym boiskiem | miejscem do odrabiania lekcji | kryjówką przed rodzicami !! Chłopcy kochali swój plac i bronili go tak, jak broni się ojczyzny.
wybierz: Jakim gatunkiem literackim są „Chłopcy z Placu Broni”? | *powieścią | baśnią | legendą | komiksem !! To powieść: długi utwór pisany prozą, z wieloma bohaterami i wydarzeniami.
wybierz: Kto opowiada o wydarzeniach w powieści? | *narrator, który nie bierze udziału w wydarzeniach | Boka | Nemeczek | profesor Rac !! O wydarzeniach opowiada narrator — nie jest żadnym z bohaterów.
wybierz: Dlaczego tytuł mówi o „chłopcach”, a nie o jednym bohaterze? | *bo bohaterem jest cała grupa chłopców | bo autor nie znał ich imion | bo Nemeczek nie jest ważny | bo to zbiór osobnych opowiadań !! Bohaterem powieści jest cała grupa — to bohater zbiorowy.
wybierz: Które zachowanie pokazuje, że Feri Acz był honorowym przeciwnikiem? | *nie chciał zdobyć placu dzięki przekupstwu | zabrał chłopcom chorągiew | kazał wykąpać Nemeczka | wypowiedział wojnę !! Feri Acz chciał wygrać w uczciwej walce, a nie podstępem.
wybierz: Co w tej powieści jest przykładem zdrady? | *Gereb pomaga wrogom zdobyć plac | Nemeczek wychodzi z zebrania | Boka wygrywa wybory | Feri Acz wypowiada wojnę !! Gereb w tajemnicy pomagał Czerwonym Koszulom przeciwko własnym kolegom.
wybierz: Dlaczego Nemeczka można nazwać bohaterem? | *bo dla wspólnej sprawy narażał zdrowie i nie zdradził | bo był najsilniejszy z chłopców | bo dowodził armią | bo wygrał wybory !! Nemeczek był mały i słaby, ale odwagą i wiernością przewyższał wszystkich.
sortuj: Co powieść pochwala, a co potępia? >> pochwala = odwaga, wierność, honor, przyjaźń ; potępia = zdrada, przekupstwo, okradanie słabszych !! Bohaterowie zdobywają szacunek odwagą, wiernością i honorem. Zdrada, przekupstwo i „einstand” są w powieści czymś wstydliwym.
wybierz: Co łączyło obie walczące grupy? | *obie przestrzegały zasad uczciwej walki | obie przekupiły stróża | obie chciały zniszczyć plac | obie należały do Związku Kitowców !! Przed bitwą przeciwnicy ustalili zasady i się ich trzymali.
wybierz: Czego uczy historia Gereba? | *że błąd można naprawić, gdy szczerze się go żałuje | że zdrajcom nigdy się nie wybacza | że nie warto mieć kolegów | że najważniejsze jest zwycięstwo !! Gereb przeprosił, a koledzy dali mu drugą szansę.
wybierz: Co jest najsmutniejsze w zakończeniu powieści? | *plac, za który Nemeczek oddał życie, i tak przepadł | chłopcy przegrali bitwę | Boka przestał być przywódcą | Gereb znowu zdradził !! Chłopcy obronili plac przed Czerwonymi Koszulami, ale nie mogli obronić go przed dorosłymi, którzy postanowili go zabudować.
`,
  `
Autor: Ferenc Molnár, pisarz węgierski. Gatunek: powieść.
Czas i miejsce akcji: wiosna (marzec) 1889 roku, Budapeszt — stolica Węgier.
Plac Broni: pusty plac przy ulicy Pawła, obok składu drewna. Ogród Botaniczny: obóz Czerwonych Koszul.
Einstand: silniejszy zabiera słabszemu jego rzeczy.
Związek Kitowców: tajny związek chłopców, którzy zbierają i żują kit.
Powieść pochwala odwagę, wierność, honor, przyjaźń i przebaczenie. Potępia zdradę i przekupstwo.
Uwaga: bohaterem jest cała grupa chłopców — to bohater zbiorowy. Plac jest dla nich małą ojczyzną.
`,
  `
# Najważniejsze
„Chłopców z Placu Broni” napisał węgierski pisarz Ferenc Molnár. To powieść.
Akcja rozgrywa się w Budapeszcie, stolicy Węgier, wiosną 1889 roku.
To opowieść o przyjaźni, honorze i odwadze. Plac jest dla chłopców małą ojczyzną.
## Miejsca i pojęcia
Plac Broni: Pusty plac przy ulicy Pawła, obok składu drewna. Chłopcy grają tam w palanta i traktują go jak własne państwo.
Ogród Botaniczny: Tu, na wyspie na stawie, mają obóz Czerwone Koszule.
Einstand: Tak mówi silniejszy, gdy zabiera słabszemu jego rzeczy.
Związek Kitowców: Tajny związek kilku chłopców. Zbierają kit i żują go, żeby nie wysechł.
## Czego uczy ta książka
Odwaga: Nemeczek sam staje przed całym obozem wroga, a potem chory przybiega na bitwę.
Wierność: Nemeczek woli zimną kąpiel niż przejście do przeciwników.
Honor: Feri Acz nie chce zdobyć placu przekupstwem. Obie strony walczą według ustalonych zasad.
Przebaczenie: Chłopcy dają Gerebowi drugą szansę, bo szczerze żałuje.
# Tak / nie tak
tak: Akcja rozgrywa się w Budapeszcie, na Węgrzech. | nie: Akcja rozgrywa się w Polsce. | bo: autor był Węgrem i opisał swoje rodzinne miasto. Imiona takie jak Feri czy Janosz są węgierskie.
tak: Akcja toczy się w 1889 roku. | nie: Akcja toczy się w naszych czasach. | bo: chłopcy bawią się kulkami i grają w palanta, a nie mają telefonów ani komputerów.
tak: To powieść. | nie: To baśń. | bo: nie ma tu czarów ani postaci fantastycznych. Wszystko mogło wydarzyć się naprawdę.
tak: Bohaterem jest cała grupa chłopców. | nie: Bohaterem jest tylko Boka. | bo: tytuł mówi o „chłopcach”. Taki bohater to bohater zbiorowy.
# Zapamiętaj
Trzy fakty na początek każdej kartkówki: Molnár — Budapeszt — 1889.
Plac to mała ojczyzna: chłopcy mają chorągiew, wojsko i przywódcę, jak prawdziwe państwo.
# Sprawdź się
wybierz: Który zestaw informacji o powieści jest poprawny? | *Molnár, Budapeszt, 1889 | Molnár, Warszawa, 1989 | Sienkiewicz, Budapeszt, 1889 !! Autor: Ferenc Molnár. Miejsce akcji: Budapeszt. Czas akcji: 1889 rok.
wybierz: Co to znaczy, że Plac Broni był dla chłopców małą ojczyzną? | *kochali go i byli gotowi go bronić | urodzili się na nim | mieszkali tam z rodzicami !! Chłopcy traktowali plac jak własne państwo: mieli chorągiew, wojsko i przywódcę.
wybierz: Kto w powieści zachował się honorowo, choć był przeciwnikiem? | *Feri Acz | Gereb | stróż !! Feri Acz nie chciał wygrać dzięki przekupstwu i docenił odwagę Nemeczka.
`,
);

export const LEKTURY_GRADE5: Topic[] = [CHLOPCY_BOHATEROWIE, CHLOPCY_WYDARZENIA, CHLOPCY_OMOWIENIE];
