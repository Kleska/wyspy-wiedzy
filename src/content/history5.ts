import type { Topic } from '../types';
import { builtin } from './util';

/*
 * Historia — klasa 5. Treść według podręcznika „Wczoraj i dziś 5” (Nowa Era), rozdział I „Pierwsze cywilizacje”
 * (skan przysłany przez rodzica). Każdy temat podręcznika to jeden temat w aplikacji; na końcu rozdziału — powtórka
 * dat i pojęć. Ściąga i lekcja stoją przy temacie (jak w lekturach).
 *
 * Zasady pisania:
 * - Fakty, daty i definicje bierzemy z podręcznika (ramki „To już wiem”, osie czasu, słowniczki na marginesie).
 *   Gdy podręcznik podaje coś wątpliwego (np. liczbę liter alfabetu polskiego), nie pytamy o to.
 * - Daty jak w podręczniku: „około 3000 lat p.n.e.”, „XVIII wiek p.n.e.”; wieki cyframi rzymskimi.
 * - `description` jest też podpowiedzią w ćwiczeniu, więc nie zdradza odpowiedzi.
 * - Kolejność wydarzeń ćwiczy zadanie „pary” z numerami po lewej (ekran daje wąską kolumnę numerów).
 * - Każde zadanie mieści się na telefonie 360×740 także w sprawdzianie: krótkie polecenia i odpowiedzi.
 * - Nowy rozdział: osobna stała z nazwą rozdziału, id `b-h5-r<numer>-…`, `order` z kolejnej setki (rozdział I: 10–99).
 */

const R1 = 'Pierwsze cywilizacje';

function lekcja(id: string, order: number, title: string, description: string, dsl: string, guide: string, lesson: string): Topic {
  return { ...builtin(id, 'his', order, title, description, dsl, [5]), unit: R1, guide: guide.trim(), lesson: lesson.trim() };
}

// ─── 1. Życie pierwszych ludzi ────────────────────────────────────────────────

const LUDZIE = lekcja(
  'b-h5-r1-ludzie',
  10,
  'Życie pierwszych ludzi',
  'Jak żyli najdawniejsi ludzie: od zbieraczy i myśliwych do pierwszych rolników. Przypomnij sobie, co zmieniło się w ich życiu i dlaczego.',
  `
wybierz: Gdzie żyli najdawniejsi przodkowie człowieka? | *w Afryce | w Europie | w Azji | w Australii !! Praludzie żyli w Afryce około 4 milionów lat temu. Dopiero później ludzie rozeszli się po świecie.
wybierz: Kiedy żyli najdawniejsi przodkowie człowieka? | *około 4 milionów lat temu | około 10 tysięcy lat temu | około 3000 lat p.n.e. | około 1200 lat p.n.e. !! Praludzie żyli w Afryce około 4 milionów lat temu.
wybierz: Kiedy pojawił się człowiek rozumny? | *około 200 tysięcy lat temu | około 4 milionów lat temu | około 10 tysięcy lat p.n.e. | około 1200 lat p.n.e. !! Człowiek rozumny (po łacinie Homo sapiens) pojawił się około 200 tysięcy lat temu.
pary: Połącz przodka człowieka z czasem, gdy żył. >> australopitek = 4 miliony lat temu ; człowiek zręczny = 2,5 miliona lat temu ; człowiek wyprostowany = 1,9 miliona lat temu ; człowiek rozumny = 200 tysięcy lat temu !! Najstarszy jest australopitek, a najmłodszy — człowiek rozumny, czyli my.
wybierz: Jakie korzyści dało ludziom używanie ognia? | *ciepło, pieczone mięso i ochronę przed zwierzętami | możliwość wytapiania żelaza | pismo i liczenie | uprawę zbóż !! Ogień grzał, pozwalał upiec mięso i odstraszał dzikie zwierzęta. Dzięki niemu ludzie mogli żyć w chłodniejszych krainach.
wybierz: Dlaczego ważna była umiejętność mówienia? | *ludzie mogli szybko wymieniać informacje | ludzie mogli zapisywać prawa | ludzie przestali polować | ludzie zaczęli wytapiać metale !! Mowa pozwalała szybciej się porozumiewać i przekazywać doświadczenia kolejnym pokoleniom.
wybierz: Czym zajmowali się ludzie, zanim pojawiło się rolnictwo? | *zbieractwem i myślistwem | uprawą zbóż | handlem | rzemiosłem w miastach !! Najdawniejsi ludzie jedli to, co udało im się zebrać albo upolować.
wybierz: Jak nazywamy wędrowny tryb życia? | *koczowniczy | osiadły | rolniczy | miejski !! Ludzie wędrowali w poszukiwaniu pożywienia, dlatego mieszkali w szałasach albo jaskiniach.
wybierz: Co to jest pięściak? | *kamienne narzędzie dopasowane do dłoni | broń z brązu | gliniany garnek | rodzaj chaty !! Pięściak miał ostre krawędzie. Najstarsze znane pięściaki mają około 1,5 miliona lat.
wybierz: Kiedy narodziło się rolnictwo? | *około 10 tysięcy lat p.n.e. | około 200 tysięcy lat temu | około 3000 lat p.n.e. | około 1200 lat p.n.e. !! Ludzie zauważyli, że z ziaren dzikich zbóż wyrastają nowe rośliny, i nauczyli się je siać.
wybierz: Na czym polegała rewolucja neolityczna? | *ludzie zaczęli uprawiać ziemię i osiedli na stałe | ludzie nauczyli się rozpalać ogień | ludzie wynaleźli pismo | ludzie zaczęli wytapiać żelazo !! Rewolucja neolityczna to przejście z koczowniczego na osiadły tryb życia dzięki rolnictwu i hodowli.
wpisz: Uzupełnij. >> Dzięki rolnictwu ludzie zamienili koczowniczy tryb życia na [osiadły]. !! Rolnicy musieli mieszkać przy swoich polach, więc osiedli na stałe.
wybierz: Gdzie najczęściej powstawały pierwsze osady? | *nad jeziorami i rzekami | na szczytach gór | na pustyniach | w głębi lasów !! Przy wodzie łatwiej było uprawiać pola i hodować zwierzęta.
wybierz: Jakie zwierzęta ludzie oswoili około 9–10 tysięcy lat temu? | *owce, kozy i świnie | lwy i tygrysy | słonie i żyrafy | wilki i niedźwiedzie !! Początki rolnictwa wiążą się z hodowlą: ludzie oswoili między innymi owce, kozy i świnie.
wybierz: Czym były ziemianki? | *chatami częściowo wykopanymi w ziemi | kamiennymi zamkami | namiotami ze skór | domami z cegły !! Ziemianki budowano z drewna i gliny, a dachy kryto słomą albo trzciną.
wybierz: Do czego służyły żarna? | *do mielenia ziarna na mąkę | do wytapiania żelaza | do polowania | do rozpalania ognia !! Ziarno rozcierano między dwoma kamieniami. Z mąki i wody robiono placki.
sortuj: Koczowniczy czy osiadły tryb życia? >> koczowniczy = polowanie, zbieractwo, szałasy ; osiadły = uprawa zbóż, hodowla, ziemianki, żarna !! Koczownicy polowali i zbierali, a rolnicy uprawiali pola, hodowali zwierzęta i budowali stałe domy.
wybierz: Skąd pochodzą nazwy epok kamienia, brązu i żelaza? | *od materiału, z którego robiono narzędzia | od imion władców | od nazw rzek | od pór roku !! Każda epoka nosi nazwę materiału, z którego wtedy robiono narzędzia i broń.
wybierz: Z czego powstaje brąz? | *z miedzi i cyny | z żelaza i węgla | z gliny i piasku | ze złota i srebra !! Miedź jest miękka. Po dodaniu cyny powstaje twardszy stop — brąz.
pary: Ułóż epoki w kolejności: połącz numer z epoką. >> 1 = epoka kamienia ; 2 = epoka brązu ; 3 = epoka żelaza !! Najpierw kamień, potem brąz, a na końcu żelazo — każdy następny materiał był trwalszy.
wybierz: Kiedy zaczęła się epoka żelaza? | *około 1200 lat p.n.e. | około 10 tysięcy lat p.n.e. | około 4 milionów lat temu | w XX wieku !! Epoka żelaza zaczęła się około 1200 lat p.n.e. i trwa do dziś.
wybierz: Dlaczego żelazo zastąpiło brąz? | *bo jest bardziej wytrzymałe | bo jest bardziej miękkie | bo łatwiej się tępi | bo jest rzadsze od złota !! Z żelaza robiono mocniejsze siekiery, ostrza włóczni i haczyki na ryby.
wybierz: W jakich piecach dawniej wytapiano żelazo? | *w dymarkach | w hutach | w żarnach | w zikkuratach !! Dymarki budowano z kamienia i gliny. Po wytopie piec rozbijano, żeby wyjąć bryłę żelaza. Huty to dzisiejsze zakłady.
wpisz: Uzupełnij nazwy epok. >> Dzieje człowieka dzielimy na epokę [kamienia], epokę [brązu] i epokę [żelaza]. !! Kolejno: kamień, brąz, żelazo.
`,
  `
Praludzie: Afryka, około 4 milionów lat temu. Człowiek rozumny: około 200 tysięcy lat temu.
Ogień dawał ciepło, pieczone mięso i ochronę przed zwierzętami. Mowa pozwalała przekazywać doświadczenia.
Najpierw zbieractwo i myślistwo — koczowniczy tryb życia (szałasy, jaskinie).
Około 10 tysięcy lat p.n.e. rolnictwo i hodowla (owce, kozy, świnie) — osiadły tryb życia. To rewolucja neolityczna.
Osady nad rzekami i jeziorami, ziemianki, żarna do mielenia zboża.
Epoki: kamienia → brązu (miedź + cyna) → żelaza (od około 1200 lat p.n.e., trwa do dziś). Żelazo wytapiano w dymarkach.
`,
  `
# Najważniejsze
Najdawniejsi przodkowie człowieka żyli w Afryce około 4 milionów lat temu. Nauczyli się rozpalać ogień i mówić.
Pierwsi ludzie zbierali rośliny i polowali. Wędrowali za pożywieniem — prowadzili koczowniczy tryb życia.
Około 10 tysięcy lat p.n.e. narodziło się rolnictwo i ludzie osiedli na stałe. To rewolucja neolityczna.
## Daty
Około 4 milionów lat temu: Najdawniejsi przodkowie człowieka żyją w Afryce.
Około 200 tysięcy lat temu: Pojawia się człowiek rozumny.
Około 10 tysięcy lat p.n.e.: Początki rolnictwa — rewolucja neolityczna.
Około 1200 lat p.n.e.: Początek epoki żelaza, która trwa do dziś.
## Pojęcia
Koczowniczy tryb życia: Ciągłe przenoszenie się z miejsca na miejsce w poszukiwaniu pożywienia.
Osiadły tryb życia: Stałe mieszkanie w jednym miejscu, blisko pól.
Rewolucja neolityczna: Przejście z koczowniczego na osiadły tryb życia dzięki rolnictwu i hodowli.
Pięściak: Kamienne narzędzie o ostrych krawędziach, dopasowane do dłoni.
## Epoki
Epoka kamienia: Narzędzia i broń z kamienia — trudne w obróbce i szybko się tępiły.
Epoka brązu: Brąz to stop miedzi i cyny, twardszy od samej miedzi.
Epoka żelaza: Od około 1200 lat p.n.e. Żelazo jest bardziej wytrzymałe niż brąz. Wytapiano je w dymarkach.
# Tak / nie tak
tak: Praludzie żyli w Afryce. | nie: Praludzie żyli w Europie. | bo: najstarsze ślady przodków człowieka są w Afryce. Na inne kontynenty ludzie dotarli dużo później.
tak: Rolnictwo pozwoliło ludziom osiąść na stałe. | nie: Ludzie osiedli, bo nauczyli się rozpalać ogień. | bo: ogień znali dużo wcześniej. Osiedli dopiero wtedy, gdy musieli mieszkać przy swoich polach.
tak: Brąz to stop miedzi i cyny. | nie: Brąz to stop miedzi i żelaza. | bo: żelazo ludzie poznali później — po epoce brązu przyszła epoka żelaza.
tak: Epoka żelaza trwa do dziś. | nie: Epoka żelaza skończyła się w starożytności. | bo: do dziś robimy z żelaza narzędzia, maszyny i budowle.
# Zapamiętaj
Kolejność epok jak twardość materiału: kamień → brąz → żelazo. Każdy następny materiał był trwalszy.
Rolnik nie może wędrować, bo pole zostaje w jednym miejscu. Stąd osiadły tryb życia.
# Sprawdź się
wybierz: Co było przyczyną rewolucji neolitycznej? | *uprawa ziemi i hodowla zwierząt | wynalezienie pisma | budowa piramid !! Kto uprawia pole i hoduje zwierzęta, musi mieszkać w jednym miejscu.
wybierz: Która epoka była najwcześniejsza? | *epoka kamienia | epoka brązu | epoka żelaza !! Najpierw ludzie robili narzędzia z kamienia, potem z brązu, a na końcu z żelaza.
`,
);

// ─── 2. Miasta-państwa Mezopotamii ────────────────────────────────────────────

const MEZOPOTAMIA = lekcja(
  'b-h5-r1-mezopotamia',
  20,
  'Miasta-państwa Mezopotamii',
  'Najstarsze państwa świata: Sumerowie i Babilończycy. Przypomnij sobie, gdzie mieszkali, jak żyli i co wymyślili.',
  `
wybierz: Gdzie leży Mezopotamia? | *między Tygrysem i Eufratem | nad Nilem | nad rzeką Indus | nad Żółtą Rzeką !! Mezopotamia to kraina na Bliskim Wschodzie, między rzekami Tygrys i Eufrat.
wybierz: Dlaczego cywilizacje powstawały nad wielkimi rzekami? | *wylewy rzek użyźniały ziemię | rzeki chroniły przed zimnem | nad rzekami nie było upałów | w rzekach było złoto !! Co roku rzeki zalewały pola i zostawiały żyzny muł. Plony zbierano nawet kilka razy w roku.
wybierz: Po co rolnicy w Mezopotamii kopali kanały? | *żeby doprowadzić wodę do dalszych pól | żeby chronić miasto przed wrogami | żeby łowić ryby | żeby osuszyć bagna !! Było gorąco, więc uprawiać można było tylko ziemię blisko wody. Kanały doprowadzały ją dalej.
wybierz: Co to jest cywilizacja? | *rozwinięte społeczeństwo z własnym państwem | grupa koczowników | jedno duże miasto | rodzaj pisma !! Tak podręcznik nazywa rozwinięte społeczeństwo, które stworzyło własne państwo.
wybierz: Kto stworzył pierwszą cywilizację w Mezopotamii? | *Sumerowie | Egipcjanie | Fenicjanie | Babilończycy !! Sumerowie osiedlili się nad Eufratem i Tygrysem w połowie IV tysiąclecia p.n.e.
wybierz: Kiedy powstały pierwsze państwa Sumerów? | *około 3500 lat p.n.e. | około 10 tysięcy lat p.n.e. | w XVIII wieku p.n.e. | w X wieku p.n.e. !! Pierwsze państwa sumeryjskie powstały około 3500 lat p.n.e. — to połowa IV tysiąclecia p.n.e.
wybierz: Czym było miasto-państwo? | *miastem z murami razem z okolicą | wielkim krajem z wieloma miastami | świątynią na wzgórzu | obozem koczowników !! Miasto-państwo to otoczone murami miasto wraz z najbliższą okolicą. Rządził nim król.
wybierz: Kto stał na czele sumeryjskiego miasta-państwa? | *król | faraon | cesarz | prorok !! Na czele miasta-państwa stał król, a urzędnicy pobierali podatki i pilnowali pracy poddanych.
wybierz: Co uważa się za najważniejsze osiągnięcie Sumerów? | *stworzenie pisma | budowę piramid | wynalezienie papieru | stworzenie alfabetu !! Dzięki pismu ludzie zaczęli utrwalać, przechowywać i przekazywać informacje.
sortuj: Co wymyślili Sumerowie? >> Sumerowie = pismo, koło, żagiel, koło garncarskie ; ktoś inny = papier, alfabet, porcelana !! Papier i porcelanę wymyślili Chińczycy, a alfabet — Fenicjanie.
wybierz: Na czym Sumerowie zapisywali swoje pismo? | *na glinianych tabliczkach | na papirusie | na papierze | na skórze zwierząt !! Znaki odciskano w miękkiej glinie zaostrzoną trzciną.
wybierz: Na jakiej liczbie opierał się system liczenia Sumerów? | *60 | 10 | 12 | 100 !! Dlatego dziś godzina ma 60 minut, a minuta 60 sekund.
wybierz: Co to był zikkurat? | *kilkupiętrowa świątynia | pałac faraona | grobowiec | spichlerz !! Zikkurat górował nad miastem. Na szczycie stała kaplica bóstwa.
wybierz: Do czego służyły spichlerze? | *do przechowywania zapasów zboża | do modlitwy | do obrony miasta | do nauki pisma !! Zapasy pomagały przetrwać nieurodzaj, powódź albo wojnę.
wybierz: Kim był sumeryjski król oprócz tego, że rządził? | *kapłanem | kupcem | rolnikiem | niewolnikiem !! Poddani uważali króla za pośrednika między ludźmi a bogami.
wybierz: Które miasto Sumerów było portem przy ujściu Eufratu? | *Ur | Babilon | Jerozolima | Giza !! Ur było bogatym miastem handlowym. Szczyt jego potęgi przypadł na XXI wiek p.n.e.
wybierz: Jakie państwo powstało w Mezopotamii w II tysiącleciu p.n.e.? | *Babilonia | Egipt | Izrael | Fenicja !! Stolicą Babilonii był Babilon — jedno z najwspanialszych miast starożytności.
wybierz: Który władca Babilonii kazał spisać zbiór praw? | *Hammurabi | Salomon | Cheops | Dawid !! Zbiór praw nazywamy Kodeksem Hammurabiego.
wybierz: Kiedy panował Hammurabi? | *w XVIII wieku p.n.e. | w X wieku p.n.e. | w III tysiącleciu p.n.e. | w I wieku n.e. !! Za Hammurabiego, w XVIII wieku p.n.e., Babilonia była najpotężniejsza.
wybierz: Jakie kary przewidywał Kodeks Hammurabiego? | *bardzo surowe | łagodne | żadne | zależne od pogody !! Obowiązywała zasada „oko za oko, ząb za ząb”.
wybierz: Co oznacza zasada „oko za oko, ząb za ząb”? | *kara jest taka sama jak krzywda | trzeba wybaczać każdą winę | za kradzież płaci się zbożem | sędzią jest zawsze kapłan !! Kto komuś wyrządził krzywdę, miał ponieść taką samą szkodę.
wybierz: Co opracowali uczeni z Babilonii? | *kalendarz z tygodniem siedmiodniowym | papier i porcelanę | alfabet | mumifikację !! Babilończycy obserwowali gwiazdy i ułożyli kalendarz: 12 miesięcy, tydzień po 7 dni.
wybierz: Jak nazywała się słynna brama Babilonu z niebieskich cegieł? | *Brama Isztar | Brama Sfinksa | Ściana Płaczu | Wielki Mur !! Bramę Isztar zdobiły sylwetki byków i lwów.
wybierz: Które państwo leży dziś na terenie dawnej Mezopotamii? | *Irak | Egipt | Izrael | Indie !! Dziś leżą tam między innymi Irak, Syria i Turcja. Stolica Iraku to Bagdad.
wpisz: Uzupełnij. >> Godzina ma 60 minut, bo Sumerowie liczyli w systemie opartym na liczbie [60|sześćdziesiąt]. !! Sumeryjski system liczenia opierał się na liczbie 60.
wpisz: Uzupełnij. >> Stolicą Babilonii był [Babilon]. !! Babilon słynął z pałaców, świątyń i potężnych murów.
pary: Ułóż w kolejności: połącz numer z wydarzeniem. >> 1 = pierwsze państwa Sumerów ; 2 = powstanie Babilonii ; 3 = panowanie Hammurabiego !! Sumerowie byli pierwsi (około 3500 lat p.n.e.). Babilonia powstała w II tysiącleciu p.n.e., a najpotężniejsza była za Hammurabiego.
`,
  `
Mezopotamia: Bliski Wschód, między Tygrysem i Eufratem. Wylewy rzek zostawiały żyzny muł, więc plony były duże. Rolnicy kopali kanały nawadniające.
Cywilizacja = rozwinięte społeczeństwo, które stworzyło własne państwo.
Sumerowie: około 3500 lat p.n.e. (połowa IV tysiąclecia p.n.e.) zakładali miasta-państwa. Rządził król, który był też kapłanem. Ur — port przy ujściu Eufratu.
Dokonania Sumerów: pismo klinowe (gliniane tabliczki), koło, żagiel, koło garncarskie, liczenie oparte na 60.
W mieście: zikkurat (świątynia), spichlerze, pałac, targowisko.
Babilonia: II tysiąclecie p.n.e., stolica Babilon (Brama Isztar). Hammurabi — XVIII wiek p.n.e., Kodeks Hammurabiego: „oko za oko, ząb za ząb”.
Babilończycy: matematyka, astronomia, kalendarz z tygodniem 7 dni. Dziś na tych ziemiach: Irak (stolica Bagdad), Syria, Turcja.
`,
  `
# Najważniejsze
Najstarsze cywilizacje powstały nad wielkimi rzekami. Jedna z nich — w Mezopotamii, między Tygrysem i Eufratem.
Pierwsze państwa założyli Sumerowie w IV tysiącleciu p.n.e. Były to miasta-państwa. Sumerowie stworzyli pismo.
W II tysiącleciu p.n.e. powstała Babilonia. Jej król Hammurabi kazał spisać surowe prawa — Kodeks Hammurabiego.
## Daty
Około 3500 lat p.n.e.: Powstają pierwsze państwa Sumerów.
XXI wiek p.n.e.: Szczyt potęgi miasta Ur.
II tysiąclecie p.n.e.: Powstaje Babilonia.
XVIII wiek p.n.e.: Panowanie Hammurabiego — szczyt potęgi Babilonii.
## Pojęcia
Cywilizacja: Rozwinięte społeczeństwo, które stworzyło własne państwo.
Miasto-państwo: Miasto otoczone murami razem z najbliższą okolicą. Rządził nim król.
Podatek: Obowiązkowa opłata na rzecz państwa.
Zikkurat: Kilkupiętrowa świątynia, najwyższa budowla w mieście.
Pismo klinowe: Znaki odciskane trzciną na glinianych tabliczkach.
## Dokonania
Sumerowie: Pismo, koło, żagiel, koło garncarskie i liczenie oparte na liczbie 60.
Babilończycy: Obliczenia na dużych liczbach i ułamkach, obserwacje gwiazd, kalendarz z tygodniem 7 dni.
# Tak / nie tak
tak: Mezopotamia leży między Tygrysem i Eufratem. | nie: Mezopotamia leży nad Nilem. | bo: nad Nilem powstał Egipt. Nazwa Mezopotamia znaczy po grecku „kraina między rzekami”.
tak: Pierwsze państwa założyli Sumerowie. | nie: Pierwsze państwa założyli Babilończycy. | bo: Babilonia powstała później, w II tysiącleciu p.n.e., i przejęła wiele wynalazków Sumerów.
tak: Kodeks Hammurabiego miał surowe kary. | nie: Kodeks Hammurabiego był łagodny. | bo: obowiązywała zasada „oko za oko, ząb za ząb”.
tak: Godzina ma 60 minut dzięki Sumerom. | nie: Godzina ma 60 minut dzięki Egipcjanom. | bo: to Sumerowie liczyli w systemie opartym na liczbie 60.
# Zapamiętaj
Mezopotamia = kraina między rzekami: Tygrysem i Eufratem.
Sumerowie byli pierwsi: pierwsze państwa i pierwsze pismo.
Hammurabi = surowe prawa: oko za oko, ząb za ząb.
# Sprawdź się
wybierz: Kto przejął od Sumerów wiele odkryć i wynalazków? | *Babilończycy | Chińczycy | Fenicjanie !! Babilonia powstała w Mezopotamii później i korzystała z dorobku Sumerów.
wybierz: Gdzie mieszkańcy Ur chronili się podczas wielkich wylewów rzeki? | *na zikkuracie | w spichlerzu | na targowisku !! Zikkurat był najwyższą budowlą w mieście.
`,
);

// ─── 3. W Egipcie faraonów ────────────────────────────────────────────────────

const EGIPT = lekcja(
  'b-h5-r1-egipt',
  30,
  'W Egipcie faraonów',
  'Państwo nad wielką afrykańską rzeką: władca i jego poddani, bogowie i życie po śmierci, grobowce i wynalazki.',
  `
wybierz: Kiedy powstało państwo egipskie? | *około 3000 lat p.n.e. | około 10 tysięcy lat p.n.e. | w XVIII wieku p.n.e. | w I wieku n.e. !! Państwo egipskie powstało około 3000 lat p.n.e. na północy Afryki.
wybierz: Nad jaką rzeką powstał Egipt? | *nad Nilem | nad Eufratem | nad Indusem | nad Jordanem !! Egipt leżał w dolinie Nilu, na północy Afryki.
wybierz: Dlaczego Egipt nazywano „darem Nilu”? | *bez wylewów Nilu nie byłoby rolnictwa | bo w Nilu znajdowano złoto | bo faraon dostał Egipt w prezencie | bo nad Nilem nie padało !! Nil co roku zostawiał na polach żyzny muł, a dalej od rzeki była pustynia.
wybierz: Co rozciągało się dalej od Nilu? | *pustynia | lasy | góry pokryte śniegiem | bagna !! Dlatego życie Egipcjan skupiało się blisko rzeki.
wybierz: Kto miał w Egipcie nieograniczoną władzę? | *faraon | najwyższy kapłan | urzędnicy | wódz wojska !! Faraon ustanawiał prawa, sądził, był kapłanem i dowodził wojskiem.
wybierz: Kto stanął na czele Egiptu w XV wieku p.n.e.? | *królowa Hatszepsut | Tutenchamon | Hammurabi | Salomon !! Faraonami byli zwykle mężczyźni, ale w XV wieku p.n.e. rządziła kobieta — Hatszepsut.
wybierz: Jakie dwie krainy symbolizowała korona faraona? | *Egipt Górny i Egipt Dolny | Mezopotamię i Egipt | Nil i pustynię | niebo i ziemię !! Egipt Górny to dolina Nilu, a Egipt Dolny — ziemie przy ujściu rzeki.
pary: Połącz grupę ludności z jej zajęciem. >> kapłani = obrzędy w świątyniach ; urzędnicy = pomoc w rządzeniu ; chłopi = uprawa ziemi ; niewolnicy = służba w domach !! Kapłani odprawiali obrzędy, urzędnicy pomagali faraonowi rządzić, chłopi uprawiali ziemię, a niewolnicy służyli w domach bogatych.
wybierz: Która grupa ludności była w Egipcie najliczniejsza? | *chłopi | kapłani | urzędnicy | niewolnicy !! Chłopi uprawiali ziemię, kopali kanały i pracowali przy budowie piramid.
wybierz: Kto oprócz kapłanów umiał w Egipcie czytać i pisać? | *urzędnicy | chłopi | niewolnicy | żołnierze !! Urzędnicy byli nieliczną, wykształconą grupą. Przez nich faraon rządził państwem.
wybierz: Kim byli najczęściej niewolnicy w Egipcie? | *jeńcami wojennymi | synami faraona | kapłanami | kupcami z Chin !! Niewolników nie było wielu. Najczęściej służyli w domach zamożnych Egipcjan.
wybierz: Co znaczy, że Egipcjanie byli politeistami? | *wierzyli w wielu bogów | wierzyli w jednego boga | nie wierzyli w bogów | czcili tylko faraona !! Politeizm (z greckiego: poli — wiele, theos — bóg) to wiara w wielu bogów.
wybierz: Kim był Ra? | *bogiem słońca | bogiem zmarłych | pierwszym faraonem | kapłanem !! Ra był jednym z najważniejszych bogów. Przedstawiano go z głową sokoła albo jastrzębia.
wybierz: Który bóg według Egipcjan sądził zmarłych? | *Ozyrys | Ra | Jahwe | Brahma !! Ozyrys decydował, czy zmarły zasługuje na przejście do innego świata.
wybierz: Dlaczego Egipcjanie mumifikowali zmarłych? | *wierzyli, że dusza żyje, dopóki ciało jest całe | żeby ciało było lżejsze | bo tak nakazywał Kodeks Hammurabiego | żeby szybciej pochować zmarłego !! Według Egipcjan dusza istniała tak długo, jak długo ciało było nienaruszone.
pary: Ułóż etapy mumifikacji: połącz numer z czynnością. >> 1 = usunięcie wnętrzności ; 2 = balsamowanie ciała ; 3 = owijanie bandażami ; 4 = złożenie w sarkofagu !! Na końcu sarkofag umieszczano w piramidzie albo w grobowcu wykutym w skale.
wybierz: Czym były piramidy? | *grobowcami faraonów | świątyniami bogów | pałacami | spichlerzami !! Budowa piramidy mogła trwać nawet kilkadziesiąt lat.
wybierz: Gdzie stoją piramidy Cheopsa i Chefrena? | *w Gizie | w Babilonie | w Jerozolimie | w Ur !! Najsłynniejsze piramidy zbudowano w III tysiącleciu p.n.e. w Gizie.
wybierz: Co przedstawia Wielki Sfinks? | *lwa z ludzką głową | sokoła z ludzką głową | byka ze skrzydłami | faraona na koniu !! Według uczonych Sfinks ma twarz faraona Chefrena. Nazywa się go strażnikiem piramid.
wybierz: Kto w 1922 roku odkrył grobowiec Tutenchamona? | *Howard Carter | Jean François Champollion | Kazimierz Michałowski | Herodot !! Brytyjczyk Howard Carter znalazł w Dolinie Królów nienaruszony grobowiec z ponad pięcioma tysiącami przedmiotów.
wybierz: Jak nazywa się pismo obrazkowe Egipcjan? | *hieroglify | pismo klinowe | alfabet | cyrylica !! Hieroglifów było około sześciu tysięcy.
wybierz: Ile dni miał rok w kalendarzu Egipcjan? | *365 | 360 | 300 | 7 !! Rok miał 12 miesięcy po 30 dni i 5 dni dodatkowych.
wybierz: Dzięki czemu Egipcjanie poznali budowę ciała człowieka? | *dzięki mumifikacji | dzięki budowie piramid | dzięki wylewom Nilu | dzięki pismu klinowemu !! Przy mumifikacji poznali wnętrze ciała. Potrafili nawet przeprowadzać operacje.
wybierz: Który polski archeolog ratował świątynię w Abu Simbel? | *Kazimierz Michałowski | Howard Carter | Mikołaj Kopernik | Jan Matejko !! Świątynię w Abu Simbel pocięto na części i odbudowano wyżej, bo groziło jej zalanie przez sztuczne jezioro przy tamie w Asuanie.
wpisz: Uzupełnij. >> Władca Egiptu to [faraon]. !! Faraon miał nieograniczoną władzę.
wpisz: Uzupełnij. >> Ciało zabalsamowane i owinięte bandażami to [mumia]. !! Mumię składano w sarkofagu.
`,
  `
Egipt: około 3000 lat p.n.e., północ Afryki, dolina Nilu. „Egipt darem Nilu” — wylewy zostawiały żyzny muł, dalej była pustynia.
Społeczeństwo jak piramida: faraon (nieograniczona władza) → kapłani i urzędnicy (umieli czytać i pisać) → żołnierze, rzemieślnicy, chłopi (najliczniejsi) → niewolnicy (nieliczni, jeńcy).
Korona faraona: Egipt Górny (dolina Nilu) i Egipt Dolny (ujście). Królowa Hatszepsut — XV wiek p.n.e.
Politeizm: Ra — bóg słońca, Ozyrys — sędzia zmarłych. Wiara w życie po śmierci → mumifikacja, sarkofagi, piramidy.
Piramidy w Gizie (III tysiąclecie p.n.e.): Cheopsa i Chefrena; Wielki Sfinks — lew z ludzką głową.
Grobowiec Tutenchamona: odkryty w 1922 roku przez Howarda Cartera.
Dokonania: hieroglify, medycyna, matematyka, kalendarz 365 dni (12 × 30 dni + 5 dni).
`,
  `
# Najważniejsze
Egipt powstał około 3000 lat p.n.e. w Afryce nad Nilem. Dzięki wylewom Nilu rozwijało się tu rolnictwo.
Na czele państwa stał faraon z nieograniczoną władzą. Wykształceni byli kapłani i urzędnicy, a resztę tworzyli rzemieślnicy, chłopi, żołnierze i niewolnicy.
Egipcjanie wierzyli w wielu bogów i w życie po śmierci, dlatego mumifikowali zmarłych i budowali piramidy.
## Daty
Około 3000 lat p.n.e.: Powstaje państwo egipskie.
III tysiąclecie p.n.e.: Piramidy w Gizie i kalendarz 365-dniowy.
XV wiek p.n.e.: Rządzi królowa Hatszepsut.
1922 rok: Howard Carter odkrywa grobowiec Tutenchamona.
## Społeczeństwo Egiptu
Faraon: Ustanawiał prawa, sądził, był kapłanem i dowodził wojskiem.
Kapłani: Odprawiali obrzędy, doradzali faraonowi, prowadzili szkoły i obserwowali niebo.
Urzędnicy: Umieli czytać i pisać. Przez nich faraon rządził państwem.
Żołnierze: Pochodzili spośród chłopów i rzemieślników. Bronili kraju.
Rzemieślnicy: Robili narzędzia, naczynia i ubrania.
Chłopi: Najliczniejsza grupa: uprawiali ziemię, kopali kanały, budowali piramidy.
Niewolnicy: Nieliczni, głównie jeńcy wojenni. Służyli w domach bogatych.
## Wiara i dokonania
Politeizm: Wiara w wielu bogów. Ra — bóg słońca, Ozyrys — sędzia zmarłych.
Mumifikacja: Usunięcie wnętrzności, balsamowanie, bandaże, sarkofag.
Piramidy: Grobowce faraonów. Najsłynniejsze w Gizie: Cheopsa i Chefrena, a obok Wielki Sfinks.
Hieroglify: Pismo obrazkowe, około 6 tysięcy znaków.
Kalendarz: 365 dni: 12 miesięcy po 30 dni i 5 dni dodatkowych.
# Tak / nie tak
tak: Egipt powstał nad Nilem. | nie: Egipt powstał nad Eufratem. | bo: nad Eufratem i Tygrysem leży Mezopotamia. Egipt to „dar Nilu”.
tak: Piramidy to grobowce faraonów. | nie: Piramidy to świątynie. | bo: w środku była komora grobowa z ciałem faraona i jego skarbami.
tak: Egipcjanie wierzyli w wielu bogów. | nie: Egipcjanie wierzyli w jednego boga. | bo: w jednego boga wierzyli Izraelici. Egipcjanie byli politeistami.
tak: Najliczniejszą grupą byli chłopi. | nie: Najliczniejszą grupą byli niewolnicy. | bo: niewolników było w Egipcie niewielu — byli to głównie jeńcy wojenni.
# Zapamiętaj
Społeczeństwo jak piramida z kamienia: na szczycie jeden faraon, na dole najwięcej — chłopi.
Poli = wiele, theos = bóg: politeizm to wiara w wielu bogów.
# Sprawdź się
wybierz: Kto prowadził w Egipcie szkoły i obserwował niebo? | *kapłani | chłopi | żołnierze !! Kapłani należeli do najlepiej wykształconych Egipcjan i potrafili nawet przewidzieć zaćmienie Słońca.
wybierz: Po co w grobowcu faraona zostawiano przedmioty codziennego użytku? | *miały mu służyć w życiu po śmierci | żeby je ukryć przed złodziejami | żeby muzeum miało zbiory !! Egipcjanie wierzyli, że zmarły będzie ich potrzebował w życiu pozagrobowym.
`,
);

// ─── 4. W starożytnym Izraelu ─────────────────────────────────────────────────

const IZRAEL = lekcja(
  'b-h5-r1-izrael',
  40,
  'W starożytnym Izraelu',
  'Dzieje Izraelitów opisane w Biblii, ich królowie i religia. Przypomnij sobie, kto czym się zasłużył i w jakiej kolejności.',
  `
wybierz: Jak inaczej nazywamy Izraelitów? | *Żydami | Sumerami | Fenicjanami | Ariami !! Izraelici to inaczej Żydzi.
wybierz: Kto według Biblii przyprowadził Izraelitów do Kanaanu? | *Abraham | Mojżesz | Dawid | Salomon !! Abraham uważany jest za ojca narodu żydowskiego. Uznają go też Arabowie, wyznawcy islamu.
wybierz: Jak w starożytności nazywano Palestynę? | *Ziemią Kanaan | Mezopotamią | Babilonią | Dolnym Egiptem !! Palestyna to wąski pas ziemi między rzeką Jordan a Morzem Śródziemnym.
wybierz: Kto wyprowadził Izraelitów z niewoli w Egipcie? | *Mojżesz | Abraham | Salomon | Hammurabi !! Faraonowie uczynili Izraelitów niewolnikami. Mojżesz wyprowadził ich z powrotem do Palestyny.
wybierz: Kiedy Izraelici wyszli z Egiptu? | *około XIII wieku p.n.e. | około 3000 lat p.n.e. | w X wieku n.e. | w 1948 roku !! Wyjście z Egiptu pod wodzą Mojżesza nastąpiło około XIII wieku p.n.e.
wybierz: Który król zjednoczył plemiona izraelskie i zdobył Jerozolimę? | *Dawid | Salomon | Mojżesz | Hammurabi !! Dawid uczynił Jerozolimę stolicą swojego kraju.
wybierz: Z czego słynął król Salomon? | *z mądrości | z okrucieństwa | z budowy piramid | z wynalezienia pisma !! Salomon był synem Dawida i następnym władcą Izraela.
wybierz: Kiedy panowali Dawid i Salomon? | *w X wieku p.n.e. | w XVIII wieku p.n.e. | w XIII wieku p.n.e. | w I wieku n.e. !! To czas największej potęgi starożytnego Izraela.
wybierz: Kto w VI wieku p.n.e. uprowadził Izraelitów do niewoli? | *Babilończycy | Egipcjanie | Rzymianie | Sumerowie !! Ten okres nazywamy niewolą babilońską.
wybierz: Kto podbił Palestynę w I wieku p.n.e.? | *Rzymianie | Babilończycy | Egipcjanie | Fenicjanie !! Po powstaniach przeciw Rzymianom w I i II wieku n.e. Żydów wypędzono z Palestyny i rozproszyli się po świecie.
wybierz: Jak nazywa się religia Żydów? | *judaizm | hinduizm | islam | buddyzm !! Judaizm to religia monoteistyczna — wiara w jednego Boga.
wybierz: Co znaczy, że judaizm jest religią monoteistyczną? | *jego wyznawcy wierzą w jednego Boga | jego wyznawcy wierzą w wielu bogów | nie ma w nim modlitw | czci się w nim faraona !! Monoteizm (z greckiego: mono — jeden, theos — bóg) to wiara w jednego Boga.
wybierz: Jakim imieniem Żydzi określali Boga? | *Jahwe | Ra | Ozyrys | Brahma !! Jahwe miał być niewidzialny, wszechmocny i wszechobecny.
wybierz: Jak nazywamy pięć pierwszych ksiąg Biblii hebrajskiej? | *Tora | Dekalog | Kodeks | Menora !! Tora to inaczej Pięcioksiąg. Dla chrześcijan to pięć pierwszych ksiąg Starego Testamentu.
wybierz: Gdzie według Biblii Mojżesz otrzymał Dziesięcioro Przykazań? | *na górze Synaj | w Jerozolimie | nad Nilem | w Babilonie !! Przykazania zapisano na kamiennych tablicach.
wybierz: Jak inaczej nazywamy Dziesięcioro Przykazań? | *Dekalog | Tora | Arka Przymierza | Menora !! W Dekalogu zawarte są najważniejsze zasady judaizmu.
wybierz: W czym przechowywano kamienne tablice z Dekalogiem? | *w Arce Przymierza | w piramidzie | w spichlerzu | w zikkuracie !! Arkę umieszczono w świątyni w Jerozolimie.
wybierz: Kto rozpoczął budowę świątyni w Jerozolimie? | *król Salomon | król Dawid | Mojżesz | Abraham !! Według Biblii miejsce wskazał Dawid, a budowę rozpoczął jego syn Salomon.
wybierz: Czym jest Ściana Płaczu? | *pozostałością Drugiej Świątyni | grobem Mojżesza | murem obronnym Babilonu | pałacem Salomona !! To jedyna zachowana część Drugiej Świątyni Jerozolimskiej i święte miejsce wyznawców judaizmu.
wybierz: Co to jest menora? | *siedmioramienny świecznik | święta księga | korona króla | rodzaj świątyni !! Menora od ponad dwóch tysięcy lat jest symbolem judaizmu i narodu żydowskiego.
wybierz: Na kogo czekają wyznawcy judaizmu? | *na Mesjasza | na nowego faraona | na Mojżesza | na króla Babilonu !! Prorocy nauczali, że Mesjasz wyzwoli Żydów i odbuduje ich świątynię.
wybierz: Kiedy powstało współczesne państwo Izrael? | *w 1948 roku | w X wieku p.n.e. | w XIII wieku p.n.e. | w 1922 roku !! Przez około dwa tysiące lat Żydzi nie mieli własnego państwa.
pary: Ułóż w kolejności: połącz numer z wydarzeniem. >> 1 = wędrówka Abrahama do Kanaanu ; 2 = wyjście z Egiptu pod wodzą Mojżesza ; 3 = panowanie Dawida i Salomona ; 4 = niewola babilońska !! Abraham, potem Mojżesz (XIII wiek p.n.e.), Dawid i Salomon (X wiek p.n.e.), a na końcu niewola babilońska (VI wiek p.n.e.).
pary: Połącz postać z tym, z czego jest znana. >> Abraham = ojciec narodu ; Mojżesz = Dekalog ; Dawid = zdobycie Jerozolimy ; Salomon = mądrość !! Abraham — ojciec narodu żydowskiego, Mojżesz — Dekalog, Dawid — Jerozolima, Salomon — mądrość i świątynia.
wpisz: Uzupełnij. >> Stolicą państwa Dawida była [Jerozolima]. !! Dawid zdobył Jerozolimę i uczynił ją stolicą.
`,
  `
Izraelici = Żydzi. Z Mezopotamii do Palestyny (Ziemi Kanaan) przyprowadził ich Abraham.
W Egipcie popadli w niewolę. Około XIII wieku p.n.e. Mojżesz wyprowadził ich z Egiptu.
X wiek p.n.e.: Dawid (zjednoczył plemiona, zdobył Jerozolimę — stolica) i jego syn Salomon (mądrość, świątynia).
Początek VI wieku p.n.e.: Babilończycy zdobywają Jerozolimę — niewola babilońska. I wiek p.n.e.: Rzymianie.
Judaizm: monoteizm (jeden Bóg — Jahwe). Biblia hebrajska, a w niej Tora (5 ksiąg).
Dekalog: Mojżesz na górze Synaj; tablice w Arce Przymierza. Menora — siedmioramienny świecznik.
Ściana Płaczu — pozostałość Drugiej Świątyni. Współczesny Izrael: od 1948 roku.
`,
  `
# Najważniejsze
Izraelici, czyli Żydzi, przybyli do Palestyny z Mezopotamii pod wodzą Abrahama. Później popadli w niewolę w Egipcie.
Około XIII wieku p.n.e. wyprowadził ich z Egiptu Mojżesz. Najpotężniejszy był Izrael za Dawida i Salomona, w X wieku p.n.e.
Izraelici wierzyli w jednego Boga — Jahwe. Ich religia to judaizm, a święta księga — Biblia hebrajska.
## Daty
XIII wiek p.n.e.: Wyjście Izraelitów z Egiptu pod wodzą Mojżesza.
X wiek p.n.e.: Panowanie królów Dawida i Salomona.
Początek VI wieku p.n.e.: Babilończycy zdobywają Jerozolimę — niewola babilońska.
I wiek p.n.e.: Palestynę podbijają Rzymianie.
1948 rok: Powstaje współczesne państwo Izrael.
## Ważne postacie
Abraham: Przyprowadził Izraelitów z Mezopotamii do Kanaanu. Ojciec narodu żydowskiego.
Mojżesz: Wyprowadził Izraelitów z Egiptu. Na górze Synaj otrzymał Dekalog.
Dawid: Zjednoczył plemiona izraelskie, zdobył Jerozolimę i uczynił ją stolicą.
Salomon: Syn Dawida, słynął z mądrości. Rozpoczął budowę świątyni w Jerozolimie.
## Pojęcia
Judaizm: Religia Żydów. Monoteistyczna — wiara w jednego Boga, Jahwe.
Tora: Pięć pierwszych, najważniejszych ksiąg Biblii hebrajskiej.
Dekalog: Dziesięcioro Przykazań. Tablice przechowywano w Arce Przymierza.
Menora: Siedmioramienny świecznik, symbol judaizmu.
Prorok: Przywódca religijny powołany przez Boga. Prorocy zapowiadali Mesjasza.
# Tak / nie tak
tak: Z Egiptu wyprowadził Izraelitów Mojżesz. | nie: Z Egiptu wyprowadził Izraelitów Abraham. | bo: Abraham przyprowadził ich z Mezopotamii do Kanaanu dużo wcześniej.
tak: Świątynię w Jerozolimie zaczął budować Salomon. | nie: Świątynię w Jerozolimie zbudował Dawid. | bo: Dawid wskazał tylko miejsce, a budowę rozpoczął jego syn Salomon.
tak: Judaizm to religia monoteistyczna. | nie: Judaizm to religia politeistyczna. | bo: Żydzi wierzyli w jednego Boga. Mono znaczy jeden.
# Zapamiętaj
Kolejność w czterech imionach: Abraham → Mojżesz → Dawid → Salomon.
Mono = jeden: monoteizm (Izraelici). Poli = wiele: politeizm (Egipcjanie).
# Sprawdź się
wybierz: Kto podtrzymywał wiarę Żydów w czasie niewoli babilońskiej? | *prorocy | faraonowie | Rzymianie !! Prorocy nauczali o Mesjaszu, który ma wyzwolić Żydów.
wybierz: Kto zburzył pierwszą świątynię w Jerozolimie? | *Babilończycy | Rzymianie | Egipcjanie !! Pierwszą świątynię zburzyli Babilończycy w VI wieku p.n.e. Drugą zniszczyli Rzymianie w I wieku n.e.
`,
);

// ─── 5. Cywilizacje Indii i Chin ──────────────────────────────────────────────

const INDIE_CHINY = lekcja(
  'b-h5-r1-indie-chiny',
  50,
  'Cywilizacje Indii i Chin',
  'Dwie wielkie cywilizacje Azji: ich miasta, ludzie, wierzenia i wynalazki, z których korzystamy do dziś.',
  `
wybierz: Nad jaką rzeką powstała najstarsza cywilizacja Indii? | *nad Indusem | nad Nilem | nad Eufratem | nad Jangcy !! Cywilizacja doliny Indusu powstała na terenie dzisiejszych Indii i Pakistanu.
wybierz: Kiedy powstała cywilizacja doliny Indusu? | *w III tysiącleciu p.n.e. | około 10 tysięcy lat p.n.e. | w XIII wieku p.n.e. | w I wieku n.e. !! Mieszkańcy doliny Indusu budowali kanały nawadniające, a potem wielkie miasta.
wybierz: Czym wyróżniały się miasta doliny Indusu? | *miały wodociągi i kanalizację | były zbudowane z lodu | nie miały domów | pływały po rzece !! Wodociągi dostarczały do domów bieżącą wodę, a kanalizacja odprowadzała nieczystości poza miasto.
wybierz: Jak nazywało się jedno z największych miast doliny Indusu? | *Mohendżo Daro | Babilon | Ur | Giza !! W Mohendżo Daro była cytadela, czyli twierdza władcy, i łaźnia z basenem.
wybierz: Co wiemy o piśmie mieszkańców doliny Indusu? | *do dziś nie udało się go odczytać | było to pismo klinowe | był to alfabet łaciński | zapisywano je na papierze !! Mieszkańcy doliny Indusu znali pismo, ale nikt go jeszcze nie odczytał.
wybierz: Kto około 1500 roku p.n.e. podbił dolinę Indusu? | *Ariowie | Rzymianie | Babilończycy | Chińczycy !! Ariowie byli koczowniczym ludem. Po podboju podzielili ludność na kasty.
wybierz: Czym są kasty? | *zamkniętymi grupami ludności | rodzajami świątyń | dzielnicami miasta | stopniami w wojsku !! Do kasty należało się od urodzenia. Członkowie kasty mieli wspólne obyczaje i ten sam zawód.
wybierz: Co było zakazane między osobami z różnych kast? | *małżeństwa | handel na targu | modlitwa | nauka rzemiosła !! Zakazane były nawet krótkie kontakty, na przykład wspólne jedzenie. System kast przetrwał w Indiach do dziś.
wybierz: Jaka religia wielu bogów powstała w Indiach? | *hinduizm | judaizm | islam | chrześcijaństwo !! Hinduizm powstał z połączenia wierzeń Ariów i miejscowej ludności.
pary: Połącz boga hinduizmu z jego rolą. >> Brahma = stwórca świata ; Wisznu = utrzymuje świat ; Sziwa = śmierć i zagłada !! Brahma stworzył świat, Wisznu utrzymuje go przy życiu, a Sziwa jest bóstwem śmierci i zagłady.
wybierz: W co wierzą hinduiści? | *w odradzanie się w innym ciele | w jednego boga, Jahwe | w sąd Ozyrysa | w to, że po śmierci nic nie ma !! To reinkarnacja. Człowiek może odrodzić się nawet jako zwierzę, dlatego hinduiści nie jedzą mięsa.
wybierz: Jaki sposób liczenia stworzyli mieszkańcy starożytnych Indii? | *system dziesiętny | system oparty na liczbie 60 | cyfry rzymskie | liczenie na palcach jednej ręki !! Ten system nazywamy dziś arabskim, bo przejęli go i upowszechnili Arabowie.
wybierz: Nad jakimi rzekami narodziła się cywilizacja chińska? | *nad Huang He i Jangcy | nad Tygrysem i Eufratem | nad Nilem | nad Indusem !! Huang He to Żółta Rzeka, a Jangcy — Niebieska Rzeka.
wybierz: Kiedy zjednoczono Chiny pod władzą cesarza? | *w III wieku p.n.e. | w III tysiącleciu p.n.e. | w XVIII wieku p.n.e. | w XX wieku !! Uwaga: cywilizacja chińska narodziła się w III tysiącleciu p.n.e., a zjednoczenie nastąpiło dużo później — w III wieku p.n.e.
wybierz: Po co zbudowano Wielki Mur Chiński? | *by chronić kraj przed koczownikami z północy | by zatrzymać wylewy rzek | jako drogę dla kupców | jako grobowiec cesarza !! Mur miał chronić Chiny przed najazdami koczowniczych plemion.
wybierz: Jak długie są najważniejsze umocnienia Wielkiego Muru? | *ponad 2400 km | około 24 km | około 240 m | około 2 km !! To jedna z największych budowli na Ziemi. Od 1987 roku jest na liście UNESCO.
sortuj: Kto to wynalazł? >> Chińczycy = papier, porcelana, proch, igła magnetyczna, jedwab ; Sumerowie = pismo klinowe, koło, żagiel !! Wynalazki Chińczyków są o wiele młodsze niż koło czy żagiel Sumerów.
wybierz: Jaką delikatną tkaninę wytwarzali Chińczycy? | *jedwab | len | wełnę | bawełnę !! Chińczycy przez wieki strzegli tajemnicy produkcji jedwabiu, bo jego sprzedaż przynosiła ogromne zyski.
wybierz: Czym był Jedwabny Szlak? | *drogą handlową z Chin do Europy | murem obronnym | rzeką w Chinach | pałacem cesarza !! Ta trasa miała ponad 10 tysięcy kilometrów. Kupcy wędrowali nią już w II wieku p.n.e.
wybierz: Kiedy w Chinach wynaleziono papier? | *około 100 roku n.e. | około 3000 lat p.n.e. | w XVIII wieku | w 1974 roku !! Papier robiono z włókien roślinnych rozmiękczonych w wodzie.
wybierz: Co odkryto w 1974 roku przy grobowcu pierwszego cesarza Chin? | *terakotową armię | Kamień z Rosetty | grobowiec Tutenchamona | Arkę Przymierza !! Prawie 8 tysięcy figur żołnierzy z wypalanej gliny miało strzec cesarza po śmierci.
wybierz: Jak nazywają się chińskie świątynie? | *pagody | zikkuraty | piramidy | synagogi !! Pagody stały w środku chińskich miast, obok pałaców i ogrodów.
wpisz: Uzupełnij. >> Chińczycy wynaleźli papier, porcelanę, igłę magnetyczną i [proch] strzelniczy. !! Proch wymyślili chińscy chemicy, szukając eliksiru nieśmiertelności.
wybierz: O ile lat Chiny wyprzedziły Europę w druku ruchomą czcionką? | *o 400 lat | o 40 lat | o 4 lata | o 4000 lat !! Chińczycy drukowali ruchomą czcionką już w XI wieku, a Europejczycy — 400 lat później.
`,
  `
Dolina Indusu: III tysiąclecie p.n.e. (dziś Indie i Pakistan). Miasta z wypalanej cegły, wodociągi i kanalizacja. Mohendżo Daro. Pismo nieodczytane.
Około 1500 roku p.n.e. Ariowie podbili dolinę Indusu i podzielili ludzi na kasty (dziedziczne, bez małżeństw między kastami).
Hinduizm: wielu bogów (Brahma — stwórca, Wisznu — utrzymuje świat, Sziwa — zagłada), reinkarnacja. System dziesiętny (cyfry „arabskie”).
Chiny: nad Huang He (Żółta Rzeka) i Jangcy (Niebieska Rzeka), od III tysiąclecia p.n.e. Zjednoczenie w III wieku p.n.e. — cesarz.
Wielki Mur: ochrona przed koczownikami z północy, ponad 2400 km.
Wynalazki Chin: papier (około 100 roku n.e.), porcelana, proch, igła magnetyczna, jedwab, druk ruchomą czcionką. Jedwabny Szlak do Europy. Terakotowa armia (odkryta w 1974 roku).
`,
  `
# Najważniejsze
W III tysiącleciu p.n.e. nad Indusem powstała cywilizacja miast z wodociągami i kanalizacją. Około 1500 roku p.n.e. podbili ją Ariowie i podzielili ludność na kasty.
W III tysiącleciu p.n.e. nad rzekami Huang He i Jangcy narodziła się cywilizacja chińska. Od III wieku p.n.e. Chiny były cesarstwem.
Chińczycy wynaleźli papier, porcelanę, proch, igłę magnetyczną i jedwab, a mieszkańcy Indii — system dziesiętny.
## Daty
III tysiąclecie p.n.e.: Początki cywilizacji doliny Indusu i Chin.
Około 1500 roku p.n.e.: Ariowie podbijają dolinę Indusu — początek kast.
III wiek p.n.e.: Zjednoczenie Chin pod władzą cesarza.
II wiek p.n.e.: Kupcy wędrują Jedwabnym Szlakiem.
Około 100 roku n.e.: Chińczycy wynajdują papier.
## Indie
Mohendżo Daro: Wielkie miasto doliny Indusu z cytadelą i łaźnią.
Kasty: Zamknięte grupy ludności. Należało się do nich od urodzenia, a małżeństwa między kastami były zakazane.
Hinduizm: Wielu bogów: Brahma — stwórca, Wisznu — utrzymuje świat, Sziwa — śmierć i zagłada.
System dziesiętny: Sposób liczenia, którego używamy dziś. Nazywamy go arabskim, bo upowszechnili go Arabowie.
## Chiny
Wielki Mur: Ochrona przed koczownikami z północy. Najważniejsze umocnienia mają ponad 2400 km.
Jedwabny Szlak: Ponad 10 tysięcy km drogi handlowej z Chin do Europy.
Wynalazki: Papier, porcelana, proch strzelniczy, igła magnetyczna, jedwab, druk ruchomą czcionką.
Terakotowa armia: Prawie 8 tysięcy figur żołnierzy przy grobowcu pierwszego cesarza.
# Tak / nie tak
tak: Papier wynaleźli Chińczycy. | nie: Papier wynaleźli Egipcjanie. | bo: Egipcjanie pisali na papirusie z trzciny. Papier z włókien roślinnych zrobili Chińczycy około 100 roku n.e.
tak: Kasty wprowadzili w Indiach Ariowie. | nie: Kasty istniały w Chinach. | bo: kasty to podział społeczeństwa w Indiach. Przetrwał tam do dziś.
tak: Cyfry, których używamy, pochodzą z Indii. | nie: Cyfry, których używamy, wymyślili Arabowie. | bo: Arabowie przejęli je i upowszechnili — stąd nazwa „cyfry arabskie”.
# Zapamiętaj
Indie: Indus, kasty i cyfry. Chiny: Huang He i Jangcy, mur i wynalazki.
Wynalazki Chin na literę P: papier, porcelana, proch. Do tego jedwab i igła magnetyczna.
# Sprawdź się
wybierz: Z czego budowano domy w miastach doliny Indusu? | *z wypalanej cegły | z papirusu | z bambusa !! Budynki wznoszono z wypalanej cegły i wyposażano w wodociągi.
wybierz: Od kiedy Chińczycy wyrabiali porcelanę? | *od VII wieku | od XVIII wieku | od I wieku p.n.e. !! W Europie pierwsze wytwórnie porcelany powstały dopiero w XVIII wieku w Niemczech.
`,
);

// ─── 6. Od hieroglifów do alfabetu ────────────────────────────────────────────

const PISMO = lekcja(
  'b-h5-r1-pismo',
  60,
  'Od hieroglifów do alfabetu',
  'Jak powstało pismo i jak się zmieniało: od rysunków na ścianach jaskiń do liter, którymi piszemy dziś.',
  `
wybierz: Jak ludzie wyrażali myśli, zanim powstało pismo? | *malowali rysunki na ścianach jaskiń | pisali na papierze | wysyłali listy | ryli litery w kamieniu !! Malowidła przedstawiały zwierzęta i sceny z polowań.
wybierz: Gdzie są słynne malowidła naskalne odkryte w 1940 roku? | *w Lascaux we Francji | w Gizie w Egipcie | w Ur w Mezopotamii | w Xian w Chinach !! Malowidła z Lascaux powstały około 15 tysięcy lat p.n.e. Przedstawiają bizony, konie i jelenie.
wybierz: Gdzie powstało pismo? | *na Bliskim Wschodzie | w Europie | w Chinach | w Ameryce !! Pierwsi pisma zaczęli używać Sumerowie w Mezopotamii.
wybierz: Kto pierwszy zaczął używać pisma? | *Sumerowie | Fenicjanie | Grecy | Rzymianie !! Sumerowie stosowali pismo już w IV tysiącleciu p.n.e.
wybierz: Kiedy wynaleziono pismo? | *około 4000 lat p.n.e. | około 10 tysięcy lat p.n.e. | w XI wieku p.n.e. | w I wieku n.e. !! Pismo wynaleziono w Mezopotamii około 4000 lat p.n.e.
wybierz: Co wyznacza koniec prehistorii i początek starożytności? | *wynalezienie pisma | rozpalenie ognia | początek rolnictwa | budowa piramid !! Od kiedy istnieje pismo, mamy źródła pisane — tak zaczyna się starożytność.
wybierz: Do czego władcy i kupcy potrzebowali pisma? | *do spisywania praw i umów | do rozpalania ognia | do polowań | do kopania kanałów !! Władcy spisywali prawa i swoje czyny, kupcy — umowy, a kapłani — modlitwy.
wybierz: Co zwykle oznaczał jeden znak pisma obrazkowego? | *jeden wyraz | jedną głoskę | jedno zdanie | jedną liczbę !! Dlatego pismo obrazkowe miało nawet kilka tysięcy znaków.
wybierz: Które pismo jest przykładem pisma obrazkowego? | *egipskie hieroglify | alfabet łaciński | alfabet grecki | alfabet fenicki !! Hieroglify i najstarsze pismo Sumerów to pisma obrazkowe.
wybierz: Jak powstało pismo klinowe? | *z uproszczenia pisma obrazkowego | z alfabetu greckiego | z hieroglifów | z cyfr arabskich !! W Mezopotamii obrazki zastąpiono kreskami odciskanymi na glinianych tabliczkach.
wybierz: Skąd wzięła się nazwa „pismo klinowe”? | *znaki miały kształt klinów | pisali nim tylko królowie | pisano je na murach | pisano je na papirusie !! Znaki miały trójkątny kształt przypominający kliny.
wybierz: Czym było pismo demotyczne? | *najprostszą odmianą pisma egipskiego | pismem Sumerów | alfabetem Fenicjan | pismem chińskim !! To pismo ludowe, używane na co dzień, na przykład do zapisywania umów handlowych.
wybierz: Z czego robiono papirus? | *z trzciny rosnącej nad Nilem | z kory drzew | z gliny | ze skóry zwierząt !! Z papirusu wytwarzano długie zwoje, na których zapisywano teksty.
wybierz: Kto stworzył pismo alfabetyczne? | *Fenicjanie | Sumerowie | Egipcjanie | Chińczycy !! Fenicjanie byli kupcami i żeglarzami ze wschodniego wybrzeża Morza Śródziemnego.
wybierz: Kiedy powstał alfabet fenicki? | *w XI wieku p.n.e. | około 4000 lat p.n.e. | w XVIII wieku p.n.e. | w I wieku n.e. !! Alfabet fenicki to najstarsze pismo alfabetyczne na świecie.
wybierz: Czego brakowało w alfabecie fenickim? | *liter dla samogłosek | liter dla spółgłosek | jakichkolwiek liter | znaków dla liczb !! Alfabet fenicki miał 22 litery — same spółgłoski.
wybierz: Ile liter miał alfabet fenicki? | *22 | 6000 | 7 | 60 !! Każdej głosce przypisano jedną literę, więc wystarczyło 22 znaki.
wybierz: Co do alfabetu dodali Grecy? | *samogłoski i znaki interpunkcyjne | 6 tysięcy znaków | cyfry rzymskie | hieroglify !! Grecy dodali też zasadę pisania od lewej strony. Fenicjanie pisali odwrotnie.
pary: Ułóż alfabety w kolejności powstania: połącz numer z alfabetem. >> 1 = fenicki ; 2 = grecki ; 3 = łaciński !! Fenicjanie stworzyli alfabet, Grecy go przejęli i dodali samogłoski, a od Greków przejęli go Rzymianie.
wybierz: Na jakim alfabecie opiera się alfabet polski? | *na łacińskim | na greckim | na fenickim | na cyrylicy !! Do liter łacińskich dodano znaki polskich dźwięków, na przykład ą, ę, ś, ź, ż.
wybierz: Z jakiego alfabetu powstała cyrylica? | *z greckiego | z łacińskiego | z hieroglifów | z pisma klinowego !! Nazwa cyrylicy pochodzi od imienia jednego z jej twórców, świętego Cyryla.
wybierz: Które narody używają cyrylicy? | *Rosjanie i Ukraińcy | Polacy i Czesi | Grecy i Włosi | Francuzi i Niemcy !! Cyrylicy używają też między innymi Białorusini, Serbowie i Bułgarzy.
wybierz: Co znaleziono w Egipcie w 1799 roku? | *Kamień z Rosetty | grobowiec Tutenchamona | terakotową armię | malowidła z Lascaux !! Dzięki Kamieniowi z Rosetty udało się odczytać hieroglify.
wybierz: Jakie pisma wyryto na Kamieniu z Rosetty? | *hieroglify, pismo demotyczne i grekę | pismo klinowe i alfabet | łacinę i chiński | trzy alfabety !! Ten sam tekst zapisano trzy razy. Napisy greckie uczeni umieli przeczytać.
wybierz: Kto odczytał egipskie hieroglify? | *Jean François Champollion | Howard Carter | Herodot | Kazimierz Michałowski !! Francuski uczony Champollion jest nazywany ojcem egiptologii.
wybierz: Jak nazywamy ramki z imionami władców w hieroglifach? | *kartusze | piktogramy | kliny | papirusy !! W kartuszach zapisywano imiona egipskich władców.
wpisz: Uzupełnij. >> Pismo, w którym jedna litera oznacza jedną głoskę, to pismo [alfabetyczne]. !! Tak działa alfabet: jedna głoska — jedna litera.
wpisz: Uzupełnij. >> Sumeryjskie znaki odciskane na glinianych tabliczkach to pismo [klinowe]. !! Znaki pisma klinowego przypominały kliny.
`,
  `
Przed pismem: malowidła w jaskiniach (Lascaux we Francji, około 15 tysięcy lat p.n.e.).
Pismo wymyślili Sumerowie około 4000 lat p.n.e. na Bliskim Wschodzie. Wynalezienie pisma kończy prehistorię i zaczyna starożytność.
Pismo obrazkowe: jeden znak = jeden wyraz (np. hieroglify). Pismo klinowe: uproszczone znaki na glinianych tabliczkach.
Egipt: hieroglify (uroczyste teksty) i pismo demotyczne (codzienne, na papirusie z trzciny znad Nilu).
Alfabet: Fenicjanie, XI wiek p.n.e., 22 litery bez samogłosek → Grecy (samogłoski, interpunkcja) → Rzymianie (alfabet łaciński) → alfabet polski.
Cyrylica powstała z alfabetu greckiego (Rosjanie, Ukraińcy, Białorusini, Serbowie, Bułgarzy).
Kamień z Rosetty (1799): hieroglify, pismo demotyczne i greka. Hieroglify odczytał Jean François Champollion.
`,
  `
# Najważniejsze
Zanim powstało pismo, ludzie malowali rysunki na ścianach jaskiń. Pismo wynaleźli Sumerowie około 4000 lat p.n.e.
Najstarsze pisma — sumeryjskie i egipskie hieroglify — były obrazkowe. Z uproszczenia obrazków powstało pismo klinowe.
W XI wieku p.n.e. Fenicjanie stworzyli alfabet. Grecy dodali samogłoski, a Rzymianie stworzyli alfabet łaciński — na nim opiera się alfabet polski.
## Daty
Około 15 tysięcy lat p.n.e.: Malowidła w jaskini Lascaux we Francji.
Około 4000 lat p.n.e.: Sumerowie wynajdują pismo — koniec prehistorii, początek starożytności.
XI wiek p.n.e.: Fenicjanie tworzą alfabet.
1799 rok: Odnalezienie Kamienia z Rosetty.
1824 rok: Champollion ogłasza, jak czytać hieroglify.
## Rodzaje pisma
Pismo obrazkowe: Jeden znak to zwykle jeden wyraz, więc znaków było kilka tysięcy. Przykład: hieroglify.
Pismo klinowe: Uproszczone znaki Sumerów — kreski odciskane na glinianych tabliczkach.
Pismo demotyczne: Najprostsze pismo egipskie, do codziennych zapisków na papirusie.
Pismo alfabetyczne: Jedna litera to jedna głoska. Alfabet fenicki miał 22 litery, same spółgłoski.
## Od Fenicjan do nas
Fenicjanie: Kupcy i żeglarze ze wschodniego wybrzeża Morza Śródziemnego — twórcy alfabetu.
Grecy: Dodali samogłoski i znaki interpunkcyjne. Pisali od lewej strony.
Rzymianie: Zmienili kształt liter — tak powstał alfabet łaciński.
Cyrylica: Powstała z alfabetu greckiego. Używają jej między innymi Rosjanie, Ukraińcy i Bułgarzy.
# Tak / nie tak
tak: Alfabet stworzyli Fenicjanie. | nie: Alfabet stworzyli Grecy. | bo: Grecy przejęli alfabet od fenickich kupców i dodali do niego samogłoski.
tak: Hieroglify to pismo obrazkowe. | nie: Hieroglify to alfabet. | bo: alfabet ma niewiele liter, a hieroglifów było około sześciu tysięcy.
tak: Alfabet polski pochodzi od łacińskiego. | nie: Alfabet polski pochodzi od cyrylicy. | bo: cyrylicy używają między innymi Rosjanie i Ukraińcy. My do liter łacińskich dodaliśmy tylko znaki takie jak ą, ę, ś.
# Zapamiętaj
Droga pisma: obrazki → kliny → litery. Alfabet szedł od Fenicjan przez Greków i Rzymian do nas.
Fenicjanie nie zapisywali samogłosek: słowo „pies” wyglądałoby u nich jak „ps”.
# Sprawdź się
wybierz: Na czym Egipcjanie zapisywali pismo demotyczne? | *na papirusie | na glinianych tabliczkach | na papierze !! Papirus robiono z trzciny rosnącej nad Nilem.
wybierz: Dlaczego Fenicjanie potrzebowali prostego pisma? | *do handlu, na przykład do zawierania umów | do ozdabiania grobowców | do zapisywania modlitw na murach !! Byli kupcami — potrzebowali pisma z niewielu znaków.
`,
);

// ─── Powtórka rozdziału: daty i pojęcia ───────────────────────────────────────

const POWTORKA = lekcja(
  'b-h5-r1-powtorka',
  70,
  'Pierwsze cywilizacje: daty i pojęcia',
  'Powtórka całego rozdziału przed sprawdzianem: oś czasu, liczenie lat przed naszą erą i najważniejsze pojęcia.',
  `
pary: Ułóż w kolejności: połącz numer z wydarzeniem. >> 1 = pojawienie się człowieka rozumnego ; 2 = początki rolnictwa ; 3 = wynalezienie pisma ; 4 = powstanie alfabetu fenickiego !! Około 200 tysięcy lat temu, około 10 tysięcy lat p.n.e., około 4000 lat p.n.e. i XI wiek p.n.e.
pary: Ułóż w kolejności: połącz numer z wydarzeniem. >> 1 = pierwsze państwa Sumerów ; 2 = powstanie Egiptu ; 3 = panowanie Hammurabiego ; 4 = panowanie Dawida i Salomona !! Około 3500 lat p.n.e., około 3000 lat p.n.e., XVIII wiek p.n.e. i X wiek p.n.e.
pary: Ułóż w kolejności: połącz numer z wydarzeniem. >> 1 = panowanie Hammurabiego ; 2 = wyjście Izraelitów z Egiptu ; 3 = powstanie alfabetu fenickiego ; 4 = zjednoczenie Chin !! XVIII, XIII, XI i III wiek p.n.e. — przed naszą erą im mniejsza liczba, tym później.
wybierz: Który wiek był wcześniej? | *XVIII wiek p.n.e. | X wiek p.n.e. !! Przed naszą erą liczymy wstecz: im większa liczba, tym dawniej.
wybierz: Co było wcześniej? | *III tysiąclecie p.n.e. | III wiek p.n.e. !! III tysiąclecie p.n.e. to lata 3000–2001 p.n.e., a III wiek p.n.e. — lata 300–201 p.n.e.
wybierz: Co oznacza skrót p.n.e.? | *przed naszą erą | po naszej erze | pierwsza nowa era | początek naszej epoki !! Lata przed naszą erą liczymy wstecz od roku 1.
wybierz: Który rok był wcześniej? | *3000 rok p.n.e. | 1200 rok p.n.e. !! Przed naszą erą większa liczba oznacza dawniejsze czasy.
wybierz: W którym wieku był rok 1450 p.n.e.? | *w XV wieku p.n.e. | w XIV wieku p.n.e. | w XVI wieku p.n.e. | w I wieku p.n.e. !! XV wiek p.n.e. to lata od 1500 do 1401 p.n.e., więc rok 1450 p.n.e. mieści się w tym wieku.
sortuj: Kto wierzył w wielu bogów, a kto w jednego? >> w wielu bogów = Egipcjanie, Sumerowie, hinduiści ; w jednego Boga = Izraelici !! Izraelici byli wyjątkiem: wierzyli w jednego Boga — Jahwe.
pary: Połącz pojęcie z wyjaśnieniem. >> politeizm = wiara w wielu bogów ; monoteizm = wiara w jednego Boga ; kasta = zamknięta grupa ludzi ; podatek = opłata dla państwa !! Poli — wiele, mono — jeden. Kasty były w Indiach, a podatki pobierali urzędnicy.
pary: Połącz lud z jego pismem lub wynalazkiem. >> Sumerowie = pismo klinowe ; Egipcjanie = hieroglify ; Fenicjanie = alfabet ; Chińczycy = papier !! Każdy z tych ludów dołożył coś ważnego do rozwoju pisma.
pary: Połącz rzekę z cywilizacją. >> Tygrys i Eufrat = Mezopotamia ; Nil = Egipt ; Indus = Indie ; Huang He = Chiny !! Wszystkie te cywilizacje powstały nad wielkimi rzekami.
pary: Połącz władcę z państwem. >> Hammurabi = Babilonia ; Hatszepsut = Egipt ; Dawid = Izrael !! Hammurabi rządził Babilonią, Hatszepsut — Egiptem, a Dawid — Izraelem.
wybierz: Jak nazywamy obowiązkową opłatę na rzecz państwa? | *podatek | kasta | plemię | cywilizacja !! Podatki pobierali urzędnicy już w miastach-państwach Sumerów.
wybierz: Co to jest plemię? | *grupa spokrewnionych rodów | rodzaj świątyni | miasto-państwo | zbiór praw !! Plemię to spokrewnione rody, które mieszkają na wspólnym terenie.
wybierz: Gdzie leży Bliski Wschód? | *na styku Europy, Azji i Afryki | we wschodniej Azji | w Ameryce | w środku Afryki !! Na Bliskim Wschodzie leży na przykład Mezopotamia.
wybierz: Jak nazywamy wschodnią Azję nad Oceanem Spokojnym? | *Daleki Wschód | Bliski Wschód | Mezopotamia | Ziemia Kanaan !! Na Dalekim Wschodzie powstała cywilizacja chińska.
wybierz: Co łączy Mezopotamię, Egipt, Indie i Chiny? | *powstały nad wielkimi rzekami | wszystkie miały alfabet | wierzyły w jednego Boga | leżały w Europie !! Wylewy rzek dawały żyzną ziemię, a z rolnictwa wyrastały miasta i państwa.
wybierz: Która z tych cywilizacji jest najstarsza? | *sumeryjska | egipska | chińska | izraelska !! Państwa Sumerów powstały około 3500 lat p.n.e., Egipt — około 3000 lat p.n.e.
wybierz: Ile lat trwa jedno tysiąclecie? | *1000 | 100 | 10 | 10 000 !! Tysiąclecie to tysiąc lat, a wiek — sto lat.
wpisz: Uzupełnij. >> Wiara w wielu bogów to [politeizm], a wiara w jednego Boga to [monoteizm]. !! Poli — wiele, mono — jeden.
`,
  `
Przed naszą erą (p.n.e.) liczymy lata wstecz: im większa liczba, tym dawniej. Wiek = 100 lat, tysiąclecie = 1000 lat.
Oś czasu: człowiek rozumny (200 tysięcy lat temu) → rolnictwo (10 tysięcy lat p.n.e.) → pismo (4000 lat p.n.e.) → Sumerowie (3500 lat p.n.e.) → Egipt (3000 lat p.n.e.).
Dalej: Indus i Chiny (III tysiąclecie p.n.e.) → Hammurabi (XVIII wiek p.n.e.) → Mojżesz (XIII wiek p.n.e.) → epoka żelaza (1200 lat p.n.e.).
Na koniec: alfabet fenicki (XI wiek p.n.e.) → Dawid i Salomon (X wiek p.n.e.) → zjednoczenie Chin (III wiek p.n.e.).
Pojęcia: cywilizacja, politeizm, monoteizm, kasta, podatek, plemię, Bliski i Daleki Wschód.
Rzeki: Tygrys i Eufrat — Mezopotamia, Nil — Egipt, Indus — Indie, Huang He i Jangcy — Chiny.
`,
  `
# Najważniejsze
Przed naszą erą (p.n.e.) lata liczymy wstecz: im większa liczba, tym dawniej. Rok 3000 p.n.e. był dawniej niż rok 1200 p.n.e.
Wiek to 100 lat, a tysiąclecie — 1000 lat. Wieki zapisujemy cyframi rzymskimi, na przykład XVIII wiek p.n.e.
Pierwsze cywilizacje — Mezopotamia, Egipt, Indie i Chiny — powstały nad wielkimi rzekami.
## Oś czasu rozdziału
Około 200 tysięcy lat temu: Pojawia się człowiek rozumny.
Około 10 tysięcy lat p.n.e.: Początki rolnictwa.
Około 4000 lat p.n.e.: Wynalezienie pisma.
Około 3500 lat p.n.e.: Pierwsze państwa Sumerów.
Około 3000 lat p.n.e.: Powstaje Egipt.
III tysiąclecie p.n.e.: Początki cywilizacji doliny Indusu i Chin.
XVIII wiek p.n.e.: Hammurabi rządzi Babilonią.
XIII wiek p.n.e.: Wyjście Izraelitów z Egiptu.
Około 1200 lat p.n.e.: Początek epoki żelaza.
XI wiek p.n.e.: Alfabet fenicki.
X wiek p.n.e.: Dawid i Salomon.
III wiek p.n.e.: Zjednoczenie Chin.
## Pojęcia z całego rozdziału
Cywilizacja: Rozwinięte społeczeństwo, które stworzyło własne państwo.
Politeizm: Wiara w wielu bogów (Egipcjanie, Sumerowie, hinduiści).
Monoteizm: Wiara w jednego Boga (Izraelici).
Kasta: Zamknięta grupa ludności w Indiach.
Podatek: Obowiązkowa opłata na rzecz państwa.
Plemię: Spokrewnione rody mieszkające na wspólnym terenie.
Bliski Wschód: Styk Europy, Azji i Afryki.
Daleki Wschód: Wschodnia Azja nad Oceanem Spokojnym.
# Tak / nie tak
tak: Rok 3000 p.n.e. był dawniej niż rok 1200 p.n.e. | nie: Rok 1200 p.n.e. był dawniej niż rok 3000 p.n.e. | bo: przed naszą erą liczymy wstecz od roku 1 — większa liczba oznacza dawniejsze czasy.
tak: III tysiąclecie p.n.e. było dawniej niż III wiek p.n.e. | nie: III wiek p.n.e. i III tysiąclecie p.n.e. to to samo. | bo: tysiąclecie to tysiąc lat, a wiek — sto lat.
tak: Najstarszą cywilizację stworzyli Sumerowie. | nie: Najstarszą cywilizacją był Egipt. | bo: państwa Sumerów powstały około 3500 lat p.n.e., a Egipt — około 3000 lat p.n.e.
# Zapamiętaj
Cztery rzeki, cztery cywilizacje: Tygrys i Eufrat — Mezopotamia, Nil — Egipt, Indus — Indie, Huang He i Jangcy — Chiny.
Lata przed naszą erą są jak odliczanie do startu: liczby maleją, a czas płynie do przodu.
# Sprawdź się
wybierz: Który wiek był najpóźniej? | *III wiek p.n.e. | XIII wiek p.n.e. | XVIII wiek p.n.e. !! Przed naszą erą mniejsza liczba oznacza czasy bliższe naszej ery.
wybierz: Ile lat ma jeden wiek? | *100 lat | 10 lat | 1000 lat !! Wiek to sto lat. Tysiąclecie — tysiąc lat.
`,
);

export const HISTORY_GRADE5: Topic[] = [LUDZIE, MEZOPOTAMIA, EGIPT, IZRAEL, INDIE_CHINY, PISMO, POWTORKA];
