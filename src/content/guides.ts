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

  'b-czasy': `Czas przeszły — to już było: wczoraj, rano, w zeszłym roku. Pisałem, padał.
Czas teraźniejszy — dzieje się teraz: teraz, dziś. Piszę, pada.
Czas przyszły — dopiero będzie: jutro, za tydzień. Napiszę, będę pisać.
Słowa „wczoraj”, „teraz” i „jutro” często podpowiadają czas.
Przykład: Wczoraj padał deszcz, dziś świeci słońce, a jutro będzie ciepło.`,

  'b-osoby': `Czasownik zmienia końcówkę zależnie od tego, kto wykonuje czynność.
Liczba pojedyncza: ja piszę, ty piszesz, on / ona / ono pisze.
Liczba mnoga: my piszemy, wy piszecie, oni / one piszą.
Uważaj na końcówki: przy „ja” często jest „ę” (piszę, robię), przy „oni” — „ą” (piszą, robią).
Przykład: My gramy w piłkę. Oni idą do szkoły.`,

  'b-mnozenie-6-7': `Mnożenie to szybkie dodawanie tych samych liczb: 6 · 3 = 6 + 6 + 6 = 18.
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
Gdy reguła nie pomaga, pisownię trzeba zapamiętać: góra, ogórek, mrówka, żółw.`,

  'b-p5-nie': `„Nie” z czasownikami piszemy osobno: nie wiem, nie lubię, nie poszła.
Wyjątki — razem: nienawidzić, niepokoić się.
„Nie” z rzeczownikami piszemy razem: nieprawda, nieporządek, niepokój.
„Nie” z przymiotnikami w stopniu równym piszemy razem: niemiły, niegroźny, nieciekawy.
Przykład: Nie lubię nieporządku.`,

  'b-p5-odmienne': `Części mowy odmienne zmieniają formę (kot – kota – kotem):
rzeczownik (kto? co?), czasownik (co robi?), przymiotnik (jaki?), liczebnik (ile? który?), zaimek (zastępuje inne słowo: on, my, ten).
Części mowy nieodmienne mają zawsze tę samą formę:
przysłówek (jak? gdzie? kiedy? — szybko, wczoraj), przyimek (na, pod, w, z), spójnik (i, a, ale, lecz), wykrzyknik (ach, hej), partykuła (nie, czy, niech).`,

  'b-p5-podmiot': `Podmiot to wykonawca czynności. Pytamy: kto? co?
Orzeczenie mówi, co robi podmiot albo co się z nim dzieje — najczęściej to czasownik.
Najpierw znajdź orzeczenie, potem zapytaj o podmiot.
Przykład: Mama czyta gazetę. Co robi? Czyta — orzeczenie. Kto czyta? Mama — podmiot.
Podmiot nie zawsze stoi na początku zdania: Na drzewie siedzi wiewiórka.`,

  'b-dyktando-3': `Słuchaj uważnie całego zdania, potem wpisz brakujący wyraz.
Ó: gdy wymienia się na o (król – królowa, miód – miodek). Czasem trzeba zapamiętać: ogórek, mrówka.
Rz: gdy wymienia się na r (morze – morski) i po literach b, p, d, t, g, k, ch, j, w (drzewo, krzesło).
Ż: gdy wymienia się na g (noga – nóżka). Czasem trzeba zapamiętać: żaba, żółty.
Ch i h: najczęściej trzeba zapamiętać (chmura, chleb, herbata, huśtawka).
Podpowiedź pokaże wyraz z ukrytymi trudnymi literami.`,

  'b-p5-dyktando': `Ó: gdy wymienia się na o, e lub a (mróz – mrozy, zachód – zachodu). Czasem trzeba zapamiętać: ołówek, wróbel.
Rz: gdy wymienia się na r (morze – morski) i po spółgłoskach b, p, d, t, g, k, ch, j, w (brzoza, przyjaciel, trzeba, grzyb). Wyjątki: pszczoła, kształt, pszenica.
Ż: gdy wymienia się na g, h, z, s, dz (droga – dróżka). Czasem trzeba zapamiętać: żółw.
Ch: na końcu wyrazu (kożuch, dach; wyjątek: druh). H: najczęściej trzeba zapamiętać (hałas, hulajnoga).
Może (być może) piszemy przez ż, a morze (woda) przez rz.`,
};
