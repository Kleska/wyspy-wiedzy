/*
 * Lekcje (tryb nauki) do tematów wbudowanych: krótkie karty do przeczytania PRZED ćwiczeniami.
 * Format — patrz `parseLesson` w `dsl.ts`. Zasady pisania:
 *
 * - Najważniejsze: najwyżej trzy krótkie linie.
 * - Krok po kroku: polecenia, które dziecko może wykonać po kolei, i jeden przykład („Przykład: …”)
 *   przechodzący te same kroki. Przykład nie może być zadaniem z tematu.
 * - Tak / nie tak: najwyżej cztery pary. „Nie” to błąd, który polskie dziecko naprawdę robi (kalka z polskiego),
 *   a „bo” to powód albo sposób sprawdzenia, nie powtórzenie reguły. Aplikacja sama dopisuje słowo „Bo”.
 *   Nie pokazujemy błędnej pisowni ani błędnych skojarzeń słówek — to utrwala błąd.
 * - Zapamiętaj: skojarzenie albo prosty test, którym dziecko samo się sprawdzi. Musi działać na przykładach
 *   z tego samego rozdziału (np. „a dress” kończy się na -s, a jest jedną rzeczą).
 * - Sprawdź się: 2–3 pytania z wyjaśnieniem, inne niż zadania tematu (nie trafiają do dziennika postępów).
 * - Angielskie słowo w polskim zdaniu bierzemy w „…”; wyliczenia i schematy ze strzałkami — bez cudzysłowów.
 * - Matematyka: linia „słupek: 936 : 4” w części „Krok po kroku” daje kartę z dzieleniem pisemnym odsłanianym krok po kroku
 *   (wszystko liczy aplikacja). Zadania „Oblicz pisemnie” bierzemy z `writtenLine`, żeby wynik był policzony, a nie wpisany.
 */

import { writtenLine } from './math';

export const LESSONS: Record<string, string> = {
  'b-m5-dzp-1': `
# Najważniejsze
Dzielenie pisemne zaczynamy od lewej strony — od pierwszej cyfry. To odwrotnie niż w dodawaniu, odejmowaniu i mnożeniu pisemnym.
W każdym kroku robimy to samo: dzielę, mnożę, odejmuję, spisuję następną cyfrę.
Na koniec sprawdzamy mnożeniem: wynik razy dzielnik musi dać dzielną.
# Krok po kroku
Weź pierwszą cyfrę z lewej. Jeśli jest mniejsza od dzielnika, weź od razu dwie cyfry.
Podziel: ile razy dzielnik mieści się w tej liczbie? Tę cyfrę zapisz w wyniku — nad ostatnią cyfrą liczby, którą dzielisz.
Pomnóż tę cyfrę przez dzielnik i odejmij. Reszta musi być mniejsza od dzielnika.
Spisz następną cyfrę obok reszty i zacznij od nowa: dzielę, mnożę, odejmuję, spisuję.
słupek: 936 : 4
słupek: 156 : 3
# Tak / nie tak
tak: W 936 : 4 najpierw dzielę 9. | nie: W 936 : 4 najpierw dzielę 6. | bo: setki są warte najwięcej, więc dzielimy je pierwsze. To, co z nich zostanie, zamieniamy na dziesiątki i dzielimy dalej.
tak: 13 : 4 = 3, reszta 1 | nie: 13 : 4 = 2, reszta 5 | bo: w reszcie 5 czwórka mieści się jeszcze raz. Reszta zawsze musi być mniejsza od dzielnika.
tak: Spisuję jedną cyfrę i od razu dzielę. | nie: Spisuję dwie cyfry naraz. | bo: każda spisana cyfra daje jedną cyfrę wyniku. Kto spisze dwie naraz, zgubi cyfrę w wyniku.
# Zapamiętaj
Cztery słowa w kółko: dzielę → mnożę → odejmuję → spisuję. Po „spisuję” znowu „dzielę”.
Pisz równo: jedna cyfra w jednej kratce, cyfra pod cyfrą. Krzywy słupek to najczęstsza przyczyna błędów.
# Sprawdź się
wybierz: Dzielimy pisemnie 742 : 2. Którą cyfrę dzielimy najpierw? | *7 | 2 | 4 !! Zawsze zaczynamy od lewej strony, czyli od 7.
wybierz: Dzielimy pisemnie 265 : 5. Którą liczbę dzielimy najpierw? | *26 | 2 | 65 !! 2 jest mniejsze od 5, więc bierzemy od razu dwie cyfry: 26.
${writtenLine(474, 3)}
`,
  'b-m5-dzp-zero': `
# Najważniejsze
Gdy po spisaniu cyfry liczba jest mniejsza od dzielnika, piszemy 0 w wyniku i spisujemy następną cyfrę.
Jeśli po ostatnim kroku coś zostaje, to jest to reszta. Zapisujemy ją po literze r: 587 : 4 = 146 r 3.
Reszta jest zawsze mniejsza od dzielnika. Sprawdzenie: wynik razy dzielnik plus reszta daje dzielną.
# Krok po kroku
Dziel jak zwykle: dzielę, mnożę, odejmuję, spisuję.
Po każdym spisaniu cyfry zapytaj: czy dzielnik mieści się w tej liczbie? Jeśli nie — wpisz 0 w wyniku i spisz następną cyfrę.
Gdy skończą się cyfry do spisania, to, co zostało na dole, jest resztą.
Sprawdź: pomnóż wynik przez dzielnik i dodaj resztę.
słupek: 824 : 4
słupek: 587 : 4
# Tak / nie tak
tak: 824 : 4 = 206 | nie: 824 : 4 = 26 | bo: 2 dziesiątek nie da się podzielić przez 4, ale miejsce dziesiątek w wyniku musi być zajęte. Sprawdź: 26 · 4 = 104, a nie 824.
tak: 840 : 4 = 210 | nie: 840 : 4 = 21 | bo: ostatnie zero też daje cyfrę wyniku: 0 : 4 = 0. Sprawdź: 21 · 4 = 84, a nie 840.
tak: 47 : 5 = 9 r 2 | nie: 47 : 5 = 8 r 7 | bo: reszta 7 jest większa od 5, więc piątka zmieści się jeszcze raz.
# Zapamiętaj
Każda spisana cyfra to jedna cyfra w wyniku — nawet jeśli tą cyfrą jest 0.
Policz dzielenia: w 824 : 4 dzielimy trzy razy (8, potem 2, potem 24), więc wynik ma trzy cyfry. Wyszły dwie? Gdzieś zgubiło się zero.
# Sprawdź się
wybierz: Ile to jest 921 : 3? | *307 | 37 | 370 !! 9 : 3 = 3, potem 2 : 3 = 0 (to zero trzeba zapisać), na końcu 21 : 3 = 7.
wybierz: Która reszta nie może wyjść przy dzieleniu przez 7? | *7 | 0 | 6 !! Reszta jest zawsze mniejsza od dzielnika, więc przy dzieleniu przez 7 może być najwyżej 6.
${writtenLine(365, 7)}
`,
  'b-m5-dzp-2cyfr': `
# Najważniejsze
Przez liczbę dwucyfrową dzielimy tak samo: dzielę, mnożę, odejmuję, spisuję.
Na początku bierzemy tyle cyfr, żeby powstała liczba nie mniejsza od dzielnika — zwykle dwie albo trzy.
Cyfrę wyniku trzeba oszacować. Pomaga wygodna liczba blisko dzielnika: 24 to prawie 25, 38 to prawie 40.
# Krok po kroku
Weź z lewej tyle cyfr, żeby liczba była co najmniej tak duża jak dzielnik.
Oszacuj, ile razy dzielnik się w niej mieści. Zamień dzielnik na wygodną liczbę, żeby było łatwiej.
Pomnóż i sprawdź: iloczyn nie może być większy od dzielonej liczby, a reszta musi być mniejsza od dzielnika.
Jeśli coś się nie zgadza, zmień cyfrę o 1. Potem spisz następną cyfrę i powtarzaj.
słupek: 864 : 24
słupek: 1548 : 36
# Tak / nie tak
tak: 86 : 24 = 3, reszta 14 | nie: 86 : 24 = 4, bo 8 : 2 = 4 | bo: 4 · 24 = 96, a to więcej niż 86. Same pierwsze cyfry często podpowiadają za dużo — zawsze sprawdź mnożeniem.
tak: 144 : 24 = 6, reszta 0 | nie: 144 : 24 = 5, reszta 24 | bo: reszta 24 jest równa dzielnikowi, więc 24 mieści się jeszcze raz. Cyfra w wyniku była za mała.
# Zapamiętaj
Zrób sobie ściągę na marginesie: pomnóż dzielnik przez 2, 3, 4, 5… — w razie potrzeby aż do 9. Potem wybierasz największy iloczyn, który się mieści.
Za duży iloczyn — weź cyfrę o 1 mniejszą. Za duża reszta — weź cyfrę o 1 większą.
# Sprawdź się
wybierz: Dzielimy pisemnie 943 : 41. Którą liczbę dzielimy najpierw? | *94 | 9 | 943 !! 9 jest mniejsze od 41, więc bierzemy dwie cyfry: 94.
wybierz: Ile razy 18 mieści się w 100? Pomóż sobie: 18 to prawie 20. | *5 | 4 | 6 !! 5 · 18 = 90, a 6 · 18 = 108 to już za dużo.
${writtenLine(943, 41)}
`,
  'b-a5-u0-be': `
# Najważniejsze
„To be” znaczy „być”. W czasie teraźniejszym ma trzy formy: am, is, are.
I → am · he, she, it → is · you, we, they → are.
W przeczeniu dodajemy „not”: I'm not, isn't, aren't. Pytanie zaczynamy od am, is albo are: Is she…?
# Krok po kroku
Znajdź w zdaniu osobę albo rzecz, o której mowa.
Zamień ją w myślach na jedno słowo: my brother → he, my dog → it, Kate and Ben → they, Sam and I → we.
Dobierz formę: I → am · he, she, it → is · you, we, they → are.
Przykład: Ola and I ___ in class 5. Ola and I → we → are. Czyli: Ola and I are in class 5.
# Tak / nie tak
tak: Yes, he is. | nie: Yes, he's. | bo: skrót 's zapowiada, że coś jeszcze będzie. Na końcu zdania piszemy całe „is”.
tak: I'm eleven. | nie: I have eleven years. | bo: to polskie „mam jedenaście lat” słowo w słowo. Po angielsku mówimy „jestem jedenaście”.
tak: Are you from Poland? | nie: You are from Poland? | bo: po angielsku nie ma słowa „czy”. Pytanie robimy, zamieniając słowa miejscami: You are → Are you.
tak: You are my friend. | nie: You is my friend. | bo: „you” zawsze łączy się z „are” — nawet gdy mówisz do jednej osoby.
# Zapamiętaj
„I” ma własne „am” i z nikim się nim nie dzieli. He, she, it dostają „is”. Cała reszta (you, we, they) — „are”.
Skróty: I'm to I am, she's to she is, they're to they are. Test na skrót: czy po nim stoi jeszcze jakieś słowo? Stoi — możesz skrócić. Nie stoi — pisz całe is, am, are.
# Sprawdź się
wybierz: Wybierz poprawną formę. >> My friends ___ in the park. | *are | is | am !! My friends → they → are.
wybierz: Wybierz poprawną krótką odpowiedź. >> Is she your sister? | *Yes, she is. | Yes, she's. | Yes, she are. !! Po skrócie 's musi stać jeszcze jakieś słowo, więc na końcu piszemy całe „is”.
wpisz: Uzupełnij przeczenie: wpisz isn't albo aren't. >> We [aren't|are not] at school today. !! We → are, więc przeczenie to „aren't”.
`,

  'b-a5-u0-kraje': `
# Najważniejsze
Kraj i narodowość to dwa różne słowa: Poland to kraj, a Polish to narodowość.
Po „from” stoi kraj: I'm from Poland. Gdy nie ma „from”, stoi narodowość: I'm Polish.
Nazwy krajów i narodowości piszemy po angielsku zawsze wielką literą.
# Krok po kroku
Sprawdź, czy przed luką stoi „from”.
Jest „from” — potrzebny kraj. Nie ma „from” — potrzebna narodowość.
Wpisz słowo. Zacznij wielką literą.
Przykład: Lena is from ___. Jest „from” → kraj → Germany. Lena is ___. Nie ma „from” → narodowość → German.
# Tak / nie tak
tak: She's from Italy. | nie: She's from Italian. | bo: „from Italian” znaczy „z włoskiego”. Jest się z kraju: from Italy.
tak: He's Spanish. | nie: He's Spain. | bo: „He's Spain” znaczy „On jest Hiszpanią”. A on jest Hiszpanem: Spanish.
tak: I'm Polish. | nie: I'm polish. | bo: po angielsku — inaczej niż po polsku — także „polski” piszemy wielką literą.
tak: I'm from the UK. | nie: I'm from UK. | bo: UK i USA to skróty od the United Kingdom i the United States — „the” należy do nazwy.
# Zapamiętaj
„From” znaczy „z” i odpowiada na pytanie „skąd?”. A skąd się jest? Z kraju.
Narodowości często kończą się na -ish (Polish, Spanish, Turkish) albo -an (Italian, Argentinian). Osobno zapamiętaj: France → French, Germany → German, China → Chinese, the UK → British, the USA → American.
# Sprawdź się
wybierz: Wybierz poprawne słowo. >> My teacher is from ___. | *Germany | German | Polish !! Po „from” stoi kraj: Germany.
wybierz: Wybierz poprawne słowo. >> Selin is ___. | *Turkish | Turkey | from Turkish !! Nie ma „from”, więc potrzebna jest narodowość: Turkish.
kliknij: Kliknij słowa, które trzeba napisać wielką literą. >> My cousin is from *china*, but he isn't *chinese*. !! Nazwy krajów i narodowości piszemy po angielsku wielką literą: China, Chinese.
`,

  'b-a5-u0-miesiace': `
# Najważniejsze
Nazwy miesięcy piszemy po angielsku zawsze wielką literą: January, February, March…
Gdy mówisz, w którym miesiącu coś jest, przed nazwą miesiąca stoi „in”: in May — w maju.
Miesięcy najłatwiej nauczyć się po kolei, trójkami — jak wyliczanki.
# Krok po kroku
Podziel rok na cztery trójki: January, February, March · April, May, June · July, August, September · October, November, December.
Powiedz każdą trójkę kilka razy na głos, a potem wszystkie po kolei.
Gdy piszesz zdanie, postaw przed miesiącem „in” i zacznij miesiąc wielką literą.
Przykład: Mam urodziny w sierpniu. w → in, sierpień → August. Czyli: My birthday is in August.
# Tak / nie tak
tak: in July | nie: on July | bo: „in” znaczy „w” (w lipcu), a „on” — „na”.
tak: My birthday is in May. | nie: My birthday is in may. | bo: jest inaczej niż po polsku: maj, ale May.
tak: My birthday is in June. | nie: I have birthday in June. | bo: po angielsku urodziny „są” w miesiącu: My birthday is in…
# Zapamiętaj
W słowie July jest L — jak w słowie „lipiec”. W June nie ma L — to czerwiec.
Cztery ostatnie miesiące kończą się tak samo, na -ber: September, October, November, December.
Trudna pisownia: February ma „r” w środku (Feb-ru-ary), a August zaczyna się od „Au”.
# Sprawdź się
wybierz: Który zapis jest poprawny? | *in October | on October | at October !! „In” znaczy „w”: in October — w październiku.
wybierz: Który miesiąc to lipiec? | *July | June | January !! W słowie July jest L — jak w słowie „lipiec”.
kliknij: Kliknij słowa, które trzeba napisać wielką literą. >> My dad's birthday is in *march* and my birthday is in *september*. !! Nazwy miesięcy piszemy po angielsku wielką literą: March, September.
`,

  'b-a5-u0-havegot': `
# Najważniejsze
„Have got” znaczy „mieć”.
I, you, we, they → have got. He, she, it → has got.
Przeczenie: haven't got, hasn't got. Pytanie zaczynamy od Have albo Has: Have you got…? Has she got…?
# Krok po kroku
Znajdź osobę i zamień ją w myślach na jedno słowo: my cousin → he albo she, my parents → they.
Dobierz formę: he, she, it → has · wszyscy pozostali → have.
Dopisz „got”: w zwykłym zdaniu stoi zaraz po have albo has, a w pytaniu — po osobie.
Przykład: My sister ___ got a bike. My sister → she → has. Czyli: My sister has got a bike.
# Tak / nie tak
tak: She has got a cat. | nie: She have got a cat. | bo: he, she, it lubią literę S: she is, she has.
tak: Have you got a dog? | nie: Do you have got a dog? | bo: „have” samo tworzy pytanie — wystarczy postawić je na początku. „Do” jest zbędne.
tak: Yes, I have. | nie: Yes, I have got. | bo: w krótkiej odpowiedzi „got” znika.
tak: I've got a dog. | nie: I've got dog. | bo: po angielsku przed jedną rzeczą stoi „a”. Po polsku takiego słowa nie ma, więc łatwo o nim zapomnieć.
# Zapamiętaj
He, she, it lubią literę S: he iS, she haS. Gdzie powiesz „is”, tam powiesz „has”.
„He's got” to „he has got” (on ma), a samo „he's” to „he is” (on jest). Poznasz po słowie „got”.
# Sprawdź się
wybierz: Wybierz poprawną formę. >> My brother ___ got a new phone. | *has | have | is !! My brother → he → has.
wybierz: Wybierz poprawną krótką odpowiedź. >> Has your mum got a bike? | *No, she hasn't. | No, she haven't. | No, she hasn't got. !! Your mum → she → has, a w krótkiej odpowiedzi „got” znika.
wpisz: Uzupełnij pytanie. >> [Have] your parents got a car? !! Your parents → they, więc pytanie zaczyna się od „Have”.
`,

  'b-a5-u0-can': `
# Najważniejsze
„Can” znaczy „umieć, potrafić”, a „can't” — „nie umieć”.
„Can” jest takie samo dla każdej osoby: I can, she can, they can.
Po „can” stoi sama czynność — bez „to” i bez końcówek: She can swim.
# Krok po kroku
Zacznij od osoby: My dad.
Dodaj can albo can't: My dad can't.
Dodaj czynność w najprostszej postaci, takiej jak w słowniku: My dad can't sing.
W pytaniu przestaw „can” na początek: Can your dad sing? Krótka odpowiedź: Yes, he can. albo No, he can't.
Przykład: Mój kolega umie rysować. Kto? My friend. Umie → can. Czynność: draw. Czyli: My friend can draw.
# Tak / nie tak
tak: He can swim. | nie: He cans swim. | bo: „can” to gotowy klocek — nigdy nie dostaje -s.
tak: I can cook. | nie: I can to cook. | bo: w słowniku jest „to cook”, ale po „can” to „to” znika.
tak: Can you draw? | nie: Do you can draw? | bo: „can” samo tworzy pytanie — wystarczy postawić je na początku. „Do” jest zbędne.
tak: He can't swim. | nie: He not can swim. | bo: przeczenie to jedno słowo „can't”, zaraz po osobie.
# Zapamiętaj
„Can” jest jak gotowy klocek: nic się do niego nie dokleja. Do czynności po nim też nic — ani „to”, ani -s.
Trzy wyrażenia zapamiętaj w całości: play the guitar (z „the”), ride a bike (z „a”), play football (bez „a” i bez „the”).
# Sprawdź się
wybierz: Wybierz poprawne zdanie. | *My mum can cook. | My mum cans cook. | My mum can to cook. !! „Can” nie dostaje -s, a po nim nie ma „to”.
wybierz: Wybierz poprawne pytanie. | *Can he ride a bike? | Does he can ride a bike? | Can he rides a bike? !! Pytanie zaczyna się od „Can”, a czynność jest w najprostszej postaci: ride.
wpisz: Wpisz can albo can't. >> A dog [can] run, but it [can't|cannot] sing. !! Pies umie biegać (can), ale nie umie śpiewać (can't).
`,

  'b-a5-u0-there': `
# Najważniejsze
„There is” (krócej: there's) mówi, że gdzieś jest jedna rzecz. „There are” — że jest ich kilka.
W przeczeniu: There isn't a… albo There aren't any… W pytaniu: Is there…? Are there…?
Przyimki in (w), on (na), under (pod), next to (obok) mówią, gdzie coś jest.
# Krok po kroku
Popatrz na słowo zaraz po luce.
Dobierz formę: „a”, „an” albo „one” (a desk) → is · two, three, „some”, „any” (two chairs, some books) → are.
Przy wyliczaniu liczy się pierwsza rzecz: There is a bed and a desk. There are two chairs and a table.
Przykład: There ___ four posters on the wall. Four posters → kilka rzeczy → are. Czyli: There are four posters on the wall.
# Tak / nie tak
tak: There's a desk in my room. | nie: In my room is a desk. | bo: samo „is” nie wystarczy — po angielsku mówimy „there is”.
tak: There are two beds. | nie: There is two beds. | bo: two beds to kilka rzeczy, więc „are”.
tak: There aren't any posters. | nie: There aren't some posters. | bo: „some” znaczy „kilka”. W przeczeniu potrzebne jest „żadnych”, czyli „any”.
tak: Is there a TV? Yes, there is. | nie: Is there a TV? Yes, it is. | bo: w odpowiedzi powtarzamy początek pytania: Is there…? → there is.
# Zapamiętaj
Patrz na słowo zaraz po luce. Jest „a”, „an” albo „one” — pisz is, nawet gdy rzecz kończy się na -s (a dress). Jest two, three, „some” albo „any” — pisz are.
Przyimki pokaż ręką na pudełku albo piórniku i powiedz na głos: in — ręka w pudełku, on — na pudełku, under — pod pudełkiem, next to — obok pudełka.
# Sprawdź się
wybierz: Wybierz poprawną formę. >> There ___ some shoes under the bed. | *are | is | am !! Some shoes to kilka rzeczy, więc „are”.
wybierz: Książka leży na biurku. Wybierz przyimek. >> The book is ___ the desk. | *on | in | under !! „On” znaczy „na”.
wpisz: Dokończ krótką odpowiedź. >> Is there a fridge in the kitchen? Yes, there [is]. !! W odpowiedzi powtarzamy początek pytania: Is there…? → Yes, there is.
`,

  'b-a5-u0-this': `
# Najważniejsze
This i these mówią o tym, co jest blisko — na wyciągnięcie ręki. That i those — o tym, co jest daleko.
This i that mówią o jednej rzeczy. These i those — o kilku.
Z this i that łączy się „is”, a z these i those — „are”.
# Krok po kroku
Zadaj sobie dwa pytania: Blisko czy daleko? Jedna rzecz czy kilka?
Dobierz słowo: blisko i jedna → this · blisko i kilka → these · daleko i jedna → that · daleko i kilka → those.
Nie wiesz, ile rzeczy? Popatrz, czy w zdaniu jest is, czy are: is → this albo that · are → these albo those.
Przykład: ___ books are old. Books to kilka rzeczy (jest też „are”), więc: These books are old (blisko) albo Those books are old (daleko).
# Tak / nie tak
tak: These jeans are new. | nie: This jeans is new. | bo: jeans to zawsze liczba mnoga, jak polskie „spodnie”.
tak: These are my trainers. | nie: This are my trainers. | bo: z „are” łączy się „these”. „This” mówi tylko o jednej rzeczy.
tak: What are these? They're trainers. | nie: What are these? It's trainers. | bo: pytanie było o kilka rzeczy, więc w odpowiedzi jest „they”.
tak: What's this? It's a hat. | nie: What's this? It's hat. | bo: przed jedną rzeczą stoi „a”. Przed kilkoma już nie: They're hats.
# Zapamiętaj
ThIs — I jak „blIsko”. ThAt — A jak „dAleko”.
These to liczba mnoga od this (też blisko), a those — od that (też daleko). Oba kończą się na -se.
# Sprawdź się
wybierz: Rzeczy są daleko. Wybierz słowo. >> ___ are my bikes. | *Those | That | This !! Kilka rzeczy daleko — those.
wybierz: Wybierz poprawne słowo. >> ___ skirt is pretty. | *This | These | Those !! Skirt to jedna rzecz (is), więc „this”.
wpisz: Wpisz It's albo They're. >> What are these? [They're|They are] jumpers. !! Jumpers to kilka rzeczy, więc „They're”.
`,

  'b-a5-u0-poss': `
# Najważniejsze
Zaimki dzierżawcze mówią, czyje coś jest: I → my, you → your, he → his, she → her, it → its, we → our, they → their.
Także 's po imieniu albo osobie pokazuje, czyje coś jest: Ola's bike to rower Oli, my dad's car to samochód mojego taty.
Przymiotnik (new, old, funny) stoi przed rzeczownikiem i nigdy się nie zmienia: a new hat, two new hats.
# Krok po kroku
Znajdź właściciela: kto to ma?
Zamień go w myślach na jedno słowo: my brother → he, Kuba and Ola → they.
Dobierz zaimek: he → his, they → their.
Przykład: This is my brother. ___ bike is new. My brother → he → his. Czyli: His bike is new.
# Tak / nie tak
tak: Her name is Kate. | nie: She name is Kate. | bo: „She name” znaczy „ona imię”. Ma być „jej imię”: her name.
tak: The dog has got its ball. | nie: The dog has got it's ball. | bo: „its” znaczy „jego”, a „it's” to skrót od „it is” albo „it has”.
tak: Ola's bike | nie: bike Ola's | bo: jest odwrotnie niż po polsku (rower Oli): najpierw właściciel z 's, potem rzecz.
tak: two new hats | nie: two news hats | bo: -s dostaje tylko rzecz (hats). Przymiotnik się nie zmienia — inaczej niż po polsku.
# Zapamiętaj
Patrz na właściciela, a nie na rzecz: brat Oli to her brother (bo Ola to she), a siostra Kuby to his sister (bo Kuba to he).
Mój rower, moja czapka, moje buty — po angielsku zawsze „my”.
Test na its i it's: spróbuj wstawić „it is” albo „it has”. Pasuje? Pisz it's. Nie pasuje? Pisz its.
# Sprawdź się
wybierz: Wybierz zaimek. >> I've got two sisters. ___ names are Ola and Ania. | *Their | Her | Our !! Two sisters → they → their.
wybierz: Wybierz poprawne słowo. >> It's a nice room. ___ walls are white. | *Its | It's | His !! To ściany pokoju (it → its). „It is walls are white” nie ma sensu, więc to nie „it's”.
wpisz: Zastąp imię zaimkiem. >> It's Adam's bike. It's [his] bike. !! Adam → he → his.
`,

  'b-a5-u0-czytanie': `
# Najważniejsze
Najpierw przeczytaj cały tekst — spokojnie, do końca. Nie musisz rozumieć każdego słowa.
Odpowiedź zawsze jest w tekście. Znajdź zdanie, które mówi o tym samym co pytanie.
True znaczy „prawda”, a false — „fałsz”.
# Krok po kroku
Przeczytaj tekst i pomyśl: o kim albo o czym on jest?
Przeczytaj pytanie i znajdź w nim ważne słowo: imię, rzecz albo miejsce.
Poszukaj tego słowa w tekście i przeczytaj całe zdanie, w którym stoi.
Porównaj zdanie z pytaniem. Uważaj na „not”, „n't” i liczby.
Przykład: W tekście: „Max hasn't got a dog”. Zdanie do sprawdzenia: „Max has got a dog”. Ważne słowo: dog. W tekście stoi „hasn't”, więc false.
# Tak / nie tak
tak: Szukam odpowiedzi w tekście. | nie: Odpowiadam z pamięci albo zgaduję. | bo: w tekście może być inaczej, niż się wydaje.
tak: Czytam zdanie do końca. | nie: Patrzę tylko na pierwsze słowa. | bo: jedno „not” zmienia prawdę w fałsz.
tak: Nie znam słowa — czytam zdanie do końca, a potem sprawdzam słowo w „Słówkach z tekstu”. | nie: Przerywam czytanie, bo nie znam słowa. | bo: resztę zdania zwykle da się zrozumieć i bez tego słowa.
# Zapamiętaj
Pytania zaczynają się od takich słów: Who? — kto? · What? — co? · Where? — gdzie? · When? — kiedy? · How old? — ile lat? · How many? — ile?
Ważne słowo z pytania jest jak latarka: pokazuje, w którym miejscu tekstu leży odpowiedź.
# Sprawdź się
tekst: My room >> My room is small, but I like it. There is a bed and a desk. My cat isn't in the room. It's in the kitchen.
wybierz: True or false? >> The room is big. | *false | true !! W tekście: „My room is small”.
wybierz: Where is the cat? | *in the kitchen | in the room | under the bed !! W tekście: „It's in the kitchen”.
`,
};
