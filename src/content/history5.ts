import type { Topic } from '../types';
import { builtin } from './util';

// Wspólne pytania przekrojowe są rozdzielone między sześć tematów, bez siódmej pozycji.

/** Opracowanie skanu rodzica z 12.10.2026. Zakres i źródła: docs/HISTORY_CHAPTER1.md. */
export const HISTORY_CHAPTER1 = 'Rozdział 1. Pierwsze cywilizacje';
function topic(id: string, order: number, title: string, description: string, dsl: string, guide: string, lesson: string): Topic {
  return { ...builtin(id, 'his', order, title, description, dsl, [5]), unit: HISTORY_CHAPTER1, guide: guide.trim(), lesson: lesson.trim(), updatedAt: '2026-10-12T16:00:00.000Z' };
}

const LUDZIE = topic('b-h5-r1-ludzie', 10, 'Życie pierwszych ludzi',
  'Poznaj drogę od wędrownego życia do stałych osad. Wyjaśnij, co zmieniło zdobywanie pożywienia, narzędzia i codzienne życie.', `
wybierz: Z którego kontynentu wywodzili się najdawniejsi przodkowie człowieka? | *z Afryki | z Europy | z Australii | z Ameryki !! Najstarszych przodków człowieka podręcznik umieszcza w Afryce.
wybierz: Kiedy żyli praludzie opisani w podręczniku? | *około 4 milionów lat temu | około 4 tysięcy lat temu | w X wieku p.n.e. | w XIX wieku !! Chodzi o miliony lat, znacznie wcześniejsze czasy niż początki państw.
wybierz: Kiedy pojawił się człowiek rozumny według osi czasu? | *około 200 tysięcy lat temu | około 200 lat temu | około 3000 lat p.n.e. | w III wieku p.n.e. !! Oś czasu podaje około 200 tysięcy lat temu, czyli długo przed rolnictwem.
wybierz: Dlaczego ogień ułatwiał zamieszkiwanie chłodnych okolic? | *pozwalał się ogrzać | nawadniał pola | zastępował ubrania w każdej pogodzie | wytwarzał zboże !! Ogień dostarczał ciepła, a także pomagał przygotowywać jedzenie i odstraszać zwierzęta.
wybierz: Co umożliwił rozwój mowy? | *przekazywanie informacji i doświadczeń | odlewanie brązu bez pieca | zapisywanie słów na papierze | budowanie piramid !! Mowa ułatwiała współpracę i uczenie kolejnych pokoleń; mowa i pismo to różne umiejętności.
wybierz: Jak zdobywali żywność ludzie przed rozwojem rolnictwa? | *zbierali rośliny i polowali | uprawiali tylko ryż | kupowali wszystko w miastach | pobierali podatki od rolników !! Zbieractwo i myślistwo wymagały szukania pożywienia w różnych miejscach.
wybierz: Dlaczego koczownicy nie budowali stałych domów? | *przenosili się w poszukiwaniu pokarmu | nie potrzebowali schronienia | mieszkali wyłącznie na morzu | wszyscy byli kupcami !! Częsta zmiana miejsca sprzyjała korzystaniu z jaskiń i tymczasowych szałasów.
wybierz: Co ludzie zauważyli przed rozpoczęciem uprawy zbóż? | *z ziaren wyrastają nowe rośliny | z gliny powstaje zboże | żelazo użyźnia każde pole | zwierzęta nie potrzebują pokarmu !! Obserwacja kiełkowania pozwoliła świadomie siać i zbierać plony.
wybierz: Kiedy narodziło się rolnictwo według podręcznika? | *około 10 tysięcy lat p.n.e. | około 1200 lat p.n.e. | w XVIII wieku p.n.e. | około 200 lat temu !! Oś czasu łączy około 10 tysięcy lat p.n.e. z początkiem rolnictwa.
wybierz: Co było najważniejszą zmianą rewolucji neolitycznej? | *przejście do uprawy, hodowli i osiadłego życia | powstanie alfabetu | budowa Wielkiego Muru | zjednoczenie Egiptu !! Rolnictwo i hodowla pozwoliły wytwarzać żywność i mieszkać przy polach.
wybierz: Dlaczego osady powstawały często przy rzekach i jeziorach? | *woda ułatwiała życie i uprawę ziemi | tam nie trzeba było zdobywać żywności | woda zastępowała wszystkie narzędzia | wszystkie rzeki miały słoną wodę !! Dostęp do wody był ważny dla mieszkańców, upraw i hodowanych zwierząt.
wybierz: Czym był pięściak? | *kamiennym narzędziem trzymanym w dłoni | naczyniem do przechowywania zboża | piecem do wytopu | budowlą obronną !! Pięściak miał ostre krawędzie i kształt dopasowany do dłoni.
wybierz: Jaką pracę wykonywano przy użyciu żaren? | *mielono ziarna na mąkę | budowano kanały | odciskano znaki pisma | wytapiano metal !! Ziarna rozcierano między kamieniami, aby otrzymać mąkę.
wybierz: Dlaczego nazwy epok zawierają kamień, brąz i żelazo? | *wskazują materiały narzędzi i broni | opisują kolory domów | są imionami wodzów | oznaczają rodzaje pożywienia !! Podział wiąże się z materiałem powszechnie używanym do wyrobu narzędzi i broni.
wybierz: Jakie zastosowanie miała dymarka? | *otrzymywano w niej żelazo z rudy | mielono w niej zboże | przechowywano w niej mumie | zapisywano w niej podatki !! Dymarka była dawnym piecem do otrzymywania żelaza; później kowal wykuwał przedmiot.
wybierz: Która data jest wcześniejsza: 10 000 czy 1200 p.n.e.? | *10 000 p.n.e. | 1200 p.n.e. | to ten sam rok | nie można porównać tych dat !! Przed naszą erą większa liczba oznacza wcześniejszy rok.
wpisz: Nazwij wędrowny sposób życia. >> Ciągłe zmienianie miejsca pobytu to tryb [koczowniczy]. !! Koczownicy przenosili się za pożywieniem.
wpisz: Nazwij zmianę sposobu życia. >> Stałe zamieszkanie w jednym miejscu to tryb [osiadły]. !! Rolnicy pozostawali blisko swoich pól i zwierząt.
wpisz: Uzupełnij skład stopu. >> Brąz otrzymuje się z miedzi i [cyny]. !! Dodanie cyny do miedzi pozwala otrzymać stop zwany brązem.
wpisz: Uzupełnij datę z osi czasu. >> Początek epoki żelaza: około [1200] lat p.n.e. !! W podręczniku opanowanie wytopu żelaza powiązano z tą przybliżoną datą.
pary: Połącz przedmiot z zastosowaniem. >> żarna = mielenie ziaren ; pięściak = cięcie kamienną krawędzią ; dymarka = otrzymywanie żelaza ; włócznia = polowanie !! Każdy przedmiot odpowiada innej potrzebie: żywności, obróbce lub polowaniu.
pary: Uporządkuj epoki od najwcześniejszej. >> 1 = epoka kamienia ; 2 = epoka brązu ; 3 = epoka żelaza !! Najpierw dominował kamień, potem brąz, a następnie żelazo.
sortuj: Przyporządkuj czynności do sposobu życia. >> koczowniczy = wędrówki za pokarmem, zbieractwo, polowania ; osiadły = uprawa pól, hodowla, budowa stałej osady !! Główna różnica to przemieszczanie się albo stałe mieszkanie przy źródłach pożywienia.
pary: Połącz pojęcie z opisem. >> ziemianka = dom częściowo zagłębiony w ziemi ; rolnictwo = uprawa roślin ; hodowla = utrzymywanie oswojonych zwierząt ; zbieractwo = szukanie jadalnych roślin !! Rolnictwo i hodowla to wytwarzanie pożywienia, a zbieractwo korzysta z dzikich zasobów.
`, `
Pochodzenie: Afryka, praludzie około 4 milionów lat temu; człowiek rozumny około 200 tysięcy lat temu.
Ogień: ciepło, przygotowanie mięsa, ochrona przed dzikimi zwierzętami. Mowa: współpraca i przekazywanie doświadczeń.
Przed rolnictwem: zbieractwo i myślistwo, wędrówki, szałasy lub jaskinie — tryb koczowniczy.
Około 10 tysięcy lat p.n.e.: początki rolnictwa. Uprawa i hodowla prowadzą do osiadłego życia — rewolucja neolityczna.
Osady blisko wody; ziemianka to dom częściowo zagłębiony w ziemi; żarna mielą ziarno.
Epoki: kamienia → brązu → żelaza. Brąz = miedź + cyna. Około 1200 lat p.n.e. — początek epoki żelaza w podręczniku. Dymarka = piec do otrzymywania żelaza.
`, `
# Najważniejsze
Przodkowie człowieka żyli najpierw w Afryce. Ogień i mowa ułatwiały im przetrwanie oraz współpracę.
Myśliwi i zbieracze wędrowali za pożywieniem. Rolnicy mogli mieszkać stale przy uprawach i zwierzętach.
Rewolucja neolityczna zmieniła sposób zdobywania żywności i życia. Narzędzia wykonywano kolejno głównie z kamienia, brązu i żelaza.
## Daty
Około 4 milionów lat temu: Najdawniejsi przodkowie człowieka w Afryce.
Około 200 tysięcy lat temu: Pojawienie się człowieka rozumnego według osi czasu.
Około 10 tysięcy lat p.n.e.: Początki rolnictwa.
Około 1200 lat p.n.e.: Początek epoki żelaza według podręcznika.
## Pojęcia
Koczowniczy: Wędrowny tryb życia, związany z poszukiwaniem pożywienia.
Osiadły: Stałe zamieszkanie w jednej osadzie.
Rewolucja neolityczna: Przejście do uprawy ziemi, hodowli i osiadłego życia.
Pięściak: Narzędzie z kamienia o ostrych krawędziach.
Żarna: Kamienie służące do rozcierania ziarna na mąkę.
## Epoki i materiały
Kamień: Najwcześniejszy z trzech omawianych materiałów narzędzi.
Brąz: Stop miedzi i cyny, wykorzystywany do broni, narzędzi i ozdób.
Żelazo: Materiał otrzymywany dawniej w dymarkach i obrabiany przez kowali.
# Krok po kroku
Ludzie obserwują, że z wysianych ziaren wyrastają rośliny.
Zaczynają uprawiać ziemię i hodować zwierzęta.
Pozostają blisko pól, zakładają osady i prowadzą osiadłe życie.
# Tak / nie tak
tak: Ogień umożliwiał ogrzanie się i pieczenie mięsa. | nie: Ogień od razu zastąpił rolnictwo. | bo: ogrzewanie i uprawianie roślin rozwiązują różne potrzeby; ogień znano przed rolnictwem.
tak: Rolnicy mieszkali przy swoich polach. | nie: Rolnicy co dzień przenosili pola w nowe miejsce. | bo: uprawy wymagały opieki w stałym miejscu.
tak: Brąz powstaje z miedzi i cyny. | nie: Brąz to drugi rodzaj kamienia. | bo: brąz jest stopem dwóch metali.
# Zapamiętaj
Pole zostaje na miejscu — rolnik także. To pomaga zapamiętać sens osiadłego życia.
K–B–Ż: kamień, brąz, żelazo. Przed naszą erą większa liczba oznacza wcześniejszą datę.
# Sprawdź się
wybierz: Rodzina zaczęła siać zboże i pilnować stada. Co prawdopodobnie zmieni w swoim życiu? | *osiądzie blisko pól | będzie codziennie szukać nowej jaskini | przestanie potrzebować wody !! Opieka nad uprawami i zwierzętami sprzyja stałej osadzie.
wybierz: W osadzie znaleziono dwa kamienie z resztkami ziarna. Jaką czynność mogą potwierdzać? | *przygotowywanie mąki | budowanie świątyni | zapisywanie praw !! Żarna rozcierają zboże na mąkę; ślady ziarna pomagają rozpoznać ich zastosowanie.
wybierz: Co było później według chronologii rozdziału? | *używanie żelaza około 1200 p.n.e. | początki rolnictwa około 10 000 p.n.e. | pojawienie się człowieka rozumnego !! Wydarzenia najbliższe naszej erze są późniejsze; 1200 p.n.e. następuje po 10 000 p.n.e.
`);

const MEZOPOTAMIA = topic('b-h5-r1-mezopotamia', 20, 'Miasta-państwa Mezopotamii',
  'Zrozum, jak wspólna praca przy uprawach prowadziła do powstania państw. Rozpoznawaj osiągnięcia i budowle opisane w tym temacie.', `
wybierz: Między którymi rzekami leżała Mezopotamia? | *Tygrysem i Eufratem | Nilem i Jordanem | Indusem i Nilem | Huang He i Jangcy !! Mezopotamia to kraina między Tygrysem i Eufratem na Bliskim Wschodzie.
wybierz: Co pozostawiały wylewające rzeki na polach? | *żyzny muł | warstwę żelaza | gotowe narzędzia | sól potrzebną do pisania !! Muł użyźniał ziemię, co sprzyjało rolnictwu i wysokim plonom.
wybierz: Po co kopano kanały nawadniające? | *żeby doprowadzać wodę do dalszych pól | żeby przechowywać dokumenty | żeby budować piramidy | żeby zastąpić targowiska !! Bez doprowadzenia wody gorące tereny oddalone od rzek były trudne do uprawiania.
wybierz: Dlaczego przy pracy nad kanałami potrzebny był zarządca? | *koordynował wspólną pracę wielu ludzi | woda sama wybierała króla | każdy pracował wyłącznie dla siebie | wszystkie pola były jednym domem !! Nadzór usprawniał pracę; władza zarządcy stopniowo obejmowała większy obszar.
wybierz: Który opis najlepiej odpowiada cywilizacji? | *rozwinięte społeczeństwo z miastami, pismem i państwem | pojedyncza rodzina w jaskini | samo wynalezienie włóczni | nazwa jednego metalu !! W podręczniku cywilizacja oznacza rozwinięte społeczeństwo tworzące własne państwo.
wybierz: Który lud stworzył pierwszą cywilizację Mezopotamii? | *Sumerowie | Fenicjanie | Egipcjanie | Chińczycy !! Najstarsze państwa tej krainy założyli Sumerowie.
wybierz: Kiedy zaczęły powstawać sumeryjskie miasta-państwa w Mezopotamii? | w połowie VI tysiąclecia p.n.e. | *w połowie IV tysiąclecia p.n.e. | w połowie II tysiąclecia p.n.e. | w połowie I tysiąclecia p.n.e. !! W połowie IV tysiąclecia p.n.e., czyli około 3500 r. p.n.e., w południowej Mezopotamii zaczęły powstawać sumeryjskie miasta-państwa. Każde obejmowało miasto i okoliczne ziemie oraz miało własną władzę.
wybierz: Co obejmowało sumeryjskie miasto-państwo? | *miasto i najbliższą okolicę | cały kontynent | wyłącznie pałac | wszystkie państwa świata !! Miasto-państwo było niewielkim samodzielnym państwem, a nie tylko zabudową miejską.
wybierz: Kto rządził sumeryjskim miastem-państwem? | *król | faraon Egiptu | cesarz Chin | każdy kupiec osobno !! Król kierował państwem, a urzędnicy wykonywali zadania administracyjne.
wybierz: Czym zajmowali się urzędnicy Sumerów? | *pobieraniem podatków i nadzorem pracy | wyłącznie wypiekiem chleba | budowaniem sarkofagów | przewodzeniem Ariom !! Urzędnicy pomagali władcy organizować pracę i zbierać środki na państwo.
wybierz: Co uważa się za najważniejsze dokonanie Sumerów? | *stworzenie pisma | stworzenie alfabetu łacińskiego | wynalezienie porcelany | budowę piramid w Gizie !! Pismo pozwoliło trwale zachowywać i przekazywać informacje.
wybierz: Do czego Sumerowie wykorzystywali koło? | *między innymi do wozów | do mumifikacji | do tworzenia Nilu | do zastąpienia wszystkich znaków pisma !! Wozy na kołach ułatwiały przewożenie ciężkich ładunków.
wybierz: Co usprawniało koło garncarskie? | *formowanie naczyń z gliny | liczenie dni w roku | budowę bramy Isztar bez cegieł | odlewanie złotych koron !! Obracanie gliny pozwalało wykonywać równe, okrągłe naczynia.
wybierz: Jaki ślad sumeryjskiego liczenia stosujemy przy mierzeniu czasu? | *60 minut w godzinie | 100 minut w godzinie | 22 godziny w dobie | 365 minut w godzinie !! Podstawą systemu Sumerów była liczba 60.
wybierz: Dlaczego miasto Ur rozwijało handel? | *było portem przy ujściu Eufratu | leżało na szczycie piramidy | nie miało kontaktu z wodą | produkowało wyłącznie papier !! Położenie blisko morza i rzeki sprzyjało wymianie towarów.
wybierz: Jakie znaczenie miał zikkurat? | *był świątynią górującą nad miastem | był grobem faraona | służył do produkcji papieru | był nazwą rzeki !! Schodkowy zikkurat pełnił funkcję religijną; najwyższa budowla mogła też chronić podczas powodzi.
wpisz: Nazwij daninę dla państwa. >> Obowiązkowa opłata w pieniądzach lub towarach to [podatek]. !! Podatki pokrywają wydatki państwa; zbierali je urzędnicy.
wpisz: Uzupełnij nazwę stolicy. >> Stolicą Babilonii był [Babilon]. !! Babilon słynął z pałaców, świątyń i murów obronnych.
wpisz: Uzupełnij imię władcy. >> Zbiór praw Babilonii nazywamy Kodeksem [Hammurabiego]. !! Hammurabi polecił spisać prawa, aby ujednolicić zasady w swoim państwie.
wpisz: Uzupełnij wiek panowania. >> Hammurabi rządził w [XVIII|18] wieku p.n.e. !! W podręczniku największą potęgę Babilonii powiązano z XVIII wiekiem p.n.e.
pary: Połącz wynalazek Sumerów z korzyścią. >> żagiel = żegluga ; koło = transport wozami ; koło garncarskie = wyrób naczyń ; pismo = zapis informacji !! Wynalazki ułatwiały pracę, przewóz i utrwalanie wiadomości.
pary: Połącz miejsce z jego funkcją. >> spichlerz = zapasy zboża ; zikkurat = kult religijny ; pałac = siedziba władcy ; targowisko = wymiana towarów !! Zapasy w spichlerzach pomagały przetrwać nieurodzaj, powódź lub wojnę.
wybierz: Co opisuje zasada oko za oko, ząb za ząb? | *odwetową karę odpowiadającą wyrządzonej krzywdzie | brak kar za przestępstwa | obowiązek płacenia samym zbożem | prawo wyboru cesarza !! Tak przedstawiono surowość Kodeksu Hammurabiego; nie oznacza to, że każde przewinienie miało identyczną karę.
sortuj: Rozdziel dokonania podane w rozdziale. >> Sumerowie = koło garncarskie, żagiel, system oparty na 60 ; Babilończycy = Kodeks Hammurabiego, kalendarz z siedmiodniowym tygodniem !! Babilończycy korzystali też z dorobku Sumerów i rozwijali matematykę oraz astronomię.
`, `
Mezopotamia: Bliski Wschód, między Tygrysem i Eufratem. Muł po wylewach użyźniał ziemię; kanały doprowadzały wodę do pól.
Wspólna praca → nadzór zarządcy → rosnąca władza → pierwsze państwa.
Sumerowie: połowa IV tysiąclecia p.n.e. (około 3500 p.n.e.). Miasto-państwo = miasto i okolica; król, urzędnicy, podatki.
Dokonania: pismo, koło, żagiel, koło garncarskie, liczenie oparte na 60. Godzina = 60 minut.
Ur: port i handel; zikkurat = świątynia; spichlerz = zapasy; król był też kapłanem.
Babilonia: II tysiąclecie p.n.e., stolica Babilon. Hammurabi: XVIII wiek p.n.e., zbiór surowych praw; zasada „oko za oko, ząb za ząb”.
Babilończycy rozwijali matematykę i obserwacje nieba; kalendarz z 12 miesiącami i tygodniem 7 dni.
`, `
# Najważniejsze
Wylewy Tygrysu i Eufratu sprzyjały uprawom. Kanały wymagały wspólnej pracy i organizacji, co pomagało powstawać państwom.
Sumerowie zakładali miasta-państwa i stworzyli wiele wynalazków, w tym pismo, koło oraz żagiel.
Późniejsza Babilonia miała stolicę w Babilonie. Hammurabi nakazał spisanie praw, a uczeni rozwijali matematykę i astronomię.
## Daty
Połowa IV tysiąclecia p.n.e.: Powstają państwa Sumerów, około 3500 p.n.e.
II tysiąclecie p.n.e.: Powstaje Babilonia.
XVIII wiek p.n.e.: Panowanie Hammurabiego.
## Pojęcia
Cywilizacja: Rozwinięte społeczeństwo z miastami, pismem i własnym państwem.
Miasto-państwo: Samodzielne państwo obejmujące miasto i jego najbliższą okolicę.
Podatek: Obowiązkowa opłata dla państwa.
Zikkurat: Kilkupiętrowa, schodkowa świątynia.
Kodeks: Zbiór spisanych praw.
## Jak działało miasto
Kanały: Doprowadzały wodę do pól.
Spichlerze: Przechowywały zboże na trudne czasy.
Targowiska: Umożliwiały wymianę towarów.
Urzędnicy: Pobierali podatki i pomagali zarządzać pracą.
# Krok po kroku
Rzeki użyźniają pola, ale dalej położone uprawy potrzebują kanałów.
Wiele osób pracuje razem; zarządca organizuje budowę i utrzymanie kanałów.
Władza zarządcy rozszerza się, a osady przekształcają się w miasta i państwa.
# Tak / nie tak
tak: Mezopotamia leżała między Tygrysem i Eufratem. | nie: Mezopotamia leżała nad Nilem. | bo: Nil wiąże się z Egiptem, a Tygrys i Eufrat z Mezopotamią.
tak: Miasto-państwo obejmowało również okolicę. | nie: Było samym pałacem króla. | bo: mieszkańcy potrzebowali pól, wody i zapasów, nie tylko siedziby władcy.
tak: Kodeks Hammurabiego zawierał prawa. | nie: Był alfabetem Sumerów. | bo: kodeks ustalał zasady i kary, a pismo służyło do ich zapisania.
# Zapamiętaj
Miasto-państwo = miasto + okolica + własna władza.
Sumerowie: koło, żagiel, pismo. Hammurabi: spisane prawa. Godzina z 60 minutami przypomina o sumeryjskim liczeniu.
# Sprawdź się
wybierz: Pole daleko od Eufratu wysycha. Jak mieszkańcy mogli rozwiązać ten problem? | *doprowadzić wodę kanałem | zbudować grobowiec | zrezygnować z organizacji pracy !! Kanał przenosi wodę z rzeki do dalszych upraw, a jego budowa wymaga współpracy.
wybierz: Zbliża się nieurodzaj. Który zasób miasta będzie szczególnie przydatny? | *zboże zgromadzone w spichlerzu | ozdoby na bramie | wysokość pałacu !! Zapasy żywności pomagają przetrwać okres słabych plonów.
wybierz: Co nastąpiło później: państwa Sumerów czy panowanie Hammurabiego? | *panowanie Hammurabiego | państwa Sumerów | oba w tym samym stuleciu !! Około 3500 p.n.e. jest wcześniej niż XVIII wiek p.n.e.
`);

const EGIPT = topic('b-h5-r1-egipt', 30, 'W Egipcie faraonów',
  'Wyjaśnij związek rzeki, władzy i wierzeń z życiem mieszkańców. Poznaj grupy społeczne oraz dorobek tej cywilizacji.', `
wybierz: Gdzie powstało państwo egipskie? | *w północnej Afryce nad Nilem | w Europie nad Dunajem | w Chinach nad Jangcy | w Indiach nad Indusem !! Egipt rozwijał się w dolinie Nilu; wokół terenów uprawnych rozciągała się pustynia.
wybierz: Kiedy powstał starożytny Egipt według podręcznika? | *około 3000 lat p.n.e. | około 1200 lat p.n.e. | w X wieku n.e. | w XVIII wieku n.e. !! Podręcznik wskazuje około 3000 p.n.e., czyli początki III tysiąclecia p.n.e.
wybierz: Co oznacza powiedzenie Egipt darem Nilu? | *rzeka umożliwiała rolnictwo i rozwój państwa | faraon dostał rzekę jako prezent | Nil był jedynym bogiem Egiptu | wszyscy mieszkańcy żyli na statkach !! Woda i żyzny muł po wylewach pozwalały uprawiać ziemię w otoczeniu pustyń.
wybierz: Dlaczego większość pól leżała blisko Nilu? | *potrzebowały wody i żyznej gleby | tam zawsze padał śnieg | faraon zakazał uprawy roślin | daleko od rzek rosły gotowe piramidy !! Kanały pomagały nawadniać pola, ale bez rzeki egipskie rolnictwo nie mogłoby się tak rozwinąć.
wybierz: Jak nazywano króla Egiptu? | *faraon | cesarz | prorok | kupiec !! Faraon był władcą państwa egipskiego.
wybierz: Jaki zakres władzy miał faraon? | *ustanawiał prawa, sądził i kierował wojskiem | jedynie sprzedawał zboże | zarządzał tylko jedną rodziną | wykonywał polecenia wszystkich chłopów !! Faraon skupiał władzę i był także najwyższym kapłanem.
wybierz: Która grupa była najliczniejsza w Egipcie? | *chłopi | faraonowie | urzędnicy | niewolnicy !! Podstawę społeczeństwa stanowili chłopi uprawiający ziemię.
wybierz: Co należało do zadań kapłanów? | *obrzędy religijne i doradzanie władcy | wyłącznie służba wojskowa | dowodzenie Ariami | tworzenie alfabetu fenickiego !! Kapłani należeli do wykształconych grup; prowadzili również szkoły i obserwacje nieba.
wybierz: Dlaczego faraon potrzebował urzędników? | *pomagali mu zarządzać państwem | zastępowali Nil | dostarczali papier wynaleziony w Europie | wszyscy byli niewolnikami !! Urzędnicy umieli czytać i pisać oraz wykonywali zadania administracyjne.
wybierz: Co wykonywali rzemieślnicy? | *narzędzia, ubrania i naczynia | wyłącznie prawa państwowe | ruchy gwiazd | wylewy rzeki !! Rzemieślnicy wytwarzali przedmioty potrzebne w codziennym życiu.
wybierz: Kogo najczęściej czyniono niewolnikami? | *jeńców wojennych | każdego kapłana | wszystkich faraonów | wyłącznie kupców fenickich !! Według podręcznika niewolników było niewielu, a wielu z nich pochodziło z niewoli wojennej.
wybierz: Co oznacza politeizm Egipcjan? | *wiarę w wielu bogów | wiarę w jednego Boga | brak wszelkich wierzeń | nazwę kalendarza !! Politeizm przeciwstawiamy monoteizmowi, czyli wierze w jednego Boga.
wybierz: Z czym wiązano boga Ra? | *ze słońcem | z alfabetem | z kołem garncarskim | z Jedwabnym Szlakiem !! Ra był bóstwem słońca i jednym z najważniejszych bogów egipskich.
wybierz: Jaką rolę pełnił Ozyrys w wierzeniach Egipcjan? | *osądzał zmarłych | był królem Babilonii | zbudował Wielki Mur | wymyślił alfabet łaciński !! Egipcjanie wierzyli, że Ozyrys decyduje o losie człowieka po śmierci.
wybierz: Dlaczego mumifikowano ciała? | *wierzono, że zachowanie ciała jest ważne dla życia po śmierci | chciano przekształcić ludzi w kamień | brakowało narzędzi rolniczych | służyło to nawadnianiu pól !! Mumifikacja wynikała z wierzeń; zabezpieczała zwłoki przed rozkładem.
wybierz: Jaką funkcję pełniły piramidy? | *grobowców niektórych faraonów | magazynów papieru | siedzib wszystkich chłopów | targowisk Mezopotamii !! Piramidy budowano dla władców, a nie jako zwykłe mieszkania.
wpisz: Uzupełnij nazwę ozdobnej trumny. >> Mumię umieszczano w [sarkofagu]. !! Sarkofag to trumna; piramida jest budowlą, w której mógł się znajdować.
wpisz: Podaj nazwę procesu. >> Zabezpieczanie ciała zmarłego przed rozkładem to [mumifikacja]. !! W Egipcie ciało balsamowano i owijano bandażami.
wpisz: Uzupełnij długość roku. >> Kalendarz egipski liczył [365] dni. !! Dwanaście miesięcy po 30 dni dawało 360, a dodawano jeszcze 5 dni.
wpisz: Uzupełnij nazwę pisma. >> Egipskie pismo obrazkowe nazywano [hieroglifami]. !! Hieroglify służyły między innymi do zapisywania dokumentów i tekstów religijnych.
pary: Połącz grupę społeczną z zadaniem. >> chłopi = uprawa ziemi ; żołnierze = obrona państwa ; urzędnicy = zarządzanie i dokumenty ; kapłani = obrzędy religijne !! Grupy różniły się obowiązkami i pozycją w społeczeństwie.
pary: Połącz pojęcie z właściwym opisem. >> faraon = król Egiptu ; mumia = zachowane ciało zmarłego ; sarkofag = ozdobna trumna ; piramida = monumentalny grobowiec !! Nie myl ciała, trumny i budowli: to trzy różne rzeczy.
wybierz: Czym był Wielki Sfinks? | *posągiem lwa z ludzką głową | świątynią Sumerów | glinianą tabliczką | grobem Hammurabiego !! Sfinks stoi w Gizie i jest związany z egipskimi piramidami.
sortuj: Wybierz dokonania właściwej cywilizacji. >> Egipt = hieroglify, mumifikacja, piramidy, kalendarz 365 dni ; Chiny = porcelana, proch strzelniczy !! Podział pomaga rozpoznać dorobek poszczególnych cywilizacji.
`, `
Egipt: północna Afryka, dolina Nilu; państwo około 3000 p.n.e. Wylewy nawadniały i użyźniały pola — „Egipt darem Nilu”.
Faraon: król, nieograniczona władza, prawa, sądy, wojsko i funkcja kapłańska.
Kapłani i urzędnicy: grupy wykształcone. Rzemieślnicy: wyroby. Żołnierze: obrona. Chłopi: najliczniejsi, uprawa i praca przy kanałach. Niewolnicy: głównie jeńcy.
Politeizm = wielu bogów. Ra — słońce; Ozyrys — sąd nad zmarłymi. Wiara w życie po śmierci sprzyjała mumifikacji.
Mumia = zabezpieczone ciało; sarkofag = trumna; piramida = grobowiec. Piramidy Cheopsa i Chefrena w Gizie — III tysiąclecie p.n.e.; Sfinks = lew z ludzką głową.
Dorobek: hieroglify, budownictwo, matematyka, medycyna, astronomia i rok 365 dni (12 × 30 + 5).
Ciekawostki ze skanu: Hatszepsut rządziła w XV wieku p.n.e.; Howard Carter odkrył grobowiec Tutenchamona w 1922 roku.
`, `
# Najważniejsze
Nil zapewniał wodę i użyźniał ziemię, więc rolnictwo mogło utrzymywać państwo otoczone pustyniami.
Faraon skupiał władzę. Kapłani, urzędnicy, chłopi, rzemieślnicy, żołnierze i niewolnicy mieli różne zadania.
Wielu bogów i wiara w życie po śmierci wpływały na mumifikację oraz budowę grobowców. Egipcjanie rozwinęli też naukę i pismo.
## Daty
Około 3000 p.n.e.: Powstanie państwa egipskiego.
III tysiąclecie p.n.e.: Budowa największych piramid w Gizie.
XV wiek p.n.e.: Panowanie Hatszepsut.
1922 rok: Odkrycie grobowca Tutenchamona przez Howarda Cartera.
## Pojęcia
Faraon: Król Egiptu, skupiający władzę w państwie.
Politeizm: Wiara w wielu bogów.
Mumifikacja: Zabezpieczanie zwłok przed rozkładem.
Sarkofag: Ozdobna trumna, a nie budowla.
Hieroglify: Egipskie znaki pisma obrazkowego.
## Społeczeństwo
Kapłani i urzędnicy: Wykształcone grupy, wspierające rządzenie i kult religijny.
Chłopi: Najliczniejsi; uprawiali ziemię i pracowali przy kanałach oraz budowlach.
Rzemieślnicy i żołnierze: Wytwarzanie przedmiotów oraz obrona państwa.
Niewolnicy: Głównie jeńcy wojenni, często służący w zamożnych domach.
# Krok po kroku
Nil wylewa i zostawia na polach żyzny muł.
Rolnicy uprawiają ziemię, a wspólna praca utrzymuje kanały nawadniające.
Wierzenia skłaniają do zachowania ciała zmarłych oraz budowy grobowców.
# Tak / nie tak
tak: Nil umożliwiał rozwój upraw. | nie: Egipt rozwinął rolnictwo bez związku z rzeką. | bo: poza doliną Nilu przeważały tereny pustynne.
tak: Mumia to ciało, a sarkofag to trumna. | nie: Mumia to nazwa piramidy. | bo: przygotowanie ciała, trumna i grobowiec są różnymi elementami pochówku.
tak: Egipcjanie czcili wielu bogów. | nie: Egipcjanie czcili wyłącznie Ozyrysa. | bo: oprócz Ozyrysa czczono między innymi Ra; na tym polega politeizm.
# Zapamiętaj
Ciało → trumna → grobowiec: mumia → sarkofag → piramida.
Nil daje wodę i żyzną ziemię. Stąd porównanie Egiptu do daru rzeki.
# Sprawdź się
wybierz: Rolnik czeka, aż opadną wody Nilu. Co chce wykorzystać? | *żyzny muł na polach | nowy alfabet | gotowe sarkofagi !! Wylew pozostawia warstwę użyźniającą ziemię, na której można siać.
wybierz: Uczeń twierdzi, że piramidy powstały tylko jako twierdze. Co poprawi tę wypowiedź? | *były grobowcami niektórych władców | były szkołami wszystkich dzieci | były miejscem hodowli ryżu !! Ich główna omawiana funkcja to pochówek faraona, związany z wierzeniami pozagrobowymi.
wybierz: Jaka obserwacja łączy egipską religię z medycyną? | *przy mumifikacji poznawano budowę ciała | kapłani wynaleźli porcelanę | Nil składał się z lekarstw !! Praca przy zabezpieczaniu zwłok dostarczała wiedzy o ludzkim ciele.
`);

const IZRAEL = topic('b-h5-r1-izrael', 40, 'W starożytnym Izraelu',
  'Poznaj główne postacie, etapy dziejów i pojęcia religijne. Porównuj wierzenia oraz odróżniaj przekaz biblijny od potwierdzonego opisu wydarzeń.', `
wybierz: Jak inaczej nazywamy Izraelitów w tym rozdziale? | *Żydami | Sumerami | Ariami | Fenicjanami !! Izraelici i Żydzi to nazwy odnoszące się tutaj do omawianego ludu.
wybierz: Jak nazywano w starożytności Ziemię Kanaan? | *tak określano obszar Palestyny | była to nazwa Chin | była to nazwa Nilu | była to nazwa Babilonii !! Podręcznik wiąże Kanaan z Palestyną nad wschodnią częścią Morza Śródziemnego.
wybierz: Kto według przekazu biblijnego poprowadził lud do Kanaan? | *Abraham | Hammurabi | Cheops | Howard Carter !! Najdawniejsze dzieje Izraelitów znamy w dużej mierze z tradycji biblijnej.
wybierz: Która rzeka jest związana z Palestyną? | *Jordan | Nil | Eufrat | Indus !! Palestyna leży między Jordanem a wschodnim wybrzeżem Morza Śródziemnego.
wybierz: Kto według Biblii przewodził wyjściu Izraelitów z Egiptu? | *Mojżesz | Dawid | Salomon | Ra !! Mojżesz jest w tradycji biblijnej przywódcą wyjścia z niewoli egipskiej.
wybierz: Z którym okresem podręcznik wiąże wyjście Izraelitów z Egiptu? | *około XIII wieku p.n.e. | z III wiekiem n.e. | z XIX wiekiem n.e. | z rokiem 1922 !! Podręcznik podaje przybliżony XIII wiek p.n.e.; najdawniejsze dzieje są opisane przede wszystkim w Biblii.
wybierz: Którzy królowie rządzili w okresie świetności Izraela opisanym w Biblii? | *Dawid i Salomon | Cheops i Chefren | Hammurabi i Ozyrys | Abraham i Carter !! Dawid i jego syn Salomon są łączeni z około X wiekiem p.n.e.
wybierz: Co podręcznik przypisuje królowi Dawidowi? | *zjednoczenie plemion i uczynienie Jerozolimy stolicą | wynalezienie papieru | budowę piramidy w Gizie | stworzenie koła !! To główne dokonania Dawida przedstawione w tym temacie.
wybierz: Kim był Salomon w stosunku do Dawida? | *jego synem i następcą | jego egipskim kapłanem | jego rzymskim przeciwnikiem | władcą Mezopotamii !! Salomon objął władzę po ojcu, Dawidzie.
wybierz: Jakie wydarzenie rozpoczęło niewolę babilońską? | *zdobycie Jerozolimy i uprowadzenie Izraelitów | wynalezienie brązu | upadek Wielkiego Muru | odkrycie grobowca Tutenchamona !! Babilończycy zdobyli miasto na początku VI wieku p.n.e.
wybierz: Który lud podbił Palestynę w I wieku p.n.e.? | *Rzymianie | Sumerowie | Chińczycy | Egipcjanie Cheopsa !! Podręcznik omawia późniejsze powstania przeciw Rzymowi i rozproszenie Żydów.
wybierz: Jak nazywa się religia Izraelitów? | *judaizm | hinduizm | politeizm egipski | pismo demotyczne !! Judaizm jest religią monoteistyczną.
wybierz: Co oznacza monoteizm? | *wiarę w jednego Boga | wiarę w wielu bogów | zamkniętą grupę zawodową | zbiór przepisów handlowych !! Mono oznacza jeden; politeizm odnosi się do wielu bogów.
wybierz: Jakim imieniem Izraelici określali Boga? | *Jahwe | Ra | Ozyrys | Brahma !! W wierzeniach judaizmu Jahwe jest jedynym Bogiem.
wybierz: Czym jest Tora? | *pierwszymi pięcioma księgami Biblii hebrajskiej | nazwą piramidy | rzeką w Indiach | całym Kodeksem Hammurabiego !! Tora jest nazywana Pięcioksięgiem; nie oznacza całej Biblii hebrajskiej.
wybierz: Co zawiera Dekalog? | *Dziesięć Przykazań | wykaz podatków Sumerów | 22 litery alfabetu | egipski kalendarz !! Dekalog to najważniejsze przykazania przedstawione w tradycji Mojżesza.
wpisz: Uzupełnij nazwę stolicy Dawida. >> Stolicą jego państwa była [Jerozolima]. !! To miasto odegrało główną rolę polityczną i religijną w opisie Izraela.
wpisz: Nazwij zbiór przykazań. >> Dziesięcioro Przykazań to [Dekalog]. !! Tę nazwę odnosimy do przykazań, a Torę do pięciu ksiąg.
wpisz: Uzupełnij nazwę skrzyni. >> Według Biblii tablice z przykazaniami przechowywano w Arce [Przymierza]. !! Arka Przymierza była skrzynią, którą umieszczono w świątyni.
wpisz: Nazwij świecznik. >> Siedmioramienny świecznik to [menora]. !! Menora jest jednym z symboli judaizmu.
pary: Połącz postać z dokonaniem opisanym w rozdziale. >> Abraham = wędrówka do Kanaan ; Mojżesz = wyjście z Egiptu ; Dawid = Jerozolima jako stolica ; Salomon = budowa świątyni !! To skojarzenia wynikające z przedstawionego w podręczniku przekazu biblijnego.
pary: Połącz pojęcia religijne z opisem. >> judaizm = religia Izraelitów ; monoteizm = wiara w jednego Boga ; Dekalog = Dziesięć Przykazań ; Tora = Pięcioksiąg !! Pojęcia dotyczą różnych rzeczy: religii, rodzaju wierzeń, przykazań i ksiąg.
sortuj: Rozróżnij nazwy związane z dwiema cywilizacjami. >> Izrael = Jahwe, Tora, menora, Jerozolima ; Egipt = Ra, Ozyrys, faraon !! Izraelici wyznawali monoteizm, a Egipcjanie politeizm.
pary: Uporządkuj wydarzenia w tradycji opisanej w podręczniku. >> 1 = wędrówka Abrahama do Kanaan ; 2 = wyjście z Egiptu pod wodzą Mojżesza ; 3 = rządy Dawida i Salomona ; 4 = niewola babilońska !! Wyjście z Egiptu wiązano z XIII wiekiem p.n.e., królewski okres z X, a niewolę z VI.
`, `
Izraelici = Żydzi. Palestyna (Ziemia Kanaan) — między Jordanem i wschodnim wybrzeżem Morza Śródziemnego.
Przekaz biblijny: Abraham prowadzi lud do Kanaan; Mojżesz przewodzi wyjściu z Egiptu (podręcznik: około XIII wieku p.n.e.).
Dawid i Salomon: około X wieku p.n.e. Dawid zjednoczył plemiona i ustanowił stolicę w Jerozolimie; Salomon zbudował świątynię.
Początek VI wieku p.n.e.: niewola babilońska. Później podboje, panowanie Rzymu i rozproszenie Żydów.
Judaizm: monoteizm, jeden Bóg — Jahwe. Politeizm = wielu bogów, np. w Egipcie.
Biblia hebrajska = święte księgi; Tora = pierwsze pięć ksiąg. Dekalog = Dziesięć Przykazań. Arka Przymierza = skrzynia z tablicami według Biblii.
Menora = siedmioramienny świecznik. Prorok = przywódca religijny przekonany o posłannictwie; Mesjasz = oczekiwany wybawiciel.
`, `
# Najważniejsze
Historia Izraelitów obejmuje wędrówki, powstanie państwa i utratę samodzielności. Najdawniejsze wydarzenia znamy głównie z Biblii.
Judaizm wyróżniał się wiarą w jednego Boga, podczas gdy wiele sąsiednich ludów czciło licznych bogów.
Nie myl ksiąg, przykazań i przedmiotów: Tora to pięć ksiąg, Dekalog to przykazania, a Arka Przymierza jest skrzynią opisaną w Biblii.
## Daty
Około XIII wieku p.n.e.: Wyjście Izraelitów z Egiptu według datowania podręcznika.
Około X wieku p.n.e.: Dawid i Salomon — okres świetności przedstawiony w Biblii.
Początek VI wieku p.n.e.: Zdobycie Jerozolimy przez Babilończyków.
I wiek p.n.e.: Palestyna podbita przez Rzymian.
## Postacie
Abraham: W tradycji biblijnej ojciec narodu i przywódca wędrówki do Kanaan.
Mojżesz: Przywódca wyjścia z Egiptu; tradycja łączy go z Dekalogiem.
Dawid: Zjednoczenie plemion i stolica w Jerozolimie.
Salomon: Następca Dawida, związany z budową świątyni.
## Pojęcia
Monoteizm: Wiara w jednego Boga.
Judaizm: Religia Izraelitów.
Tora: Pierwsze pięć ksiąg Biblii hebrajskiej.
Dekalog: Dziesięć Przykazań.
Prorok i Mesjasz: Przywódca religijny oraz oczekiwany wybawiciel.
# Krok po kroku
Uporządkuj główne postacie: Abraham, Mojżesz, Dawid, Salomon.
Do każdej dopasuj rolę: Kanaan, wyjście z Egiptu, stolica, świątynia.
Porównaj religie: Izrael — jeden Bóg; Egipt — wielu bogów.
# Tak / nie tak
tak: Judaizm jest monoteistyczny. | nie: Jahwe był jednym z wielu bogów judaizmu. | bo: judaizm uznaje jednego Boga.
tak: Tora to pięć ksiąg Biblii hebrajskiej. | nie: Tora to nazwa całej Biblii. | bo: Pięcioksiąg jest częścią większego zbioru ksiąg.
tak: Najdawniejsze dzieje przedstawia przede wszystkim Biblia. | nie: Wszystkie szczegóły są jednakowo potwierdzone przez badaczy. | bo: sam podręcznik zaznacza, że najstarsze dzieje są słabo znane.
# Zapamiętaj
Mono = jeden, poli = wiele. Nie są to nazwy konkretnych bogów.
Abraham — droga; Mojżesz — wyjście; Dawid — stolica; Salomon — świątynia.
# Sprawdź się
wybierz: Kolega przypisał Abrahamowi wyjście z niewoli egipskiej. Jak go poprawisz? | *ten przekaz dotyczy Mojżesza | dotyczy Hammurabiego | dotyczy faraona Cheopsa !! Abraham i Mojżesz mają różne role w biblijnych dziejach Izraelitów.
wybierz: Uczennica porównuje Ra i Ozyrysa z Jahwe. Co powinna zauważyć? | *wielość bogów w Egipcie i jednego Boga w judaizmie | identyczny politeizm obu religii | że Tora jest egipską trumną !! Porównanie dotyczy różnicy między politeizmem a monoteizmem.
wybierz: Co było później według dat podręcznika? | *niewola babilońska w VI wieku p.n.e. | rządy Dawida w X wieku p.n.e. | wyjście z Egiptu w XIII wieku p.n.e. !! Przed naszą erą VI wiek jest późniejszy niż X i XIII.
`);

const INDIE_CHINY = topic('b-h5-r1-indie-chiny', 50, 'Cywilizacje Indii i Chin',
  'Porównaj dwa obszary, organizację społeczeństw i ich osiągnięcia. Wyjaśnij rolę handlu oraz dopasowuj wynalazki do właściwych cywilizacji.', `
wybierz: Nad którą rzeką rozwinęła się pierwsza omawiana cywilizacja Indii? | *nad Indusem | nad Nilem | nad Jordanem | nad Eufratem !! Cywilizacja doliny Indusu rozwijała się w Azji na obszarze dzisiejszych Indii i Pakistanu.
wybierz: Kiedy narodziła się cywilizacja doliny Indusu? | *w III tysiącleciu p.n.e. | w III wieku n.e. | w XIX wieku | w XI wieku n.e. !! Nie myl tysiąclecia z wiekiem: III tysiąclecie p.n.e. jest znacznie wcześniejsze.
wybierz: Co wyróżniało miasta nad Indusem? | *wodociągi i kanalizacja | wyłącznie szałasy bez ulic | piramidy faraonów | brak rzemiosła !! Wodociągi dostarczały wodę do domów, a kanalizacja odprowadzała nieczystości.
wybierz: Z jakiego materiału wznoszono tam wiele budynków? | *z wypalanej cegły | wyłącznie z jedwabiu | wyłącznie z brązu | z papieru !! Zabudowa miejska i infrastruktura świadczą o rozwiniętej cywilizacji.
wybierz: Które miasto należało do cywilizacji doliny Indusu? | *Mohendżo Daro | Jerozolima | Giza | Babilon !! W skanie opisano jego uporządkowaną zabudowę, cytadelę i łaźnię.
wybierz: Z jakim ludem podręcznik wiąże podbój doliny Indusu około 1500 p.n.e.? | *z Ariami | z Fenicjanami | z Sumerami | z Egipcjanami !! W szkolnym opisie Ariowie pojawiają się w II tysiącleciu p.n.e.
wybierz: Czym były kasty? | *zamkniętymi grupami społecznymi | rzekami Chin | świątyniami Egiptu | rodzajami alfabetu !! Grupy odróżniały obyczaje i zajęcia, a przynależność dziedziczono.
wybierz: Jak uzyskiwano przynależność do kasty w opisanym systemie? | *dziedziczono ją po rodzicach | losowano ją każdego dnia | kupowano razem z koniem | wybierano ją w wyborach cesarza !! Dziedziczność i ograniczenie kontaktów utrwalały podział społeczeństwa.
wybierz: Jakie ograniczenie wiązało się z systemem kastowym? | *zakazy małżeństw między kastami | obowiązek pisania wyłącznie hieroglifami | zakaz korzystania z rzek | nakaz mieszkania w piramidach !! System ograniczał relacje między różnymi grupami ludności.
wybierz: Jak nazywa się religia Indii omawiana w rozdziale? | *hinduizm | judaizm | alfabet | kalendarz !! W szkolnym opisie hinduizm łączy wiele bóstw i wiarę w kolejne wcielenia.
wybierz: Co oznacza wiara w reinkarnację? | *odrodzenie duszy w kolejnym wcieleniu | budowę nowego kanału | dziedziczenie alfabetu | wybór nowego cesarza !! Reinkarnacja dotyczy wierzeń o losie duszy po śmierci.
wybierz: Które osiągnięcie matematyczne wiąże się z Indiami? | *system dziesiętny | sumeryjski system oparty na 60 | egipska mumifikacja | alfabet fenicki !! System dziesiętny upowszechnili później Arabowie, stąd określenie cyfr arabskich.
wybierz: Nad którymi rzekami rozwijała się cywilizacja chińska? | *Huang He i Jangcy | Nil i Jordan | Tygrys i Eufrat | Indus i Nil !! Huang He to Żółta Rzeka, a Jangcy jest także nazywana Błękitną Rzeką.
wybierz: Kiedy według podręcznika zjednoczono Chiny? | *w III wieku p.n.e. | w III tysiącleciu n.e. | w X wieku p.n.e. | w roku 1922 !! III tysiąclecie p.n.e. to początki cywilizacji, a III wiek p.n.e. to zjednoczenie państwa.
wybierz: Kto stanął na czele zjednoczonych Chin? | *cesarz | faraon | prorok Mojżesz | król Hammurabi !! Władcę cesarstwa nazywamy cesarzem.
wybierz: Po co budowano umocnienia Wielkiego Muru? | *dla ochrony przed najazdami z północy | żeby nawadniać Egipt | żeby przechowywać Torę | żeby odprowadzać wodę z miast Indusu !! Mur i fortyfikacje miały funkcję obronną.
wpisz: Uzupełnij nazwę drogi handlowej. >> Trasę łączącą handel Chin i Zachodu nazywamy Jedwabnym [Szlakiem]. !! Nazwa odwołuje się do cennej tkaniny sprowadzanej z Chin.
wpisz: Nazwij tkaninę. >> Delikatna tkanina wytwarzana w Chinach to [jedwab]. !! Handel jedwabiem przynosił duże dochody, dlatego strzeżono tajemnicy jego produkcji.
wpisz: Uzupełnij nazwę wynalazku. >> Chińska igła magnetyczna pomagała określać [kierunki|kierunki świata]. !! Igła magnetyczna jest związana z rozwojem orientacji i kompasu.
wpisz: Nazwij tworzywo figurek armii cesarza. >> Figury wykonano z wypalonej gliny, czyli [terakoty]. !! Terakotowa armia została umieszczona przy grobowcu pierwszego cesarza.
pary: Połącz cywilizację z rzekami. >> Mezopotamia = Tygrys i Eufrat ; Egipt = Nil ; dolina Indusu = Indus ; Chiny = Huang He i Jangcy !! Rzeki dawały wodę, sprzyjały rolnictwu oraz komunikacji.
pary: Połącz bóstwa hinduistyczne z rolą w szkolnym opisie. >> Brahma = stwórca świata ; Wisznu = utrzymuje świat przy życiu ; Sziwa = bóstwo śmierci i zagłady !! Te trzy przykłady pokazują różnorodność bóstw w hinduizmie omawianym w podręczniku.
sortuj: Przyporządkuj osiągnięcia i cechy. >> Indie = miasta doliny Indusu, system dziesiętny, system kastowy ; Chiny = papier, porcelana, proch strzelniczy, jedwab !! Nie przypisuj chińskich wynalazków mieszkańcom doliny Indusu.
wybierz: Dlaczego jedwab i porcelana były poszukiwane na Zachodzie? | *były cenionymi wyrobami, których wytwarzanie długo pozostawało chińską specjalnością | były powszechnym piaskiem | zastępowały wszystkie rośliny | zawsze rozdawano je bezpłatnie !! Daleki transport i cenione umiejętności wytwarzania podnosiły ich wartość.
`, `
Dolina Indusu: III tysiąclecie p.n.e.; miasta z wypalanej cegły, wodociągi, kanalizacja, rzemiosło i handel. Przykład: Mohendżo Daro.
Ariowie: około 1500 p.n.e. w szkolnym opisie. Kasty: zamknięte, dziedziczne grupy, różne zajęcia i obyczaje; zakazy małżeństw między grupami.
Hinduizm: w rozdziale przedstawiony jako politeistyczny; Brahma, Wisznu, Sziwa. Reinkarnacja = kolejne wcielenie duszy.
Indie: rozwój matematyki i systemu dziesiętnego, upowszechnionego później przez Arabów.
Chiny: Huang He i Jangcy; początki w III tysiącleciu p.n.e.; zjednoczenie w III wieku p.n.e.; władca — cesarz.
Wielki Mur: obrona przed najazdami z północy. Wynalazki: papier, porcelana, proch, igła magnetyczna i druk; słynna tkanina — jedwab.
Jedwabny Szlak: handel między Wschodem a Zachodem. Terakotowa armia: gliniane figury przy grobowcu cesarza.
`, `
# Najważniejsze
Cywilizacje Indii i Chin rozwijały się nad wielkimi rzekami. W miastach doliny Indusu istniały wodociągi i kanalizacja.
W szkolnym opisie Ariowie wprowadzili podział na dziedziczne kasty. Indie rozwijały matematykę, a w hinduizmie ważne są wierzenia o wcieleniach.
Zjednoczonymi Chinami rządził cesarz. Chińskie wynalazki i towary trafiały na Zachód, między innymi Jedwabnym Szlakiem.
## Daty
III tysiąclecie p.n.e.: Początki cywilizacji doliny Indusu i Chin.
Około 1500 p.n.e.: Przybycie Ariów i podbój doliny Indusu w opisie podręcznika.
III wiek p.n.e.: Zjednoczenie Chin i powstanie cesarstwa.
Około 100 roku n.e.: Papier w Chinach — data podana w skanie.
## Pojęcia
Kasta: Zamknięta grupa społeczna, do której przynależność była dziedziczna.
Hinduizm: Religia Indii opisana w rozdziale.
Reinkarnacja: Wiara w odradzanie się duszy w kolejnym wcieleniu.
Jedwabny Szlak: Drogi wymiany towarów między Wschodem i Zachodem.
Terakota: Wypalona glina, z której wykonano figury armii cesarza.
## Osiągnięcia
Miasta Indusu: Budynki z cegły, wodociągi i kanalizacja.
Matematyka Indii: System dziesiętny.
Wynalazki Chin: Papier, porcelana, proch, igła magnetyczna i druk.
Jedwab: Delikatna, cenna tkanina wytwarzana w Chinach.
# Krok po kroku
Oddziel Indie i Chiny: najpierw rzeki, potem społeczeństwo i wynalazki.
Zapamiętaj różnicę dat: początki w III tysiącleciu, zjednoczenie Chin w III wieku p.n.e.
Wyjaśnij skutek handlu: towary i wiedza mogły docierać do odległych krajów.
# Tak / nie tak
tak: Kasty były dziedzicznymi grupami. | nie: Każdy codziennie wybierał dowolną kastę. | bo: zamknięty podział ograniczał zmianę pozycji społecznej i kontakty między grupami.
tak: Wielki Mur miał bronić przed najazdami. | nie: Wielki Mur był wodociągiem Indusu. | bo: umocnienia powstały w Chinach dla obrony granic.
tak: III tysiąclecie i III wiek p.n.e. to różne okresy. | nie: To dwie nazwy tej samej daty. | bo: tysiąclecie trwa tysiąc lat, a wiek sto.
# Zapamiętaj
Indus — Indie; Huang He i Jangcy — Chiny.
Chiny: papier do pisania, porcelana do naczyń, igła do kierunków, jedwab do tkanin.
# Sprawdź się
wybierz: W starożytnym mieście odkryto odpływy nieczystości. Co to mówi o jego mieszkańcach? | *organizowali miejską infrastrukturę | prowadzili tylko wędrowne życie | nie znali stałych domów !! Kanalizacja wskazuje na zorganizowane miasto, takie jak opisane nad Indusem.
wybierz: Które zdanie poprawnie łączy miejsce i dokonanie? | *Chińczycy wytwarzali porcelanę | Egipcjanie budowali Wielki Mur | Sumerowie dzielili społeczeństwo na indyjskie kasty !! Porcelana jest jednym z omawianych osiągnięć Chin.
wybierz: Dlaczego szlak handlowy może wpływać na kulturę odległych krajów? | *przewozi się nim towary i poznaje cudze osiągnięcia | zatrzymuje wszystkie podróże | usuwa każdą różnicę między społeczeństwami !! Handel łączy odległe obszary i umożliwia wymianę, nie czyni ich identycznymi.
`);

const PISMO = topic('b-h5-r1-pismo', 60, 'Od hieroglifów do alfabetu',
  'Rozpoznawaj sposoby zapisywania informacji. Wyjaśnij, po co potrzebowano pisma i czym litera różni się od znaku obrazkowego.', `
wybierz: Dlaczego ludzie potrzebowali pisma? | *żeby trwale i dokładnie zachowywać informacje | żeby zaprzestać handlu | żeby zastąpić wszystkie rozmowy | żeby budować wyłącznie grobowce !! Sama pamięć nie wystarczała do przechowywania rosnącej liczby wiadomości.
wybierz: Gdzie pojawiło się najstarsze pismo omawiane w rozdziale? | *w Mezopotamii na Bliskim Wschodzie | w średniowiecznej Polsce | w starożytnej Australii | w Europie w XIX wieku !! Rozdział wskazuje Sumerów jako pierwszych twórców pisma.
wybierz: Z jakim okresem podręcznik wiąże wynalezienie pisma? | *z IV tysiącleciem p.n.e. | z IV wiekiem n.e. | z XX wiekiem | z III tysiącleciem n.e. !! Oś w podręczniku podaje przybliżenie około 4000 p.n.e.; istotne jest IV tysiąclecie p.n.e.
wybierz: Jak pismo pomagało władcom? | *umożliwiało spisywanie praw i dokumentów | automatycznie usuwało wszystkie spory | zastępowało wojsko | wytwarzało żywność bez rolnictwa !! Dokumenty i zapisane prawa ułatwiały zarządzanie państwem.
wybierz: Do czego kupcy wykorzystywali zapis? | *do utrwalania transakcji i umów | do odmierzania wylewów bez obserwacji | do tworzenia mumii | do zamiany gliny w żelazo !! Zapis pomagał przechowywać szczegóły wymiany, których trudno pilnować wyłącznie pamięcią.
wybierz: Co mogły zachowywać teksty religijne? | *modlitwy, mity i opowieści | wyłącznie liczbę kanałów | zawsze alfabet łaciński | tylko listy współczesnych państw !! Pismo służyło zarówno administracji i handlowi, jak i religii oraz kulturze.
wybierz: Co przedstawiał znak najstarszego pisma obrazkowego? | *obiekt lub pojęcie | wyłącznie jedną dzisiejszą polską literę | zawsze liczbę 60 | rodzaj metalu do miecza !! Schematyczne obrazki wiązały się z określonymi znaczeniami.
wybierz: Dlaczego pismo obrazkowe mogło być trudne do opanowania? | *wymagało znajomości wielu znaków | miało jedynie dwie litery | nie pozwalało nic zapisać | używali go tylko koczownicy !! Tysiące znaków były bardziej pracochłonne niż alfabet o niewielu literach.
wybierz: Które pismo jest egipskim przykładem pisma obrazkowego? | *hieroglify | alfabet fenicki | alfabet polski | alfabet łaciński !! Egipskie hieroglify stosowano między innymi w świątyniach i dokumentach.
wybierz: Z czego wykonywano papirus? | *z rośliny rosnącej nad Nilem | z wypalanej gliny | wyłącznie z rudy żelaza | z porcelany !! Papirus był materiałem pisarskim, z którego przygotowywano zwoje.
wybierz: Do czego służyło uproszczone pismo demotyczne? | *między innymi do szybkiego zapisu umów na papirusie | do rzeźbienia wyłącznie piramid | do budowy kanałów | do wytapiania brązu !! Uproszczenia ułatwiały pisanie w codziennych sytuacjach.
wybierz: Jak odciskano znaki klinowe? | *trzciną w miękkiej glinie | drukarką na papierze | włócznią w żelazie | pędzlem na jedwabiu jako jedynym podłożu !! Gliniana tabliczka i zaostrzona trzcina nadawały znakom charakterystyczny kształt.
wybierz: Skąd nazwa pismo klinowe? | *od kształtu znaków przypominających kliny | od nazwy faraona | od słowa oznaczającego wodę | od nazwy Chin !! Po uproszczeniu obrazków znaki miały formę klinowatych odcisków.
wybierz: Kto stworzył alfabet fenicki? | *Fenicjanie | Egipcjanie | Babilończycy Hammurabiego | Ariowie !! Fenicjanie byli ludem kupieckim i żeglarskim wschodniego wybrzeża Morza Śródziemnego.
wybierz: Dlaczego Fenicjanie potrzebowali prostego pisma? | *żeby łatwiej zapisywać informacje handlowe | żeby zrezygnować z wszystkich umów | żeby utrudnić naukę kupcom | żeby wynaleźć mumifikację !! Mniejsza liczba znaków ułatwiała stosowanie pisma w handlu.
wybierz: Kiedy powstał alfabet fenicki według podręcznika? | *około XI wieku p.n.e. | około XI wieku n.e. | w roku 1922 | w XVIII wieku n.e. !! Alfabet jest późniejszy niż początki pisma w IV tysiącleciu p.n.e.
wpisz: Nazwij zestaw liter. >> Uporządkowany zestaw liter to [alfabet]. !! Litery w piśmie alfabetycznym odnoszą się do dźwięków mowy.
wpisz: Uzupełnij rodzaj głosek. >> 22 znaki alfabetu fenickiego odpowiadały [spółgłoskom]. !! Fenicjanie nie oznaczali w tym alfabecie samogłosek.
wpisz: Uzupełnij zmianę wprowadzoną przez Greków. >> Grecy dodali litery oznaczające [samogłoski]. !! To ważna różnica między omawianym alfabetem fenickim i greckim.
wpisz: Podaj podstawę polskiego alfabetu. >> Alfabet polski opiera się na alfabecie [łacińskim]. !! Dostosowano go do dźwięków języka polskiego.
pary: Połącz zapis z materiałem lub formą. >> pismo klinowe = gliniane tabliczki ; papirus = roślinne zwoje ; hieroglify = egipskie znaki obrazkowe ; alfabet = litery związane z głoskami !! Papirus jest materiałem, a pozostałe nazwy dotyczą sposobu zapisu.
pary: Połącz użytkowników pisma z potrzebą. >> władcy = prawa i dokumenty ; kupcy = umowy handlowe ; kapłani = modlitwy ; historycy = poznawanie przeszłości z zapisów !! Trwałe teksty mają zastosowanie zarówno w danym czasie, jak i po wielu wiekach.
sortuj: Rozróżnij dwa sposoby zapisu. >> pismo obrazkowe = schematyczne rysunki, hieroglify ; pismo alfabetyczne = alfabet fenicki, alfabet grecki, alfabet łaciński !! Główna różnica dotyczy powiązania znaku ze znaczeniem lub dźwiękiem.
pary: Uporządkuj etapy rozwoju omawianych alfabetów. >> 1 = alfabet fenicki ; 2 = alfabet grecki ; 3 = alfabet łaciński ; 4 = alfabet polski oparty na łacińskim !! Grecy przejęli i rozwinęli alfabet Fenicjan, a następnie rozwinął się alfabet łaciński.
`, `
Pismo: trwały zapis praw, podatków, umów, modlitw i opowieści. Źródła pisane pomagają historykom poznawać przeszłość.
Sumerowie, Mezopotamia: IV tysiąclecie p.n.e. (oś w skanie: około 4000 p.n.e.). W szkolnym podziale wynalezienie pisma oddziela prehistorię od starożytności.
Pismo obrazkowe: schematyczne znaki związane z obiektami i pojęciami; przykład — hieroglify egipskie.
Pismo klinowe: uproszczone znaki, odciskane trzciną na glinianych tabliczkach. Papirus: roślinny materiał na zwoje w Egipcie.
Fenicjanie: kupcy i żeglarze, wschodnie wybrzeże Morza Śródziemnego. Około XI wieku p.n.e. — alfabet, 22 znaki spółgłoskowe.
Grecy dodali samogłoski. Alfabet łaciński rozwinął się w świecie rzymskim; polski jest oparty na łacińskim.
Ważne rozróżnienie: mowa ≠ pismo; pismo ≠ papirus; obrazek znaczenia ≠ litera głoski.
`, `
# Najważniejsze
Pismo pozwoliło zachować informacje dokładniej i trwalej niż sama pamięć. Ułatwiało handel, zarządzanie państwem i rozwój kultury.
Najstarszy zapis obrazkowy rozwijano i upraszczano. Egipcjanie używali hieroglifów, a w Mezopotamii rozwinęło się pismo klinowe.
Fenicjanie stworzyli prosty alfabet. Grecy dodali samogłoski, a polski alfabet korzysta z tradycji łacińskiej.
## Daty
IV tysiąclecie p.n.e.: Początki pisma Sumerów; w skanie około 4000 p.n.e.
Około XI wieku p.n.e.: Powstanie alfabetu fenickiego.
## Pojęcia
Pismo obrazkowe: Znaki przedstawiają obiekty lub pojęcia.
Pismo klinowe: Zapis odciskami przypominającymi kliny.
Papirus: Roślinny materiał do pisania, a nie nazwa alfabetu.
Alfabet: Zestaw liter, które wiążą zapis z dźwiękami mowy.
Źródło pisane: Dawny zapis, z którego można poznawać przeszłość.
## Po co używano pisma
Państwo: Zapisywano prawa, podatki i decyzje.
Handel: Utrwalano transakcje i umowy.
Religia i kultura: Zachowywano modlitwy, mity i opowieści.
Przyszłe pokolenia: Mogły odczytywać zachowane informacje.
# Krok po kroku
Najpierw myśl przedstawiano za pomocą schematycznych obrazków.
Znaki upraszczano, aby pisać szybciej; w Mezopotamii powstały znaki klinowe.
W alfabecie niewielki zestaw liter pozwala zapisywać wiele różnych słów.
# Tak / nie tak
tak: Sumerowie stworzyli najstarsze pismo omawiane w rozdziale. | nie: Fenicjanie stworzyli każdy rodzaj pisma jako pierwsi. | bo: alfabet fenicki pojawił się później niż pismo sumeryjskie.
tak: Papirus to materiał do zapisywania tekstów. | nie: Papirus i hieroglify oznaczają dokładnie to samo. | bo: materiał pisarski i sposób zapisu są różnymi rzeczami.
tak: Grecy dodali do przejętego alfabetu samogłoski. | nie: Alfabet fenicki od początku miał litery dla samogłosek. | bo: w szkolnym opisie fenickie znaki oznaczają spółgłoski.
# Zapamiętaj
Sumerowie — pismo; Fenicjanie — alfabet; Grecy — samogłoski; Rzym — alfabet łaciński.
Gliniana tabliczka i papirus to podłoża. Kliny, hieroglify i litery to sposoby zapisu.
# Sprawdź się
wybierz: Kupiec zapisał liczbę sprzedanych worków zboża. Jaką korzyść osiągnął? | *mógł później sprawdzić szczegóły transakcji | przestał potrzebować klientów | zmienił się w faraona !! Zapis utrwala informacje, które łatwo pomylić lub zapomnieć.
wybierz: Ktoś nazywa egipski zwój rodzajem alfabetu. Co wyjaśnisz? | *zwój jest formą materiału pisarskiego, a alfabet zestawem liter | każdy zwój oznacza jedną głoskę | każdy alfabet wykonuje się z gliny !! Odróżnienie materiału i znaków pomaga uniknąć mieszania pojęć.
wybierz: Dlaczego list sprzed wielu wieków może być źródłem historycznym? | *zachowuje informacje o dawnym życiu | zawsze zawiera pełną historię świata | automatycznie potwierdza każde zdanie jako prawdę !! Źródła przekazują wiadomości, ale historyk nadal musi je interpretować i oceniać.
`);

/** Autorskie zadania na umiejętności powtarzające się w publicznych wymaganiach szkół. */
const EXAM_FOCUS: Record<string, string> = {
  'b-h5-r1-ludzie': `
wybierz: Który zestaw najlepiej pokazuje skutek rewolucji neolitycznej? | *stała osada, pola i hodowane zwierzęta | częste wędrówki, same łowy i zbieractwo | alfabet, papier i druk | piramida, sarkofag i mumia !! Przemiana wiązała się z produkcją żywności oraz osiadłym trybem życia, a nie z wynalezieniem pisma.
wybierz: Dlaczego szukano materiałów innych niż kamień? | *kamienne ostrza trudno obrabiano i łatwo się tępiły | ludzie nie potrafili używać żadnych narzędzi | kamień był rodzajem alfabetu | brąz powstawał bez udziału człowieka !! Metale umożliwiały wykonywanie nowych narzędzi; brąz był twardszy od samej miedzi.
wybierz: Co odróżnia opisany w skanie piec hutniczy od dawnej dymarki? | *piec hutniczy można wykorzystywać wielokrotnie | huta służy wyłącznie do mielenia zboża | dymarka jest nazwą rzeki | w hucie nigdy nie obrabia się metali !! Dymarkę rozbijano, aby wyjąć żelazo; współczesny zakład i jego piece działają inaczej.
pary: Połącz przemianę z jej korzyścią. >> używanie ognia = ogrzewanie i pieczenie mięsa ; rozwój mowy = przekaz doświadczeń ; uprawa roślin = regularne plony ; oswojenie zwierząt = rozwój hodowli !! Umiejętność wyjaśnienia skutków jest ważniejsza niż samo zapamiętanie nazw.
`,
  'b-h5-r1-mezopotamia': `
wybierz: Które wyjaśnienie najlepiej łączy kanały z powstaniem państwa? | *wspólna praca wymagała organizacji i władzy zarządcy | każdy kanał był alfabetem | kanały powstawały bez pracy ludzi | wylewy uniemożliwiały każdą uprawę !! Zarządzanie współpracą i zasobami pomagało tworzyć pierwsze państwa.
wybierz: Po co Hammurabi kazał zapisać prawa swojego państwa? | *żeby ujednolicić obowiązujące zasady | żeby zastąpić prawa rysunkiem mapy | żeby zlikwidować wszystkie sądy | żeby oddać władzę każdemu kupcowi !! Spisane zasady ułatwiały zarządzanie rozległym państwem.
wybierz: Który zestaw zawiera tylko osiągnięcia Sumerów omawiane w rozdziale? | *pismo, koło, żagiel, koło garncarskie | alfabet łaciński, porcelana, papier | Wielki Mur, mumifikacja, sarkofag | Tora, Dekalog, menora !! Takie zestawienia pomagają uniknąć mylenia dorobku cywilizacji.
wybierz: Jaką rolę poza rolnictwem pełniły rzeki Mezopotamii? | *były drogami transportu i handlu | służyły wyłącznie jako granice bez ruchu | zastępowały wszystkie spichlerze | same tworzyły prawo !! Woda wspierała nie tylko uprawę, ale też przewożenie towarów.
`,
  'b-h5-r1-egipt': `
wybierz: Który argument najlepiej uzasadnia określenie Egipt darem Nilu? | *bez rzeki na pustynnym obszarze trudno byłoby utrzymać uprawy | Nil był ozdobą wszystkich sarkofagów | woda zastępowała urzędników | faraon nie korzystał z rolnictwa !! Wyjaśnienie powinno łączyć wodę, żyzną glebę i utrzymanie mieszkańców.
wybierz: Kto w Egipcie prowadził dokumenty i pomagał rządzić? | *urzędnicy | wyłącznie żołnierze | każdy jeniec wojenny | kupcy z Indusu !! Rozpoznanie grupy po zadaniu sprawdza rozumienie organizacji społeczeństwa.
wybierz: Co najtrafniej łączy religię z egipskim budownictwem? | *wiara w życie po śmierci sprzyjała budowie grobowców | politeizm zakazywał każdej świątyni | faraonowie wierzyli wyłącznie w handel | piramidy służyły wytapianiu żelaza !! Piramidy i świątynie były związane z kultem i wierzeniami.
pary: Rozdziel elementy egipskiego pochówku. >> przygotowane ciało = mumia ; zdobiona trumna = sarkofag ; monumentalny grobowiec = piramida ; zabezpieczanie zwłok = mumifikacja !! Wyjaśnienie różnic między tymi pojęciami jest podstawową umiejętnością z tematu.
`,
  'b-h5-r1-izrael': `
wybierz: Jak poprawnie porównać wierzenia Egipcjan i Izraelitów? | *Egipt — wielu bogów; judaizm — jeden Bóg | oba ludy czciły wyłącznie Ra | judaizm był nazwą egipskiego pisma | monoteizm oznacza wiele bóstw !! Politeizm i monoteizm opisują różne liczby czczonych bogów.
wybierz: Które przyporządkowanie jest poprawne? | *Tora — pięć ksiąg; Dekalog — przykazania | Tora — trumna; Dekalog — rzeka | Tora — wszystkie kasty; Dekalog — alfabet | Tora — cesarz; Dekalog — piramida !! Nie wystarczy rozpoznać nazwy: trzeba wiedzieć, co każda oznacza.
wybierz: Który zestaw poprawnie przypisuje role postaciom? | *Mojżesz — wyjście z Egiptu; Dawid — stolica w Jerozolimie | Dawid — papier; Salomon — koło | Abraham — kalendarz Egiptu; Mojżesz — porcelana | Hammurabi — Dekalog; Cheops — Tora !! Role postaci wynikają z biblijnego opisu dziejów omawianego w rozdziale.
wybierz: Co odróżnia przykazania od Arki Przymierza? | *Dekalog jest zbiorem zasad, a Arka skrzynią opisaną w Biblii | oba są jedną rzeką | Arka jest alfabetem, a Dekalog gliną | oba są tytułami faraonów !! Zasada religijna, tekst i przedmiot to różne kategorie.
`,
  'b-h5-r1-indie-chiny': `
wybierz: Dlaczego opisane kasty nazywamy zamkniętymi grupami? | *przynależność dziedziczono i ograniczano kontakty między grupami | wszyscy mogli je dowolnie zmieniać | zamykano je w Wielkim Murze | były zbiorami liter !! System utrwalał pozycję społeczną i różnice między grupami.
wybierz: Które połączenie dokonania z cywilizacją jest prawidłowe? | *Indie — system dziesiętny; Chiny — papier i porcelana | Indie — piramidy w Gizie; Chiny — Tora | Indie — Brama Isztar; Chiny — Dekalog | Indie — alfabet łaciński; Chiny — sarkofagi faraonów !! W zadaniach przekrojowych najłatwiej pomylić dorobek różnych ludów.
wybierz: Jaką funkcję miał Jedwabny Szlak? | *łączył odległe obszary handlowe Wschodu i Zachodu | oddzielał wszystkie miasta od kupców | był jedynym kanałem nawadniającym w Egipcie | służył tylko do pochówku cesarza !! Szlak był drogą wymiany cennych towarów, a nie fortyfikacją.
wybierz: Które zdanie odróżnia początki Chin od ich zjednoczenia? | *cywilizacja — III tysiąclecie p.n.e.; cesarstwo — III wiek p.n.e. | oba wydarzenia przypadają na jeden rok | zjednoczenie było przed pojawieniem się ludzi | cesarstwo powstało w XVIII wieku n.e. !! W pytaniach o czas trzeba odróżnić wiek od tysiąclecia.
`,
  'b-h5-r1-pismo': `
wybierz: Czym przede wszystkim różni się alfabet od pisma obrazkowego? | *litera wiąże się z dźwiękiem, a obrazek z obiektem lub pojęciem | alfabet nie pozwala zapisywać słów | obrazki zawsze oznaczają tylko samogłoski | litera jest rodzajem papirusu !! Niewielki zestaw liter można łączyć w wiele słów.
wybierz: Który zapis jest poprawny? | *Sumerowie — pismo; Fenicjanie — alfabet | Fenicjanie — piramidy; Sumerowie — porcelana | Sumerowie — alfabet polski; Rzymianie — rolnictwo | Egipcjanie — proch; Chińczycy — Dekalog !! Początki pisma i początki alfabetu nie są jednym wydarzeniem.
wybierz: Dlaczego wynalezienie pisma było przełomem dla badania przeszłości? | *powstały źródła pisane zachowujące dawne informacje | wszystkie znaki oznaczały to samo | każda opowieść stała się nieomylna | skończyło się gromadzenie wiedzy !! Zapis zostawia ślad, który można odczytywać i interpretować po wielu latach.
wybierz: Jaką ważną zmianę w przejętym alfabecie wprowadzili Grecy? | *dodali oznaczenia samogłosek | usunęli wszystkie znaki | zastąpili litery wyłącznie liczbami | wymyślili mumifikację !! Alfabet fenicki oznaczał spółgłoski; grecki rozwinął sposób zapisu dźwięków.
`,
};

export const HISTORY_GRADE5: Topic[] = [LUDZIE, MEZOPOTAMIA, EGIPT, IZRAEL, INDIE_CHINY, PISMO].map((t) => ({ ...t, dsl: `${t.dsl}\n${EXAM_FOCUS[t.id].trim()}` }));
