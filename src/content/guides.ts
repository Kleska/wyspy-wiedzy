/*
 * Ściągi do tematów wbudowanych: krótkie wyjaśnienie z przykładami (jak filmik
 * w Squli, tylko do przeczytania albo odsłuchania). Jedna myśl w jednej linii.
 */

export const GUIDES: Record<string, string> = {
  'b-rzeczownik': `Rzeczownik to nazwa osoby, zwierzęcia, rośliny, rzeczy albo zjawiska.
Pytamy o niego: kto? co?
Osoby: mama, lekarz. Zwierzęta: kot, wróbel. Rośliny: róża, dąb. Rzeczy: stół, piłka. Zjawiska: deszcz, burza.
Sposób: dodaj „ten”, „ta” albo „to”. Jeśli powstaje nazwa czegoś (ten kot, ta piłka, to drzewo), to rzeczownik.
Przykład: Kot śpi na kanapie. Kto śpi? Kot. Na czym? Na kanapie.`,

  'b-czasownik': `Czasownik mówi, co ktoś robi albo co się z kimś lub czymś dzieje.
Pytamy: co robi? co się z nim dzieje?
Czynności: biega, pisze, śpiewa. To, co się dzieje: śnieg topnieje, liście spadają.
Sposób: powiedz przed słowem „ja”, „ty” albo „on”: ja piszę, ty piszesz, on pisze. Da się? To czasownik.
Przykład: Mama piecze ciasto. Co robi mama? Piecze.`,

  'b-przymiotnik': `Przymiotnik opisuje, jaki jest ktoś lub coś: kolor, wielkość, smak, charakter.
Pytamy: jaki? jaka? jakie?
Przykłady: czerwony samochód, miękka poduszka, wesołe dziecko.
Przymiotnik zwykle stoi obok rzeczownika i mówi o nim coś więcej.
Przykład: Mały kotek pije ciepłe mleko. Jaki kotek? Mały. Jakie mleko? Ciepłe.`,

  'b-czesci-mowy': `Rzeczownik — kto? co? (kot, szkoła, mama)
Czasownik — co robi? co się dzieje? (biega, czyta, pada)
Przymiotnik — jaki? jaka? jakie? (duży, zielona, słodkie)
Zadaj pytanie do słowa — pytanie podpowie, jaka to część mowy.
Przykład: Duży pies szczeka. Duży — jaki? Przymiotnik. Pies — kto? Rzeczownik. Szczeka — co robi? Czasownik.`,

  'b-czasy': `Czas przeszły — to już było: wczoraj, przedwczoraj, w zeszłym roku. Pisałem, padał.
Czas teraźniejszy — dzieje się teraz: teraz, w tej chwili. Piszę, pada.
Czas przyszły — dopiero będzie: jutro, za tydzień. Napiszę, będę pisać.
Słowa „wczoraj”, „teraz” i „jutro” często podpowiadają czas.
Przykład: Wczoraj padał deszcz, dziś świeci słońce, a jutro będzie ciepło.`,

  'b-osoby': `Czasownik zmienia końcówkę zależnie od tego, kto wykonuje czynność.
Liczba pojedyncza: ja piszę, ty piszesz, on / ona / ono pisze.
Liczba mnoga: my piszemy, wy piszecie, oni / one piszą.
Uważaj na końcówki: przy „ja” często jest „ę” (piszę, robię), przy „oni” — „ą” (piszą, robią).
Przykład: My gramy w piłkę. Oni idą do szkoły.`,

  'b-mnozenie-6-7': `Mnożenie to szybkie dodawanie tych samych liczb: 3 · 6 = 6 + 6 + 6 = 18.
Kolejność nie zmienia wyniku: 6 · 7 = 7 · 6 = 42.
Sposób: 6 · 8 = 5 · 8 + 8 = 40 + 8 = 48.
Sposób: 7 · 8 = 7 · 4 + 7 · 4 = 28 + 28 = 56.
Warto zapamiętać: 6 · 6 = 36, 6 · 7 = 42, 7 · 7 = 49, 7 · 8 = 56.`,

  'b-m3-dodawanie': `Dodajemy w dwóch krokach: najpierw dziesiątki, potem jedności.
47 + 28 = 47 + 20 + 8 = 67 + 8 = 75.
Odejmujemy tak samo: 82 − 37 = 82 − 30 − 7 = 52 − 7 = 45.
Sprawdź wynik działaniem odwrotnym: 45 + 37 = 82.`,

  'b-m3-mnozenie-8-9': `Mnożenie przez 8: podwój liczbę trzy razy. 8 · 7: 7 → 14 → 28 → 56.
Albo: 8 · 7 = 4 · 7 + 4 · 7 = 28 + 28 = 56.
Mnożenie przez 9: pomnóż przez 10 i odejmij tę liczbę. 9 · 7 = 70 − 7 = 63.
Sztuczka: w wynikach od 9 · 2 do 9 · 10 suma cyfr wynosi 9: 18, 27, 36, 45, 54, 63, 72, 81, 90.`,

  'b-m3-dzielenie': `Dzielenie to odwrotność mnożenia.
42 : 6 = 7, bo 7 · 6 = 42.
Zapytaj: przez ile pomnożyć 6, żeby wyszło 42?
Dzielenie po równo: 24 cukierki dla 4 dzieci → 24 : 4 = 6 cukierków dla każdego.`,

  'b-m3-zadania': `1. Przeczytaj zadanie dwa razy.
2. Znajdź liczby i zastanów się, o co pyta zadanie.
3. Wybierz działanie: razem, dostał, dokupił → dodawanie; wydał, zjadł, zostało → odejmowanie; po tyle samo, kilka razy więcej → mnożenie; po równo, podzielił → dzielenie.
4. Oblicz i sprawdź, czy wynik ma sens.
Przykład: Ola miała 35 zł i wydała 18 zł. Ile jej zostało? 35 − 18 = 17 zł.`,

  'b-m5-dzp-bez': `Dzielenie pisemne zaczynamy od lewej strony — od pierwszej cyfry.
W każdym kroku robimy to samo: dzielę, mnożę, odejmuję, spisuję następną cyfrę.
Jeśli pierwsza cyfra jest mniejsza od dzielnika, bierzemy od razu dwie cyfry: w 156 : 3 zaczynamy od 15.
Reszta po odjęciu musi być mniejsza od dzielnika. Jeśli nie jest, cyfra w wyniku jest za mała.
słupek: 936 : 4
Gdy po spisaniu cyfry liczba jest mniejsza od dzielnika, piszemy 0 w wyniku i spisujemy następną cyfrę: 824 : 4 = 206.
Sprawdzenie: wynik razy dzielnik daje dzielną. 234 · 4 = 936.`,

  'b-m5-dzp-reszta': `Dzielimy jak zwykle: dzielę, mnożę, odejmuję, spisuję następną cyfrę.
Jeśli po ostatnim kroku coś zostaje, to jest to reszta. Zapisujemy ją po literze r: 587 : 4 = 146 r 3.
słupek: 587 : 4
Reszta jest zawsze mniejsza od dzielnika. Jeśli wyszła większa, cyfra w wyniku jest za mała.
Sprawdzenie: wynik razy dzielnik plus reszta daje dzielną. 146 · 4 + 3 = 587.`,

  'b-m5-ulamki': `W ułamku licznik (na górze) mówi, ile części bierzemy, a mianownik (na dole) — na ile równych części dzielimy całość.
Skracanie: dzielimy licznik i mianownik przez tę samą liczbę. 6/8 = 3/4 (dzielimy przez 2).
Rozszerzanie: mnożymy licznik i mianownik przez tę samą liczbę. 2/3 = 8/12 (mnożymy przez 4).
Wartość ułamka się nie zmienia — zmienia się tylko zapis.
Ułamek jest nieskracalny, gdy licznik i mianownik nie mają wspólnego dzielnika większego od 1.`,

  'b-m5-ulamki-dzialania': `Te same mianowniki: dodajemy lub odejmujemy tylko liczniki. 2/7 + 3/7 = 5/7.
Mianowników nie dodajemy! 1/2 + 1/2 = 2/2 = 1.
Różne mianowniki: najpierw sprowadzamy ułamki do wspólnego mianownika.
1/2 + 1/4 = 2/4 + 1/4 = 3/4.
Na końcu skróć wynik, jeśli się da: 4/6 = 2/3.`,

  'b-m5-dziesietne': `Dodając i odejmując, piszemy liczby przecinek pod przecinkiem.
2,5 + 1,25 = 3,75. Brakujące miejsca możesz uzupełnić zerem: 2,5 = 2,50.
Mnożenie przez 10, 100, 1000: przecinek w prawo o 1, 2, 3 miejsca. 3,47 · 10 = 34,7.
Dzielenie przez 10, 100, 1000: przecinek w lewo. 52,6 : 10 = 5,26.
Porównywanie: dopisz zera, żeby obie liczby miały tyle samo cyfr po przecinku. 0,7 = 0,70, a 0,70 > 0,65.`,

  'b-m5-pole-obwod': `Obwód to długość brzegu figury — dodajemy długości wszystkich boków.
Prostokąt: obwód = 2 · a + 2 · b, pole = a · b.
Kwadrat: obwód = 4 · a, pole = a · a.
Pole podajemy w jednostkach kwadratowych: cm², m².
Przykład: prostokąt 4 cm na 7 cm ma pole 28 cm² i obwód 22 cm.`,

  'b-m5-kolejnosc': `1. Najpierw działania w nawiasach.
2. Potem mnożenie i dzielenie — od lewej do prawej.
3. Na końcu dodawanie i odejmowanie — od lewej do prawej.
Przykład: 2 + 3 · 4 = 2 + 12 = 14, ale (2 + 3) · 4 = 5 · 4 = 20.
Przykład: 20 − 12 : 4 = 20 − 3 = 17.`,

  'b-m5-podzielnosc': `Przez 2 — ostatnia cyfra jest parzysta: 0, 2, 4, 6, 8 (np. 46).
Przez 5 — ostatnia cyfra to 0 lub 5 (np. 35, 60).
Przez 10 — ostatnia cyfra to 0 (np. 70).
Przez 3 — suma cyfr dzieli się przez 3. 123: 1 + 2 + 3 = 6, więc 123 dzieli się przez 3.
Przez 9 — suma cyfr dzieli się przez 9. 738: 7 + 3 + 8 = 18, więc 738 dzieli się przez 9.`,

  'b-p5-przypadki': `Rzeczownik odmienia się przez przypadki. Pytania pomagają rozpoznać przypadek:
Mianownik — kto? co? — kot
Dopełniacz — (nie ma) kogo? czego? — kota
Celownik — (przyglądam się) komu? czemu? — kotu
Biernik — (widzę) kogo? co? — kota
Narzędnik — (idę) z kim? z czym? — z kotem
Miejscownik — (mówię) o kim? o czym? — o kocie
Wołacz — o! (gdy zwracamy się do kogoś) — kocie!`,

  'b-p5-stopniowanie': `Stopniujemy przymiotniki, gdy porównujemy cechy.
Regularnie: miły – milszy – najmilszy, ładny – ładniejszy – najładniejszy.
Nieregularnie (trzeba zapamiętać): dobry – lepszy – najlepszy, zły – gorszy – najgorszy, mały – mniejszy – najmniejszy, duży – większy – największy.
Opisowo: zmęczony – bardziej zmęczony – najbardziej zmęczony.
Stopień najwyższy zaczyna się od „naj-”.`,

  'b-p5-o-u': `Ó piszemy, gdy w innej formie wyrazu albo w wyrazie pokrewnym jest o, e lub a: wóz – wozy, siódmy – siedem, skrót – skracać.
Ó piszemy też w zakończeniach -ów, -ówka, -ówna: domów, pocztówka.
U piszemy na początku wyrazu (ulica, ucho; wyjątki: ósmy, ósemka) i w zakończeniach -uje, -unek, -uszek, -utki: kupuje, rysunek, kwiatuszek, malutki.
Gdy reguła nie pomaga, pisownię trzeba zapamiętać: góra, ogórek, córka, żółw.`,

  'b-p5-nie': `„Nie” z czasownikami piszemy osobno: nie wiem, nie lubię, nie poszła.
Wyjątki — razem: nienawidzić, niepokoić się.
„Nie” z rzeczownikami piszemy razem: nieprawda, nieporządek, niepokój.
„Nie” z przymiotnikami piszemy razem: niemiły, niegroźny, nieciekawy. Od 2026 roku także w stopniu wyższym i najwyższym: nielepszy, nienajlepszy.
Przykład: Nie lubię nieporządku.`,

  'b-p5-odmienne': `Części mowy odmienne zmieniają formę (kot – kota – kotem):
rzeczownik (kto? co?), czasownik (co robi?), przymiotnik (jaki?), liczebnik (ile? który?), zaimek (zastępuje inne słowo: on, my, ten).
Części mowy nieodmienne nie odmieniają się przez przypadki, liczby ani osoby (przysłówek można tylko stopniować: szybko – szybciej):
przysłówek (jak? gdzie? kiedy? — szybko, wczoraj), przyimek (na, pod, w, z), spójnik (i, a, ale, lecz), wykrzyknik (ach, hej), partykuła (nie, czy, niech).`,

  'b-p5-podmiot': `Podmiot to wykonawca czynności. Pytamy: kto? co?
Orzeczenie mówi, co robi podmiot albo co się z nim dzieje — najczęściej to czasownik.
Najpierw znajdź orzeczenie, potem zapytaj o podmiot.
Przykład: Mama czyta gazetę. Co robi? Czyta — orzeczenie. Kto czyta? Mama — podmiot.
Podmiot nie zawsze stoi na początku zdania: Na drzewie siedzi wiewiórka.`,

  'b-czytanie-3': `Najpierw uważnie przeczytaj cały tekst. Możesz go też odsłuchać.
Potem przeczytaj pytanie i poszukaj odpowiedzi w tekście.
Odpowiedzi na pytania „kto?”, „gdzie?”, „kiedy?” są w tekście — znajdź właściwe zdanie.
Prawda czy fałsz? Porównaj zdanie z tym, co jest napisane w tekście.
Tekst jest nad pytaniem — możesz do niego wracać, ile razy chcesz.`,

  'b-p5-czytanie': `Przeczytaj cały tekst, zanim zaczniesz odpowiadać.
Szczegóły (kto, gdzie, kiedy, ile) znajdziesz w tekście — wróć do właściwego akapitu.
Główna myśl to najważniejsza informacja całego tekstu, a nie jeden szczegół.
Tekst informacyjny podaje wiadomości (fakty, liczby, daty). Opowiadanie przedstawia wydarzenia z udziałem bohaterów.
Pytanie „czego uczy tekst?” dotyczy przesłania — pomyśl, co zrozumiał bohater.`,

  'b-dyktando-3': `Słuchaj uważnie całego zdania, potem wpisz brakujący wyraz.
Ó: gdy wymienia się na o (król – królowa, miód – miodu, mrówka – mrowisko). Czasem trzeba zapamiętać: ogórek, góra.
Rz: gdy wymienia się na r (morze – morski) i po literach b, p, d, t, g, k, ch, j, w (drzewo, krzesło). Są wyjątki, np. pszczoła, wszystko.
Ż: gdy wymienia się na g (noga – nóżka). Czasem trzeba zapamiętać: żaba, żółty.
Ch i h: najczęściej trzeba zapamiętać (chmura, chleb, herbata, huśtawka).
Podpowiedź pokaże wyraz z ukrytymi trudnymi literami.`,

  'b-p5-dyktando': `Ó: gdy wymienia się na o, e lub a (mróz – mrozy, zachód – zachodu, ołówek – ołowiany). Czasem trzeba zapamiętać: wróbel, córka.
Rz: gdy wymienia się na r (morze – morski) i po spółgłoskach b, p, d, t, g, k, ch, j, w (brzoza, przyjaciel, trzeba, grzyb). Wyjątki: pszczoła, pszenica, kształt, wszystko oraz stopień wyższy przymiotników (lepszy, młodszy).
Ż: gdy wymienia się na g, h, z, s, dz (droga – dróżka). Czasem trzeba zapamiętać: żółw.
Ch: na końcu wyrazu (kożuch, dach; wyjątek: druh). H: najczęściej trzeba zapamiętać (hałas, hulajnoga).
„Może” (być może) piszemy przez ż, a „morze” (woda) przez rz.`,

  // ─── Angielski, klasa 5 (Unit 0) ───────────────────────────────────────────

  'b-a5-u0-be': `Czasownik „to be” znaczy „być”. W czasie teraźniejszym ma trzy formy: am, is, are.
I am (I'm) · you are (you're) · he is (he's), she is (she's), it is (it's) · we are (we're) · they are (they're).
Przeczenie: I'm not · he, she, it isn't · you, we, they aren't.
Pytanie: „to be” przechodzi na początek. You are Polish. → Are you Polish?
Krótkie odpowiedzi: Yes, I am. No, I'm not. · Yes, he is. No, he isn't. · Yes, they are. No, they aren't.
Uwaga: w krótkiej odpowiedzi na „tak” nie skracamy. Mówimy „Yes, he is”, a nie „Yes, he's”.
Uwaga: wiek podajemy po angielsku z „to be”. I'm eleven. — Mam jedenaście lat.
Przykład: Ola is from Poland. She isn't from Spain. Is she Polish? Yes, she is.`,

  'b-a5-u0-kraje': `Kraj i narodowość to dwa różne słowa: Poland (Polska) — Polish (polski; Polak, Polka).
Po „from” stoi nazwa kraju: I'm from Poland. Narodowość stoi od razu po am, is, are: I'm Polish.
Nazwy krajów i narodowości piszemy po angielsku zawsze wielką literą.
Argentina – Argentinian · China – Chinese · France – French · Germany – German · Italy – Italian.
Poland – Polish · Spain – Spanish · Turkey – Turkish · the UK – British · the USA – American.
Uwaga: przed „UK” i „USA” stoi „the”: I'm from the UK.
Przykład: Marco is from Italy. He's Italian. It's the Italian flag.`,

  'b-a5-u0-miesiace': `Miesiące po kolei: January, February, March, April, May, June, July, August, September, October, November, December.
Nazwy miesięcy piszemy po angielsku wielką literą.
Przed nazwą miesiąca stoi „in”: in May (w maju), in October (w październiku).
Uwaga: June to czerwiec, a July to lipiec — łatwo je pomylić.
Uwaga: w słowie February jest „r” w środku: Feb-ru-ary.
Sposób: cztery ostatnie miesiące kończą się na -ber: September, October, November, December.
Przykład: When's your birthday? It's in August.`,

  'b-a5-u0-havegot': `„Have got” znaczy „mieć”.
I, you, we, they have got (I've got) · he, she, it has got (he's got).
Przeczenie: I, you, we, they haven't got · he, she, it hasn't got.
Pytanie: Have you got a dog? Has she got a cat?
Krótkie odpowiedzi: Yes, I have. No, I haven't. · Yes, she has. No, she hasn't.
Uwaga: „he's got” to „he has got”, a samo „he's” to „he is”.
Przykład: I've got a brother, but I haven't got a sister. My brother has got a hamster.`,

  'b-a5-u0-can': `„Can” znaczy „umieć, potrafić”.
Forma jest taka sama dla każdej osoby: I can, you can, he can, she can, we can, they can.
Po „can” stoi czasownik w formie podstawowej — bez „to” i bez końcówki -s: She can swim.
Przeczenie: can't. I can't sing.
Pytanie: Can you cook? Krótkie odpowiedzi: Yes, I can. No, I can't.
Czynności: cook, draw, run, sing, swim, skateboard, play football, play the guitar, ride a bike, speak Spanish.
Przykład: My dad can cook, but he can't play the guitar.`,

  'b-a5-u0-there': `„There is” (there's) mówi, że gdzieś jest jedna rzecz: There's a desk in my room.
„There are” mówi, że gdzieś są dwie rzeczy lub więcej: There are two chairs in the kitchen.
Przeczenie: There isn't a TV. There aren't any books.
Pytanie: Is there a sofa? Are there any shelves? Krótkie odpowiedzi: Yes, there is. No, there isn't. · Yes, there are. No, there aren't.
Przyimki miejsca: in (w), on (na), under (pod), next to (obok).
Dom: armchair, bath, bed, chair, desk, fridge, shelves, shower, sofa, table, wardrobe.
Przykład: There's a bed next to the door and there are some books on the desk.`,

  'b-a5-u0-this': `Blisko: this (jedna rzecz), these (kilka rzeczy). Daleko: that (jedna rzecz), those (kilka rzeczy).
What's this? It's a coat. · What are these? They're trainers.
What's that? It's a hat. · What are those? They're jeans.
Z „this” i „that” łączy się „is”, a z „these” i „those” — „are”: This is my hat. These are my shoes.
Uwaga: jeans i trousers to zawsze liczba mnoga — tak jak polskie „spodnie”: These jeans are new. O butach (shoes, trainers) też zwykle mówimy w liczbie mnogiej.
Uwaga: po angielsku przymiotnik nie zmienia się w liczbie mnogiej. It's a red hat. They're red hats.
Ubrania: coat, dress, hat, hoodie, jacket, jeans, jumper, shoes, skirt, T-shirt, trainers, trousers.`,

  'b-a5-u0-poss': `Zaimki dzierżawcze mówią, czyje coś jest: I → my, you → your, he → his, she → her, it → its, we → our, they → their.
Zaimek stoi przed rzeczownikiem: my bike, her name, their house.
Końcówka 's po imieniu albo nazwie osoby też pokazuje, czyje coś jest: Ola's bike — rower Oli, my dad's guitar — gitara mojego taty.
Przykład: It's Adam's room. = It's his room.
Uwaga: „its” (bez apostrofu) znaczy „jego, jej”, a „it's” to skrót od „it is” (albo „it has”).
Po angielsku przymiotnik stoi przed rzeczownikiem i nie zmienia się w liczbie mnogiej: a new hat, two new hats.
„Very” (bardzo) stoi przed przymiotnikiem: My bike is very old.
Przymiotniki: big, clever, friendly, funny, helpful, new, old, pretty, small, sporty.`,

  'b-a5-u0-czytanie': `Najpierw przeczytaj cały tekst — nie musisz rozumieć każdego słowa.
Potem przeczytaj pytanie i znajdź w tekście zdanie, które na nie odpowiada.
True znaczy „prawda”, a false — „fałsz”.
Pytania: Who? — kto? · What? — co? · Where? — gdzie? · When? — kiedy? · How old? — ile lat? · How many? — ile?
Sposób: nie znasz słowa? Rozwiń „Słówka z tekstu” pod tekstem albo stuknij „Podpowiedź”.`,
};
