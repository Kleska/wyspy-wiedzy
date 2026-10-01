import type { Topic } from '../types';
import { builtin } from './util';

/*
 * Czytanie ze zrozumieniem. Linia „tekst: Tytuł >> treść” wprowadza tekst, a pytania pod nią
 * go dotyczą. Odpowiedzi muszą wynikać wprost z tekstu (albo z jego głównej myśli).
 * „ // ” w treści oddziela akapity.
 */

export const READING_GRADE3: Topic = builtin(
  'b-czytanie-3',
  'pl',
  80,
  'Czytanie ze zrozumieniem',
  'Najpierw przeczytaj cały tekst. Odpowiedzi szukaj w tekście — możesz go czytać, ile razy chcesz.',
  `
tekst: Nowy kolega >> Do klasy Tomka przyszedł nowy uczeń. Miał na imię Adam i przyjechał z Gdańska. Na pierwszej przerwie stał sam przy oknie. // Tomek podszedł do niego i zapytał, czy lubi grać w piłkę. Adam uśmiechnął się i powiedział, że najbardziej lubi stać na bramce. Po lekcjach chłopcy poszli razem na boisko. Od tego dnia codziennie wracali ze szkoły razem.
wybierz: Skąd przyjechał Adam? | *z Gdańska | z Krakowa | z Warszawy !! W tekście: „przyjechał z Gdańska”.
wybierz: Gdzie stał Adam na pierwszej przerwie? | *przy oknie | przy drzwiach | na boisku !! W tekście: „stał sam przy oknie”.
wybierz: O co Tomek zapytał Adama? | *czy lubi grać w piłkę | jak ma na imię | gdzie mieszka !! Tomek zapytał, czy Adam lubi grać w piłkę.
wybierz: Na jakiej pozycji Adam najbardziej lubi grać? | *na bramce | w ataku | w obronie !! Adam powiedział, że najbardziej lubi stać na bramce.
wybierz: Prawda czy fałsz? Na pierwszej przerwie Adam bawił się z całą klasą. | *fałsz | prawda !! To fałsz — Adam stał sam przy oknie.
wpisz: Uzupełnij zdanie z tekstu. >> Po lekcjach chłopcy poszli razem na [boisko]. !! Zdanie z tekstu: „Po lekcjach chłopcy poszli razem na boisko”.
wybierz: Jak zachował się Tomek? | *Był życzliwy dla nowego kolegi. | Śmiał się z nowego kolegi. | Nie zauważył nowego kolegi. !! Tomek sam podszedł do Adama i zapytał go o grę w piłkę.
tekst: Jeż w ogrodzie >> Pewnego jesiennego wieczoru Zosia zobaczyła w ogrodzie jeża. Zwierzątko szukało jedzenia pod krzakiem porzeczek. Zosia pobiegła po tatę. // Tata powiedział, że jeże jedzą ślimaki, dżdżownice i owady, a mleko im szkodzi. Postawili więc przy krzaku miseczkę z wodą. Następnego ranka miseczka była pusta, a na trawie widać było małe ślady łapek. // Zosia postanowiła, że zostawi jeżowi stos liści, w którym będzie mógł przespać zimę.
wybierz: Kiedy Zosia zobaczyła jeża? | *jesiennym wieczorem | wiosennym rankiem | zimowym popołudniem !! W tekście: „pewnego jesiennego wieczoru”.
wybierz: Gdzie jeż szukał jedzenia? | *pod krzakiem porzeczek | pod jabłonią | przy furtce !! Jeż szukał jedzenia pod krzakiem porzeczek.
wybierz: Co jedzą jeże według taty? | *ślimaki, dżdżownice i owady | mleko i chleb | jabłka i gruszki !! Tata powiedział, że jeże jedzą ślimaki, dżdżownice i owady.
wybierz: Prawda czy fałsz? Jeżom można dawać mleko. | *fałsz | prawda !! To fałsz — tata powiedział, że mleko szkodzi jeżom.
wybierz: Co Zosia i tata postawili przy krzaku? | *miseczkę z wodą | miseczkę z mlekiem | domek dla jeża !! Postawili miseczkę z wodą.
wybierz: Jak wyglądała miseczka następnego ranka? | *była pusta | była pełna | była przewrócona !! W tekście: „następnego ranka miseczka była pusta”.
wpisz: Uzupełnij zdanie z tekstu. >> Na trawie widać było małe ślady [łapek]. !! Zdanie z tekstu: „na trawie widać było małe ślady łapek”.
wybierz: Po co Zosia zostawi jeżowi stos liści? | *żeby mógł w nim przespać zimę | żeby miał co jeść | żeby się w nim bawił !! Jeż przesypia zimę, a stos liści będzie jego schronieniem.
`,
  [3],
);

export const READING_GRADE5: Topic = builtin(
  'b-p5-czytanie',
  'pl',
  80,
  'Czytanie ze zrozumieniem',
  'Przeczytaj cały tekst. Szczegółów szukaj w tekście, a główną myśl ustal po przeczytaniu całości.',
  `
tekst: Białe złoto z Wieliczki >> Kopalnia soli w Wieliczce koło Krakowa jest jedną z najstarszych kopalń soli w Europie. Sól wydobywano tu przez ponad siedemset lat. Dawniej była tak cenna, że nazywano ją białym złotem. // Dziś kopalnię odwiedzają co roku tłumy turystów. Trasa zwiedzania prowadzi najpierw w dół po drewnianych schodach, a potem korytarzami i komorami wykutymi w soli. Najsłynniejsza jest kaplica świętej Kingi, w której z soli wykonano nawet żyrandole. // W 1978 roku kopalnię wpisano na pierwszą listę światowego dziedzictwa UNESCO.
wybierz: Gdzie leży Wieliczka? | *koło Krakowa | koło Gdańska | koło Poznania !! W tekście: „w Wieliczce koło Krakowa”.
wybierz: Jak dawniej nazywano sól? | *białym złotem | białym srebrem | solnym skarbem !! Sól była tak cenna, że nazywano ją białym złotem.
wybierz: Przez ile lat wydobywano sól w Wieliczce? | *przez ponad siedemset lat | przez około sto lat | przez ponad dwa tysiące lat !! W tekście: „przez ponad siedemset lat”.
wybierz: Co w kaplicy świętej Kingi wykonano z soli? | *żyrandole | drewniane ławki | szklane okna !! W tekście: „z soli wykonano nawet żyrandole”.
wpisz: Uzupełnij zdanie z tekstu. >> Kopalnię wpisano na listę UNESCO w [1978] roku. !! Ostatnie zdanie tekstu podaje ten rok.
wybierz: Prawda czy fałsz? Trasa zwiedzania prowadzi najpierw w dół po drewnianych schodach. | *prawda | fałsz !! To prawda — tak jest napisane w drugim akapicie.
wybierz: Jaki to rodzaj tekstu? | *tekst informacyjny | baśń | opowiadanie !! Tekst podaje fakty: miejsce, liczby i datę, więc jest informacyjny.
wybierz: Które zdanie najlepiej oddaje główną myśl tekstu? | *Kopalnia w Wieliczce to zabytek o długiej historii. | Sól jest smaczna. | W Krakowie jest dużo turystów. !! Cały tekst opowiada o historii i zabytkach kopalni.
tekst: Srebrny medal >> Marta trenowała pływanie od trzech lat. Przed zawodami szkolnymi bardzo się denerwowała, bo rok wcześniej zajęła dopiero piąte miejsce. Trener powiedział jej, żeby nie patrzyła na innych, tylko płynęła swoim tempem. // Gdy rozległ się gwizdek, Marta skoczyła do wody. Na ostatnich metrach poczuła, że brakuje jej sił, ale przypomniała sobie słowa trenera. Dotknęła ściany basenu jako druga. // Na podium uśmiechała się szeroko. Wiedziała, że srebrny medal jest nagrodą za miesiące ciężkiej pracy.
wybierz: Od ilu lat Marta trenowała pływanie? | *od trzech lat | od roku | od pięciu lat !! W tekście: „trenowała pływanie od trzech lat”.
wybierz: Dlaczego Marta denerwowała się przed zawodami? | *bo rok wcześniej zajęła piąte miejsce | bo nie umiała pływać | bo zgubiła czepek !! Rok wcześniej zajęła dopiero piąte miejsce.
wybierz: Jaką radę dał jej trener? | *żeby płynęła swoim tempem i nie patrzyła na innych | żeby od startu płynęła najszybciej, jak umie | żeby zrezygnowała z zawodów !! Trener radził jej płynąć swoim tempem.
wybierz: Które miejsce zajęła Marta w tych zawodach? | *drugie | pierwsze | piąte !! Dotknęła ściany basenu jako druga.
wpisz: Uzupełnij zdanie. >> Marta zdobyła [srebrny] medal. !! W tekście: „srebrny medal jest nagrodą”.
wybierz: Jak czuła się Marta na podium? | *szczęśliwa i dumna | smutna | zła na trenera !! Uśmiechała się szeroko i wiedziała, że medal jest nagrodą za jej pracę.
wybierz: Prawda czy fałsz? Na ostatnich metrach Marcie zaczęło brakować sił. | *prawda | fałsz !! To prawda — poczuła, że brakuje jej sił.
wybierz: Czego uczy ten tekst? | *Wytrwała praca i wiara w siebie przynoszą efekty. | Zawody nie mają sensu. | Trener zawsze wygrywa za zawodnika. !! Marta ciężko trenowała i nie poddała się na ostatnich metrach.
`,
  [5],
);
