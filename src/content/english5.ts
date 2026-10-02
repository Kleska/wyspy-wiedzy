import type { Topic } from '../types';
import { builtin } from './util';

/*
 * Angielski, klasa 5 — dział powtórzeniowy „Unit 0” (to be, have got, can, there is / there are,
 * this / that / these / those, zaimki dzierżawcze, słówka).
 *
 * Polecenia, wyjaśnienia („!!”) i podpowiedzi („??” — zwykle tłumaczenie zdania) są po polsku,
 * zdania i odpowiedzi po angielsku (pisownia brytyjska: colour, favourite).
 * W lukach podajemy wszystkie poprawne warianty, np. [isn't|is not].
 * Słówka („english = polski”) to lista do nauki z wymową i źródło podpowiedzi do słów w zdaniach.
 */

function en(id: string, order: number, title: string, description: string, words: string, dsl: string): Topic {
  return { ...builtin(id, 'ang', order, title, description, dsl, [5]), words: words.trim() };
}

export const ENGLISH_GRADE5: Topic[] = [
  en(
    'b-a5-u0-be',
    10,
    'To be: am, is, are',
    "I am · you, we, they are · he, she, it is. Przeczenie: I'm not, isn't, aren't. W pytaniu „to be” stoi na początku: Are you…? Is she…?",
    `
I'm = jestem
you're = jesteś, jesteście
he's = on jest
she's = ona jest
it's = to jest
we're = jesteśmy
they're = oni są, one są
I'm not = nie jestem
isn't = nie jest
aren't = nie jesteś, nie jesteśmy, nie jesteście, nie są
from = z (skądś)
years old = lat (o wieku)
name = imię
friend = przyjaciel, kolega
best friend = najlepszy przyjaciel
brother = brat
sister = siostra
parents = rodzice
class = klasa
school = szkoła
at home = w domu
but = ale
favourite = ulubiony
colour = kolor
ten = dziesięć
eleven = jedenaście
twelve = dwanaście
thirteen = trzynaście
`,
    `
wybierz: Wybierz poprawną formę „to be”. >> I ___ from Poland. | *am | is | are ?? Po polsku: Jestem z Polski. !! Z „I” zawsze łączy się „am”.
wybierz: Wybierz poprawną formę „to be”. >> My brother ___ twelve years old. | *is | are | am ?? Po polsku: Mój brat ma dwanaście lat. !! „My brother” to „he”, a z „he” łączy się „is”.
wybierz: Wybierz poprawną formę „to be”. >> Kate and Ben ___ best friends. | *are | is | am ?? Po polsku: Kate i Ben są najlepszymi przyjaciółmi. !! „Kate and Ben” to „they”, a z „they” łączy się „are”.
wybierz: Wybierz poprawną formę „to be”. >> You ___ in my class. | *are | is | am ?? Po polsku: Jesteś w mojej klasie. !! Z „you” zawsze łączy się „are”.
wybierz: Wybierz poprawną formę „to be”. >> It ___ my new phone. | *is | are | am ?? Po polsku: To jest mój nowy telefon. !! Z „it” łączy się „is”.
wpisz: Wpisz am, is albo are. >> My name [is] Ola. ?? Po polsku: Mam na imię Ola. !! „My name” to „it”, więc „is”.
wpisz: Wpisz am, is albo are. >> Sam and I [are] eleven. ?? Po polsku: Sam i ja mamy po jedenaście lat. !! „Sam and I” to „we”, więc „are”.
wpisz: Wpisz am, is albo are. >> Her favourite colour [is] red. ?? Po polsku: Jej ulubiony kolor to czerwony. !! „Her favourite colour” to „it”, więc „is”.
wpisz: Wpisz am, is albo are. >> I [am] eleven years old. ?? Po polsku: Mam jedenaście lat. !! Z „I” łączy się „am”. Wiek podajemy po angielsku z „to be”.
wybierz: Wybierz poprawne przeczenie. >> She ___ from Spain. She's from Italy. | *isn't | aren't | am not ?? Po polsku: Ona nie jest z Hiszpanii. Jest z Włoch. !! Z „she” łączy się „is”, więc przeczenie to „isn't”.
wybierz: Wybierz poprawne przeczenie. >> We ___ brothers. We're friends. | *aren't | isn't | am not ?? Po polsku: Nie jesteśmy braćmi. Jesteśmy kolegami. !! Z „we” łączy się „are”, więc przeczenie to „aren't”.
wpisz: Uzupełnij przeczenie: wpisz isn't albo aren't. >> My dog [isn't|is not] big. It's small. ?? Po polsku: Mój pies nie jest duży. Jest mały. !! „My dog” to „it”, więc „isn't”.
wpisz: Uzupełnij przeczenie: wpisz isn't albo aren't. >> My parents [aren't|are not] at home. ?? Po polsku: Moich rodziców nie ma w domu. !! „My parents” to „they”, więc „aren't”.
wpisz: Dokończ przeczenie. >> I'm [not] thirteen. I'm eleven. ?? Po polsku: Nie mam trzynastu lat. Mam jedenaście. !! Przeczenie z „I” to „I'm not”.
wybierz: Wybierz poprawnie zbudowane pytanie. | *Are you from Poland? | You from Poland are? | Is you from Poland? ?? Po polsku: Czy jesteś z Polski? !! W pytaniu „to be” stoi przed osobą: Are you…?
wpisz: Uzupełnij pytanie. >> [Is] your sister ten? ?? Po polsku: Czy twoja siostra ma dziesięć lat? !! „Your sister” to „she”, więc pytanie zaczyna się od „Is”.
wpisz: Uzupełnij pytanie. >> [Are] they your friends? ?? Po polsku: Czy oni są twoimi przyjaciółmi? !! Z „they” łączy się „are”, więc pytanie zaczyna się od „Are”.
wpisz: Uzupełnij pytanie. >> [Are] you twelve? ?? Po polsku: Czy masz dwanaście lat? !! Z „you” łączy się „are”, więc pytanie zaczyna się od „Are”.
wybierz: Wybierz poprawną krótką odpowiedź. >> Are you from Italy? | *No, I'm not. | No, I aren't. | No, I isn't. ?? Po polsku: Czy jesteś z Włoch? — Nie. !! Na pytanie „Are you…?” odpowiadamy „Yes, I am” albo „No, I'm not”.
wybierz: Wybierz poprawną krótką odpowiedź. >> Is he your brother? | *Yes, he is. | Yes, he's. | Yes, he are. ?? Po polsku: Czy on jest twoim bratem? — Tak. !! W krótkiej odpowiedzi na „tak” nie skracamy: Yes, he is.
wpisz: Dokończ krótką odpowiedź. >> Are they at school? No, they [aren't|are not]. ?? Po polsku: Czy oni są w szkole? — Nie. !! Z „they” łączy się „are”, więc „No, they aren't”.
wpisz: Dokończ krótką odpowiedź. >> Is Ola Polish? Yes, she [is]. ?? Po polsku: Czy Ola jest Polką? — Tak. !! „Ola” to „she”, więc „Yes, she is”.
wpisz: Dokończ krótką odpowiedź. >> Are you eleven? Yes, I [am]. ?? Po polsku: Czy masz jedenaście lat? — Tak. !! Na pytanie „Are you…?” odpowiadamy „Yes, I am”.
pary: Połącz pełną formę ze skróconą. >> I am = I'm ; you are = you're ; he is = he's ; we are = we're ; they are = they're !! Apostrof zastępuje opuszczoną literę: I am → I'm.
pary: Połącz pełne przeczenie ze skróconym. >> is not = isn't ; are not = aren't ; I am not = I'm not !! Nie ma formy „amn't”. W „I am not” skracamy „I am”: I'm not.
sortuj: Która forma „to be” pasuje do osoby? >> am = I ; is = he, she, it ; are = you, we, they !! I am · he, she, it is · you, we, they are.
kliknij: Kliknij wszystkie formy czasownika „to be”. >> I *am* Polish, my friend Leo *is* Italian and his parents *are* from Rome. !! W czasie teraźniejszym formy „to be” to am, is i are.
`,
  ),

  en(
    'b-a5-u0-kraje',
    20,
    'Kraje i narodowości',
    "Kraj: Poland, narodowość: Polish. Po „from” stoi nazwa kraju: I'm from Poland. Nazwy krajów i narodowości piszemy po angielsku wielką literą.",
    `
country = kraj
nationality = narodowość
flag = flaga
Argentina = Argentyna
Argentinian = argentyński, Argentyńczyk
China = Chiny
Chinese = chiński, Chińczyk
France = Francja
French = francuski, Francuz
Germany = Niemcy
German = niemiecki, Niemiec
Italy = Włochy
Italian = włoski, Włoch
Poland = Polska
Polish = polski, Polak
Spain = Hiszpania
Spanish = hiszpański, Hiszpan
Turkey = Turcja
Turkish = turecki, Turek
the UK = Wielka Brytania (Zjednoczone Królestwo)
British = brytyjski, Brytyjczyk
the USA = Stany Zjednoczone
American = amerykański, Amerykanin
cousin = kuzyn, kuzynka
food = jedzenie
`,
    `
pary: Połącz kraj z narodowością. >> Poland = Polish ; Spain = Spanish ; France = French ; Italy = Italian ; Germany = German !! Narodowość często kończy się na -ish albo -an: Polish, Italian.
pary: Połącz kraj z narodowością. >> China = Chinese ; Turkey = Turkish ; Argentina = Argentinian ; the UK = British ; the USA = American !! The UK → British, the USA → American.
pary: Połącz kraj z polską nazwą. >> Germany = Niemcy ; Spain = Hiszpania ; Italy = Włochy ; France = Francja ; Turkey = Turcja
pary: Połącz kraj z polską nazwą. >> the UK = Wielka Brytania ; the USA = Stany Zjednoczone ; China = Chiny ; Argentina = Argentyna ; Poland = Polska
sortuj: Kraj czy narodowość? >> kraj = Spain, Turkey, China, Italy ; narodowość = Spanish, Turkish, Chinese, Italian !! Spain, Turkey, China i Italy to kraje. Spanish, Turkish, Chinese i Italian to narodowości.
wybierz: Wybierz narodowość. >> Marco is from Italy. He's ___. | *Italian | Italy | Spanish ?? Po polsku: Marco jest z Włoch. Jest Włochem. !! Italy to kraj, a Italian to narodowość.
wybierz: Wybierz narodowość. >> Ola is from Poland. She's ___. | *Polish | Poland | French ?? Po polsku: Ola jest z Polski. Jest Polką. !! Poland to kraj, a Polish to narodowość.
wybierz: Kraj czy narodowość? Wybierz słowo. >> My cousin is from ___. | *Germany | German | Turkish ?? Po polsku: Mój kuzyn jest z Niemiec. !! Po „from” stoi nazwa kraju: from Germany.
wybierz: Wybierz poprawne słowo. >> Pizza is ___ food. | *Italian | Italy | Poland ?? Po polsku: Pizza to włoskie jedzenie. !! Przed rzeczownikiem (food) stoi przymiotnik: Italian food.
wybierz: Jak powiesz po angielsku „francuska flaga”? | *the French flag | the France flag | the flag French ?? Flag to „flaga”. Które słowo znaczy „francuski”? !! Przymiotnik French stoi przed rzeczownikiem flag.
wpisz: Wpisz narodowość. >> Pablo is from Spain. He's [Spanish]. ?? Po polsku: Pablo jest z Hiszpanii. Jest Hiszpanem. !! Spain → Spanish.
wpisz: Wpisz narodowość. >> Chen is from China. She's [Chinese]. ?? Po polsku: Chen jest z Chin. Jest Chinką. !! China → Chinese.
wpisz: Wpisz narodowość. >> Emma is from the UK. She's [British]. ?? Po polsku: Emma jest z Wielkiej Brytanii. Jest Brytyjką. !! The UK → British.
wpisz: Wpisz narodowość. >> Jack is from the USA. He's [American]. ?? Po polsku: Jack jest ze Stanów Zjednoczonych. Jest Amerykaninem. !! The USA → American.
wpisz: Wpisz narodowość. >> Selin is from Turkey. She's [Turkish]. ?? Po polsku: Selin jest z Turcji. Jest Turczynką. !! Turkey → Turkish.
wpisz: Wpisz narodowość. >> Hans is from Germany. He's [German]. ?? Po polsku: Hans jest z Niemiec. Jest Niemcem. !! Germany → German.
wpisz: Wpisz kraj. >> Marie is French. She's from [France]. ?? Po polsku: Marie jest Francuzką. Jest z Francji. !! French → France.
wpisz: Wpisz kraj. >> Diego is Argentinian. He's from [Argentina]. ?? Po polsku: Diego jest Argentyńczykiem. Jest z Argentyny. !! Argentinian → Argentina.
wpisz: Wpisz kraj. >> We're Polish. We're from [Poland]. ?? Po polsku: Jesteśmy Polakami. Jesteśmy z Polski. !! Polish → Poland.
wpisz: Wpisz kraj. >> My friend is Italian. He's from [Italy]. ?? Po polsku: Mój kolega jest Włochem. Jest z Włoch. !! Italian → Italy.
kliknij: Kliknij słowa, które trzeba napisać wielką literą. >> She is *italian*, but her mum is from *poland*. !! Nazwy krajów i narodowości piszemy po angielsku wielką literą: Italian, Poland.
kliknij: Kliknij słowa, które trzeba napisać wielką literą. >> My cousins are from *spain*, but they aren't *spanish*. !! Nazwy krajów i narodowości piszemy po angielsku wielką literą: Spain, Spanish.
`,
  ),

  en(
    'b-a5-u0-miesiace',
    25,
    'Miesiące',
    'Nazwy miesięcy piszemy po angielsku wielką literą: January, February… Przed nazwą miesiąca stoi „in”: in March (w marcu).',
    `
month = miesiąc
January = styczeń
February = luty
March = marzec
April = kwiecień
May = maj
June = czerwiec
July = lipiec
August = sierpień
September = wrzesień
October = październik
November = listopad
December = grudzień
birthday = urodziny
when = kiedy
`,
    `
pary: Połącz miesiąc z polską nazwą. >> January = styczeń ; March = marzec ; April = kwiecień ; August = sierpień ; October = październik
pary: Połącz miesiąc z polską nazwą. >> May = maj ; June = czerwiec ; July = lipiec ; September = wrzesień ; November = listopad
pary: Połącz miesiąc z polską nazwą. >> February = luty ; June = czerwiec ; July = lipiec ; December = grudzień !! Uwaga na June (czerwiec) i July (lipiec) — łatwo je pomylić.
wpisz: Napisz po angielsku: styczeń. >> [January] !! January. Nazwy miesięcy piszemy po angielsku wielką literą.
wpisz: Napisz po angielsku: luty. >> [February] !! February. W środku jest „r”: Feb-ru-ary.
wpisz: Napisz po angielsku: marzec. >> [March] !! March. Nazwy miesięcy piszemy po angielsku wielką literą.
wpisz: Napisz po angielsku: kwiecień. >> [April] !! April. Nazwy miesięcy piszemy po angielsku wielką literą.
wpisz: Napisz po angielsku: czerwiec. >> [June] !! June to czerwiec, a July to lipiec.
wpisz: Napisz po angielsku: lipiec. >> [July] !! July to lipiec, a June to czerwiec.
wpisz: Napisz po angielsku: sierpień. >> [August] !! August. Nazwy miesięcy piszemy po angielsku wielką literą.
wpisz: Napisz po angielsku: październik. >> [October] !! October. Nazwy miesięcy piszemy po angielsku wielką literą.
wpisz: Napisz po angielsku: grudzień. >> [December] !! December to ostatni miesiąc roku.
wybierz: Który miesiąc jest zaraz po „March”? | *April | May | February ?? March to marzec. !! Po marcu (March) jest kwiecień, czyli April.
wybierz: Który miesiąc jest tuż przed „September”? | *August | October | July ?? September to wrzesień. !! Przed wrześniem (September) jest sierpień, czyli August.
wybierz: Który miesiąc jest ostatni w roku? | *December | November | January ?? Ostatni miesiąc roku to grudzień. !! Grudzień to December.
wybierz: Który miesiąc jest pierwszy w roku? | *January | June | July ?? Pierwszy miesiąc roku to styczeń. !! Styczeń to January.
sortuj: Jaka pora roku jest w Polsce w tych miesiącach? >> zima = January, February ; lato = July, August ; jesień = October, November !! January i February to styczeń i luty, July i August to lipiec i sierpień, October i November to październik i listopad.
wybierz: Wybierz poprawną odpowiedź. >> When's your birthday? | *It's in May. | It's on May. | I'm in May. ?? Po polsku: Kiedy masz urodziny? !! Przed nazwą miesiąca stoi „in”: in May (w maju).
wpisz: Wpisz brakujące słowo. >> My birthday is [in] July. ?? Po polsku: Mam urodziny w lipcu. !! Przed nazwą miesiąca stoi „in”: in July (w lipcu).
kliknij: Kliknij słowa, które trzeba napisać wielką literą. >> My birthday is in *june* and my brother's birthday is in *october*. !! Nazwy miesięcy piszemy po angielsku wielką literą: June, October.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> My birthday is in [February]. ?? Po polsku: Mam urodziny w lutym. !! February — w środku jest „r”: Feb-ru-ary.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> My sister's birthday is in [August]. ?? Po polsku: Moja siostra ma urodziny w sierpniu. !! August — nazwy miesięcy piszemy po angielsku wielką literą.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> My mum's birthday is in [November]. ?? Po polsku: Moja mama ma urodziny w listopadzie. !! November — nazwy miesięcy piszemy po angielsku wielką literą.
`,
  ),

  en(
    'b-a5-u0-havegot',
    30,
    'Have got',
    "„Have got” znaczy „mieć”. I, you, we, they have got · he, she, it has got. Przeczenie: haven't got, hasn't got. Pytanie: Have you got…? Has she got…?",
    `
have got = mieć
I've got = mam
you've got = masz, macie
he's got = on ma
she's got = ona ma
it's got = ma (o zwierzęciu albo rzeczy)
we've got = mamy
they've got = oni mają, one mają
haven't got = nie mam, nie masz, nie mamy, nie macie, nie mają
hasn't got = (on, ona) nie ma
family = rodzina
brother = brat
sister = siostra
cousin = kuzyn, kuzynka
parents = rodzice
pet = zwierzątko domowe
cat = kot
dog = pies
hamster = chomik
phone = telefon
bike = rower
skateboard = deskorolka; jeździć na deskorolce
computer = komputer
book = książka
ball = piłka
car = samochód
house = dom
a lot of = dużo
any = żaden (w przeczeniu), jakiś (w pytaniu)
cool = fajny
`,
    `
wybierz: Wybierz poprawną formę. >> I ___ got a brother and a sister. | *have | has | am ?? Po polsku: Mam brata i siostrę. !! Z „I” łączy się „have got”.
wybierz: Wybierz poprawną formę. >> My cousin ___ got a new phone. | *has | have | is ?? Po polsku: Mój kuzyn ma nowy telefon. !! „My cousin” to „he” albo „she”, więc „has got”.
wybierz: Wybierz poprawną formę. >> Ola and Kuba ___ got two cats. | *have | has | are ?? Po polsku: Ola i Kuba mają dwa koty. !! „Ola and Kuba” to „they”, więc „have got”.
wybierz: Wybierz poprawną formę. >> Our dog ___ got a red ball. | *has | have | is ?? Po polsku: Nasz pies ma czerwoną piłkę. !! „Our dog” to „it”, więc „has got”.
wybierz: Wybierz poprawną formę. >> We ___ got a big family. | *have | has | are ?? Po polsku: Mamy dużą rodzinę. !! Z „we” łączy się „have got”.
wpisz: Wpisz have albo has. >> My best friend [has] got a skateboard. ?? Po polsku: Mój najlepszy przyjaciel ma deskorolkę. !! „My best friend” to „he” albo „she”, więc „has”.
wpisz: Wpisz have albo has. >> My parents [have] got a new car. ?? Po polsku: Moi rodzice mają nowy samochód. !! „My parents” to „they”, więc „have”.
wpisz: Wpisz have albo has. >> You [have] got a cool bike! ?? Po polsku: Masz fajny rower! !! Z „you” łączy się „have”.
wpisz: Wpisz have albo has. >> Zosia [has] got a lot of books. ?? Po polsku: Zosia ma dużo książek. !! „Zosia” to „she”, więc „has”.
wybierz: Wybierz poprawne przeczenie. >> Mia ___ got a pet. | *hasn't | haven't | isn't ?? Po polsku: Mia nie ma zwierzątka. !! „Mia” to „she”, więc przeczenie to „hasn't got”.
wybierz: Wybierz poprawne przeczenie. >> I ___ got any cousins. | *haven't | hasn't | am not ?? Po polsku: Nie mam żadnych kuzynów. !! Z „I” łączy się „have”, więc przeczenie to „haven't got”.
wpisz: Uzupełnij przeczenie: wpisz haven't albo hasn't. >> My brother [hasn't|has not] got a computer. ?? Po polsku: Mój brat nie ma komputera. !! „My brother” to „he”, więc „hasn't”.
wpisz: Uzupełnij przeczenie: wpisz haven't albo hasn't. >> They [haven't|have not] got a dog. ?? Po polsku: Oni nie mają psa. !! Z „they” łączy się „haven't”.
wpisz: Uzupełnij przeczenie: wpisz haven't albo hasn't. >> We [haven't|have not] got a hamster. ?? Po polsku: Nie mamy chomika. !! Z „we” łączy się „haven't”.
wybierz: Wybierz poprawnie zbudowane pytanie. | *Have you got a brother? | Has you got a brother? | You got have a brother? ?? Po polsku: Czy masz brata? !! Pytanie zaczyna się od „Have” albo „Has”: Have you got…?
wpisz: Uzupełnij pytanie. >> [Has] your friend got a cat? ?? Po polsku: Czy twój kolega ma kota? !! „Your friend” to „he” albo „she”, więc pytanie zaczyna się od „Has”.
wpisz: Uzupełnij pytanie. >> [Have] they got a big house? ?? Po polsku: Czy oni mają duży dom? !! Z „they” łączy się „have”, więc pytanie zaczyna się od „Have”.
wpisz: Uzupełnij pytanie z „have got” (dwa słowa). >> [Have] you [got] a pet? ?? Po polsku: Czy masz zwierzątko? !! Have you got…? — „got” stoi po osobie.
wybierz: Wybierz poprawną krótką odpowiedź. >> Have you got a hamster? | *No, I haven't. | No, I hasn't. | No, I'm not. ?? Po polsku: Czy masz chomika? — Nie. !! Na pytanie „Have you got…?” odpowiadamy „Yes, I have” albo „No, I haven't”.
wybierz: Wybierz poprawną krótką odpowiedź. >> Has she got a sister? | *Yes, she has. | Yes, she have. | Yes, she is. ?? Po polsku: Czy ona ma siostrę? — Tak. !! Na pytanie „Has she got…?” odpowiadamy „Yes, she has” albo „No, she hasn't”.
wpisz: Dokończ krótką odpowiedź. >> Has Adam got a bike? Yes, he [has]. ?? Po polsku: Czy Adam ma rower? — Tak. !! „Adam” to „he”, więc „Yes, he has”.
wpisz: Dokończ krótką odpowiedź. >> Have they got a car? No, they [haven't|have not]. ?? Po polsku: Czy oni mają samochód? — Nie. !! Z „they” łączy się „have”, więc „No, they haven't”.
pary: Połącz pełną formę ze skróconą. >> I have got = I've got ; she has got = she's got ; we have got = we've got ; has not got = hasn't got ; have not got = haven't got !! Have → 've, has → 's, not → n't.
sortuj: Have got czy has got? >> have got = I, you, we, they ; has got = he, she, it !! „Has got” łączy się tylko z he, she, it.
sortuj: Rodzina, zwierzęta czy rzeczy? >> rodzina = brother, sister, cousin ; zwierzęta = cat, dog, hamster ; rzeczy = phone, bike, skateboard !! Brother, sister i cousin to rodzina. Cat, dog i hamster to zwierzęta. Phone, bike i skateboard to rzeczy.
pary: Połącz słowo z tłumaczeniem. >> brother = brat ; sister = siostra ; cousin = kuzyn ; pet = zwierzątko domowe ; family = rodzina
kliknij: Kliknij wszystkie nazwy zwierząt. >> Lena has got a *cat* and a *hamster*, but she hasn't got a *dog*. !! Cat to kot, hamster to chomik, a dog to pies.
`,
  ),

  en(
    'b-a5-u0-can',
    40,
    'Can i czynności',
    "„Can” znaczy „umieć, potrafić”. Dla każdej osoby forma jest taka sama: I can, she can. Przeczenie: can't. Po „can” stoi czasownik w formie podstawowej: He can cook.",
    `
can = umieć, potrafić
can't = nie umieć, nie potrafić
cook = gotować
draw = rysować
play football = grać w piłkę nożną
play the guitar = grać na gitarze
ride a bike = jeździć na rowerze
run = biegać
sing = śpiewać
skateboard = deskorolka; jeździć na deskorolce
speak Spanish = mówić po hiszpańsku
speak = mówić
swim = pływać
guitar = gitara
football = piłka nożna
fast = szybko
fish = ryba, ryby
bird = ptak
baby = niemowlę
mum = mama
dad = tata
`,
    `
wybierz: Wybierz poprawne zdanie. | *My sister can swim. | My sister cans swim. | My sister can swims. ?? Po polsku: Moja siostra umie pływać. !! „Can” nigdy nie dostaje końcówki -s, a czasownik po nim jest w formie podstawowej.
wybierz: Wybierz poprawne zdanie. | *He can't ride a bike. | He not can ride a bike. | He can't rides a bike. ?? Po polsku: On nie umie jeździć na rowerze. !! Przeczenie to „can't”, a po nim czasownik w formie podstawowej: ride.
wybierz: Wybierz poprawnie zbudowane pytanie. | *Can you play the guitar? | You play can the guitar? | Do you can play the guitar? ?? Po polsku: Czy umiesz grać na gitarze? !! W pytaniu „can” stoi przed osobą: Can you…?
wybierz: Wybierz poprawną krótką odpowiedź. >> Can your brother cook? | *Yes, he can. | Yes, he cans. | Yes, he is. ?? Po polsku: Czy twój brat umie gotować? — Tak. !! Na pytanie „Can he…?” odpowiadamy „Yes, he can” albo „No, he can't”.
wybierz: Wybierz poprawną krótką odpowiedź. >> Can you speak Chinese? | *No, I can't. | No, I not can. | No, I'm not. ?? Po polsku: Czy umiesz mówić po chińsku? — Nie. !! Na pytanie „Can you…?” odpowiadamy „Yes, I can” albo „No, I can't”.
wpisz: Wpisz can albo can't. >> Fish [can] swim, but they [can't|cannot] run. ?? Po polsku: Ryby umieją pływać, ale nie umieją biegać. !! Umieją — can. Nie umieją — can't.
wpisz: Wpisz can albo can't. >> A baby [can't|cannot] ride a bike. ?? Po polsku: Niemowlę nie umie jeździć na rowerze. !! Nie umie — can't.
wpisz: Wpisz can albo can't. >> Birds [can] sing. ?? Po polsku: Ptaki umieją śpiewać. !! Umieją — can.
wpisz: Wpisz can albo can't. >> Cats [can't|cannot] speak Spanish. ?? Po polsku: Koty nie umieją mówić po hiszpańsku. !! Nie umieją — can't.
wpisz: Uzupełnij pytanie. >> [Can] she draw? Yes, she can. ?? Po polsku: Czy ona umie rysować? — Tak. !! Pytanie zaczyna się od „Can”.
wpisz: Dokończ krótką odpowiedź. >> Can they skateboard? No, they [can't|cannot]. ?? Po polsku: Czy oni umieją jeździć na deskorolce? — Nie. !! Krótka odpowiedź na „nie”: No, they can't.
wpisz: Dokończ krótką odpowiedź. >> Can you run fast? Yes, I [can]. ?? Po polsku: Czy umiesz szybko biegać? — Tak. !! Krótka odpowiedź na „tak”: Yes, I can.
pary: Połącz czynność z tłumaczeniem. >> cook = gotować ; draw = rysować ; run = biegać ; sing = śpiewać ; swim = pływać
pary: Połącz czynność z tłumaczeniem. >> ride a bike = jeździć na rowerze ; play the guitar = grać na gitarze ; play football = grać w piłkę nożną ; skateboard = jeździć na deskorolce ; speak Spanish = mówić po hiszpańsku
wybierz: Jak jest po angielsku „pływać”? | *swim | sing | run ?? Sing to śpiewać. !! Swim to pływać, sing to śpiewać, a run to biegać.
wybierz: Jak jest po angielsku „rysować”? | *draw | cook | ride ?? Cook to gotować. !! Draw to rysować, cook to gotować, a ride to jeździć.
wybierz: Jak jest po angielsku „śpiewać”? | *sing | swim | speak ?? Speak to mówić. !! Sing to śpiewać, swim to pływać, a speak to mówić.
wybierz: Dokończ wyrażenie „jeździć na rowerze”. >> ride a ___ | *bike | guitar | football !! Ride a bike — jeździć na rowerze.
wybierz: Dokończ wyrażenie „grać na gitarze”. >> play the ___ | *guitar | bike | Spanish !! Play the guitar — grać na gitarze. Przed nazwą instrumentu stoi „the”.
wybierz: Dokończ wyrażenie „mówić po hiszpańsku”. >> speak ___ | *Spanish | football | bike !! Speak Spanish — mówić po hiszpańsku.
wpisz: Napisz po angielsku: gotować. >> [cook|to cook] !! Cook — gotować.
wpisz: Napisz po angielsku: biegać. >> [run|to run] !! Run — biegać.
wpisz: Napisz po angielsku: pływać. >> [swim|to swim] !! Swim — pływać.
kliknij: Kliknij wszystkie słowa, które nazywają czynności. >> I can *swim* and *draw*, but I can't *sing* or *cook*. !! Czynności to swim, draw, sing i cook.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> My mum can play the [guitar]. ?? Po polsku: Moja mama umie grać na gitarze. !! Guitar — po „g” piszemy „u”, którego nie słychać.
`,
  ),

  en(
    'b-a5-u0-there',
    50,
    'There is, there are i dom',
    "There is (there's) + jedna rzecz, there are + dwie rzeczy lub więcej. Przeczenie: there isn't a…, there aren't any… Pytanie: Is there…? Are there…?",
    `
there is = jest (liczba pojedyncza)
there's = jest (liczba pojedyncza)
there are = są (liczba mnoga)
there isn't = nie ma (liczba pojedyncza)
there aren't = nie ma (liczba mnoga)
room = pokój
bedroom = sypialnia
kitchen = kuchnia
bathroom = łazienka
living room = salon
armchair = fotel
bath = wanna
bed = łóżko
chair = krzesło
desk = biurko
fridge = lodówka
shelves = półki
shower = prysznic
sofa = kanapa
table = stół
wardrobe = szafa
in = w
on = na
under = pod
next to = obok
door = drzwi
wall = ściana
lamp = lampa
poster = plakat
clothes = ubrania
some = kilka, trochę
any = żaden (w przeczeniu), jakiś (w pytaniu)
big = duży
TV = telewizor
`,
    `
wybierz: Wybierz poprawną formę. >> There ___ a desk in my room. | *is | are | am ?? Po polsku: W moim pokoju jest biurko. !! Jedna rzecz (a desk) — there is.
wybierz: Wybierz poprawną formę. >> There ___ two armchairs in the living room. | *are | is | am ?? Po polsku: W salonie są dwa fotele. !! Więcej niż jedna rzecz (two armchairs) — there are.
wybierz: Wybierz poprawną formę. >> There ___ some books on the shelves. | *are | is | am ?? Po polsku: Na półkach są jakieś książki. !! Więcej niż jedna rzecz (some books) — there are.
wybierz: Wybierz poprawną formę. >> There ___ a fridge in the kitchen. | *is | are | am ?? Po polsku: W kuchni jest lodówka. !! Jedna rzecz (a fridge) — there is.
wpisz: Wpisz is albo are. >> There [is] a big wardrobe next to the door. ?? Po polsku: Obok drzwi jest duża szafa. !! Jedna rzecz (a wardrobe) — there is.
wpisz: Wpisz is albo are. >> There [are] three chairs in the kitchen. ?? Po polsku: W kuchni są trzy krzesła. !! Więcej niż jedna rzecz (three chairs) — there are.
wpisz: Wpisz is albo are. >> There [is] a shower in the bathroom. ?? Po polsku: W łazience jest prysznic. !! Jedna rzecz (a shower) — there is.
wpisz: Wpisz is albo are. >> There [are] some clothes on the bed. ?? Po polsku: Na łóżku są jakieś ubrania. !! Clothes to liczba mnoga — there are.
wybierz: Wybierz poprawne przeczenie. >> There ___ a TV in my bedroom. | *isn't | aren't | not ?? Po polsku: W mojej sypialni nie ma telewizora. !! Jedna rzecz (a TV) — there isn't.
wybierz: Wybierz poprawne przeczenie. >> There ___ any posters on the wall. | *aren't | isn't | not ?? Po polsku: Na ścianie nie ma żadnych plakatów. !! Więcej niż jedna rzecz (any posters) — there aren't.
wpisz: Uzupełnij przeczenie: wpisz isn't albo aren't. >> There [isn't|is not] a sofa in the kitchen. ?? Po polsku: W kuchni nie ma kanapy. !! Jedna rzecz (a sofa) — there isn't.
wpisz: Uzupełnij przeczenie: wpisz isn't albo aren't. >> There [aren't|are not] any shelves in the bathroom. ?? Po polsku: W łazience nie ma żadnych półek. !! Więcej niż jedna rzecz (any shelves) — there aren't.
wybierz: Wybierz poprawnie zbudowane pytanie. | *Is there a bath in your bathroom? | There a bath is in your bathroom? | Are there a bath in your bathroom? ?? Po polsku: Czy w twojej łazience jest wanna? !! W pytaniu zamieniamy kolejność: There is → Is there…? Jedna rzecz (a bath), więc „is”.
wpisz: Uzupełnij pytanie. >> [Is] there a table in your room? ?? Po polsku: Czy w twoim pokoju jest stół? !! Jedna rzecz (a table) — Is there…?
wpisz: Uzupełnij pytanie. >> [Are] there any books on your desk? ?? Po polsku: Czy na twoim biurku są jakieś książki? !! Więcej niż jedna rzecz (any books) — Are there…?
wybierz: Wybierz poprawną krótką odpowiedź. >> Is there a computer in your room? | *No, there isn't. | No, it isn't. | No, there aren't. ?? Po polsku: Czy w twoim pokoju jest komputer? — Nie. !! Na pytanie „Is there…?” odpowiadamy „Yes, there is” albo „No, there isn't”.
wpisz: Dokończ krótką odpowiedź. >> Are there any chairs in the kitchen? Yes, there [are]. ?? Po polsku: Czy w kuchni są jakieś krzesła? — Tak. !! Na pytanie „Are there…?” odpowiadamy „Yes, there are”.
wpisz: Dokończ krótką odpowiedź. >> Is there a wardrobe in your room? Yes, there [is]. ?? Po polsku: Czy w twoim pokoju jest szafa? — Tak. !! Na pytanie „Is there…?” odpowiadamy „Yes, there is”.
wybierz: Wybierz poprawną krótką odpowiedź. >> Are there any posters in your room? | *No, there aren't. | No, they aren't. | No, there isn't. ?? Po polsku: Czy w twoim pokoju są jakieś plakaty? — Nie. !! Na pytanie „Are there…?” odpowiadamy „Yes, there are” albo „No, there aren't”.
pary: Połącz słowo z tłumaczeniem. >> armchair = fotel ; wardrobe = szafa ; fridge = lodówka ; shelves = półki ; desk = biurko
pary: Połącz słowo z tłumaczeniem. >> bath = wanna ; shower = prysznic ; bed = łóżko ; chair = krzesło ; table = stół
pary: Połącz przyimek z tłumaczeniem. >> in = w ; on = na ; under = pod ; next to = obok
sortuj: W którym pomieszczeniu zwykle to znajdziesz? >> bedroom = bed, wardrobe ; bathroom = bath, shower ; living room = sofa, armchair !! Bedroom to sypialnia, bathroom to łazienka, a living room to salon.
wybierz: Gdzie zwykle stoi lodówka (fridge)? | *in the kitchen | in the bathroom | in the bedroom !! Kitchen to kuchnia.
wybierz: Jak jest po angielsku „szafa”? | *wardrobe | shelves | fridge ?? Fridge to lodówka. !! Wardrobe to szafa, shelves to półki, a fridge to lodówka.
wybierz: Jak jest po angielsku „półki”? | *shelves | chairs | tables ?? Chairs to krzesła. !! Shelves to półki, chairs to krzesła, a tables to stoły.
wpisz: Napisz po angielsku: lodówka. >> [fridge|refrigerator] !! Fridge — lodówka.
wpisz: Napisz po angielsku: biurko. >> [desk] !! Desk — biurko.
wpisz: Napisz po angielsku: fotel. >> [armchair] !! Armchair — fotel. To połączenie słów arm (ręka, ramię) i chair (krzesło).
wybierz: Kot jest pod łóżkiem. Wybierz przyimek. >> The cat is ___ the bed. | *under | on | in !! Under — pod.
wybierz: Buty są w szafie. Wybierz przyimek. >> The shoes are ___ the wardrobe. | *in | on | under !! In — w.
wybierz: Lampa stoi obok łóżka. Wybierz przyimek. >> The lamp is ___ the bed. | *next to | under | in !! Next to — obok.
wpisz: Telefon leży na stole. Wpisz przyimek. >> The phone is [on] the table. !! On — na.
wpisz: Piłka jest pod krzesłem. Wpisz przyimek. >> The ball is [under] the chair. !! Under — pod.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> There is a big [wardrobe] in my room. ?? Po polsku: W moim pokoju jest duża szafa. !! Wardrobe — w środku piszemy „ar”, a na końcu „e”, którego nie słychać.
`,
  ),

  en(
    'b-a5-u0-this',
    60,
    'This, that, these, those i ubrania',
    'This (to, ten, ta) i these (te) — o rzeczach blisko. That (tamto, tamten, tamta) i those (tamte) — o rzeczach daleko. This i that to jedna rzecz, these i those to kilka rzeczy.',
    `
this = to, ten, ta (blisko)
that = tamto, tamten, tamta (daleko)
these = te, ci (blisko)
those = tamte, tamci (daleko)
clothes = ubrania
coat = płaszcz
dress = sukienka
hat = czapka, kapelusz
hoodie = bluza z kapturem
jacket = kurtka
jeans = dżinsy
jumper = sweter
shoes = buty
skirt = spódnica
T-shirt = koszulka
trainers = buty sportowe
trousers = spodnie
red = czerwony
blue = niebieski
green = zielony
pink = różowy
white = biały
black = czarny
new = nowy
small = mały
pretty = ładny
`,
    `
wybierz: Rzecz jest blisko. Wybierz słowo. >> ___ is my jacket. | *This | These | Those ?? Po polsku: To jest moja kurtka. !! Jedna rzecz blisko — this.
wybierz: Rzeczy są blisko. Wybierz słowo. >> ___ are my trainers. | *These | This | That ?? Po polsku: To są moje buty sportowe. !! Kilka rzeczy blisko — these.
wybierz: Rzecz jest daleko. Wybierz słowo. >> ___ is my school. | *That | Those | These ?? Po polsku: Tamten budynek to moja szkoła. !! Jedna rzecz daleko — that.
wybierz: Osoby są daleko. Wybierz słowo. >> ___ are my friends. | *Those | That | This ?? Po polsku: Tamci to moi przyjaciele. !! Kilka osób albo rzeczy daleko — those.
wybierz: Wybierz poprawne słowo. >> ___ jeans are new. | *These | This | That ?? Po polsku: Te dżinsy są nowe. !! Jeans to liczba mnoga (are), więc these.
wybierz: Wybierz poprawne słowo. >> ___ dress is very pretty. | *This | These | Those ?? Po polsku: Ta sukienka jest bardzo ładna. !! Dress to jedna rzecz (is), więc this.
wybierz: Wybierz poprawne słowo. >> ___ shoes are small. | *Those | That | This ?? Po polsku: Tamte buty są małe. !! Shoes to liczba mnoga (are), więc those.
wybierz: Wybierz poprawne słowo. >> ___ hoodie isn't new. | *That | Those | These ?? Po polsku: Tamta bluza nie jest nowa. !! Hoodie to jedna rzecz (isn't), więc that.
wybierz: Wybierz poprawną odpowiedź. >> What's this? | *It's a skirt. | They're a skirt. | It's skirts. ?? Po polsku: Co to jest? !! Pytanie o jedną rzecz (this) — odpowiedź z „It's a…”.
wybierz: Wybierz poprawną odpowiedź. >> What are those? | *They're trousers. | It's trousers. | They're a trousers. ?? Po polsku: Co to jest? (pytamy o coś daleko, w liczbie mnogiej) !! Those i trousers to liczba mnoga — odpowiedź z „They're…”.
wpisz: Uzupełnij pytanie o jedną rzecz, która jest blisko. >> What's [this]? It's a jumper. ?? Po polsku: Co to jest? To sweter. !! Jedna rzecz blisko — this.
wpisz: Uzupełnij pytanie o kilka rzeczy, które są blisko. >> What are [these]? They're shoes. ?? Po polsku: Co to jest? To buty. !! Kilka rzeczy blisko — these.
wpisz: Uzupełnij pytanie o jedną rzecz, która jest daleko. >> What's [that]? It's a hat. ?? Po polsku: Co to jest? (o czymś daleko) To czapka. !! Jedna rzecz daleko — that.
wpisz: Uzupełnij pytanie o kilka rzeczy, które są daleko. >> What are [those]? They're hats. ?? Po polsku: Co to jest? (o rzeczach daleko) To czapki. !! Kilka rzeczy daleko — those.
wybierz: Wybierz poprawną formę. >> ___ these your trainers? | *Are | Is | Am ?? Po polsku: Czy to są twoje buty sportowe? !! These to liczba mnoga, więc „Are these…?”.
wybierz: Wybierz poprawną formę. >> ___ this your coat? | *Is | Are | Am ?? Po polsku: Czy to jest twój płaszcz? !! This to jedna rzecz, więc „Is this…?”.
wybierz: Wybierz poprawną krótką odpowiedź. >> Are these your shoes? | *No, they aren't. | No, it isn't. | No, they isn't. ?? Po polsku: Czy to są twoje buty? — Nie. !! Gdy pytanie jest o kilka rzeczy, w odpowiedzi używamy „they”: No, they aren't.
wybierz: Wybierz poprawną krótką odpowiedź. >> Is this your hat? | *Yes, it is. | Yes, they are. | Yes, it are. ?? Po polsku: Czy to jest twoja czapka? — Tak. !! Gdy pytanie jest o jedną rzecz, w odpowiedzi używamy „it”: Yes, it is.
sortuj: Jedna rzecz czy kilka rzeczy? >> jedna rzecz = this, that ; kilka rzeczy = these, those !! This i that — jedna rzecz. These i those — kilka rzeczy.
sortuj: Blisko czy daleko? >> blisko = this, these ; daleko = that, those !! This i these — blisko. That i those — daleko.
wybierz: Wybierz poprawne zdanie. | *They're red hats. | They're reds hats. | It's red hats. ?? Po polsku: To są czerwone czapki. !! Po angielsku przymiotnik (red) nie zmienia się w liczbie mnogiej — nie dodajemy -s. O kilku rzeczach mówimy „They're…”.
wpisz: Wpisz It's albo They're. >> [They're|They are] blue jeans. ?? Po polsku: To są niebieskie dżinsy. !! Jeans to liczba mnoga, więc „They're”.
wpisz: Wpisz It's albo They're. >> [It's|It is] a green T-shirt. ?? Po polsku: To jest zielona koszulka. !! Jedna rzecz (a T-shirt), więc „It's”.
pary: Połącz ubranie z tłumaczeniem. >> coat = płaszcz ; dress = sukienka ; hat = czapka ; skirt = spódnica ; shoes = buty
pary: Połącz ubranie z tłumaczeniem. >> jacket = kurtka ; jumper = sweter ; trousers = spodnie ; trainers = buty sportowe ; hoodie = bluza z kapturem
pary: Połącz ubranie z tłumaczeniem. >> jeans = dżinsy ; T-shirt = koszulka ; coat = płaszcz ; skirt = spódnica
wybierz: Jak jest po angielsku „spodnie”? | *trousers | trainers | skirt ?? Trainers to buty sportowe. !! Trousers to spodnie, trainers to buty sportowe, a skirt to spódnica.
wybierz: Jak jest po angielsku „sukienka”? | *dress | skirt | coat ?? Skirt to spódnica. !! Dress to sukienka, skirt to spódnica, a coat to płaszcz.
wybierz: Jak jest po angielsku „sweter”? | *jumper | jacket | hoodie ?? Jacket to kurtka. !! Jumper to sweter, jacket to kurtka, a hoodie to bluza z kapturem.
wpisz: Napisz po angielsku: spódnica. >> [skirt] !! Skirt — spódnica.
wpisz: Napisz po angielsku: kurtka. >> [jacket] !! Jacket — kurtka.
wpisz: Napisz po angielsku: buty sportowe. >> [trainers|sneakers] !! Trainers — buty sportowe.
kliknij: Kliknij wszystkie nazwy ubrań. >> Zoe has got a blue *dress*, a pink *hoodie* and white *trainers*. !! Dress to sukienka, hoodie to bluza z kapturem, a trainers to buty sportowe.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> These are my new [trousers]. ?? Po polsku: To są moje nowe spodnie. !! Trousers — w środku piszemy „ou”.
`,
  ),

  en(
    'b-a5-u0-poss',
    70,
    'My, your, his… i przymiotniki',
    "I → my, you → your, he → his, she → her, it → its, we → our, they → their. Końcówka 's po imieniu też pokazuje, czyje coś jest: Ania's cat (kot Ani). Po angielsku przymiotnik stoi przed rzeczownikiem i nie zmienia się w liczbie mnogiej: two old bikes.",
    `
my = mój, moja, moje
your = twój, twoja; wasz
his = jego
her = jej
its = jego, jej (o zwierzęciu albo rzeczy)
our = nasz, nasza
their = ich
big = duży
clever = mądry, bystry
friendly = przyjazny, życzliwy
funny = zabawny
helpful = pomocny
new = nowy
old = stary
pretty = ładny
small = mały
sporty = wysportowany
very = bardzo
name = imię
hobby = hobby
teacher = nauczyciel
joke = żart
house = dom
room = pokój
good at = dobry w czymś
Maths = matematyka
really = naprawdę
always = zawsze
`,
    `
pary: Połącz osobę z zaimkiem dzierżawczym. >> I = my ; you = your ; he = his ; she = her ; we = our !! I → my, you → your, he → his, she → her, we → our.
pary: Połącz osobę z zaimkiem dzierżawczym. >> it = its ; they = their ; he = his !! It → its, they → their, he → his.
pary: Połącz zaimek z tłumaczeniem. >> my = mój ; his = jego ; her = jej ; our = nasz ; their = ich
wybierz: Wybierz zaimek. >> This is my sister. ___ name is Kate. | *Her | His | Their ?? Po polsku: To moja siostra. Ma na imię Kate. !! „Sister” to „she”, a she → her.
wybierz: Wybierz zaimek. >> This is my brother. ___ name is Leo. | *His | Her | Its ?? Po polsku: To mój brat. Ma na imię Leo. !! „Brother” to „he”, a he → his.
wybierz: Wybierz zaimek. >> We've got a dog. ___ dog is very funny. | *Our | Their | His ?? Po polsku: Mamy psa. Nasz pies jest bardzo zabawny. !! We → our.
wybierz: Wybierz zaimek. >> Maja and Filip have got a cat. ___ cat is old. | *Their | Our | Her ?? Po polsku: Maja i Filip mają kota. Ich kot jest stary. !! „Maja and Filip” to „they”, a they → their.
wybierz: Wybierz zaimek. >> I've got a new bike. ___ bike is red. | *My | Your | His ?? Po polsku: Mam nowy rower. Mój rower jest czerwony. !! I → my.
wybierz: Wybierz zaimek. >> The dog has got a ball. ___ ball is small. | *Its | It's | Their ?? Po polsku: Pies ma piłkę. Jego piłka jest mała. !! Its (bez apostrofu) znaczy „jego” — o zwierzęciu albo rzeczy. It's to skrót od „it is” (albo „it has”).
wpisz: Wpisz zaimek dzierżawczy. >> I'm Polish. [My] name is Ania. ?? Po polsku: Jestem Polką. Mam na imię Ania. !! I → my.
wpisz: Wpisz zaimek dzierżawczy. >> You've got a hamster. Is [your] hamster friendly? ?? Po polsku: Masz chomika. Czy twój chomik jest przyjazny? !! You → your.
wpisz: Wpisz zaimek dzierżawczy. >> He's got a skateboard. [His] skateboard is new. ?? Po polsku: On ma deskorolkę. Jego deskorolka jest nowa. !! He → his.
wpisz: Wpisz zaimek dzierżawczy. >> She's sporty. [Her] hobby is football. ?? Po polsku: Ona jest wysportowana. Jej hobby to piłka nożna. !! She → her.
wpisz: Wpisz zaimek dzierżawczy. >> They're my cousins. [Their] house is big. ?? Po polsku: To moi kuzyni. Ich dom jest duży. !! They → their.
wpisz: Wpisz zaimek dzierżawczy. >> We're in class 5. [Our] teacher is helpful. ?? Po polsku: Jesteśmy w klasie piątej. Nasz nauczyciel jest pomocny. !! We → our.
wybierz: Jak powiesz po angielsku „rower Oli”? | *Ola's bike | Ola bike | bike's Ola ?? Do imienia właściciela dodajemy 's. !! Ola's bike — najpierw właściciel z 's, potem rzecz.
wybierz: Wybierz zdanie o tym samym znaczeniu. >> It's Adam's room. | *It's his room. | It's her room. | It's their room. ?? Po polsku: To pokój Adama. !! „Adam” to „he”, więc Adam's → his.
wybierz: Wybierz zdanie o tym samym znaczeniu. >> It's Zosia's cat. | *It's her cat. | It's his cat. | It's our cat. ?? Po polsku: To kot Zosi. !! „Zosia” to „she”, więc Zosia's → her.
wpisz: Uzupełnij zdanie: „To pies Kuby”. >> It's [Kuba's] dog. ?? Do imienia dodaj apostrof i literę s. !! Kuba's dog — pies Kuby.
wpisz: Zastąp imię zaimkiem. >> It's Emma's phone. It's [her] phone. ?? Po polsku: To telefon Emmy. To jej telefon. !! „Emma” to „she”, więc her.
wpisz: Zastąp imiona zaimkiem. >> It's Kuba and Ola's house. It's [their] house. ?? Po polsku: To dom Kuby i Oli. To ich dom. !! „Kuba and Ola” to „they”, więc their.
pary: Połącz przymiotnik z tłumaczeniem. >> clever = mądry ; friendly = przyjazny ; funny = zabawny ; helpful = pomocny ; sporty = wysportowany
pary: Połącz przymiotnik z tłumaczeniem. >> big = duży ; small = mały ; new = nowy ; old = stary ; pretty = ładny
wybierz: Wybierz przymiotnik, który najlepiej pasuje do opisu. >> Lena can run fast and play football. She's very ___. | *sporty | old | small ?? Po polsku: Lena umie szybko biegać i grać w piłkę nożną. !! Sporty znaczy „wysportowany”.
wybierz: Wybierz przymiotnik, który najlepiej pasuje do opisu. >> Max is good at Maths. He's very ___. | *clever | sporty | new ?? Po polsku: Max jest dobry z matematyki. !! Clever znaczy „mądry, bystry”.
wybierz: Wybierz przymiotnik, który najlepiej pasuje do opisu. >> My friend's jokes are really good. He's very ___. | *funny | old | big ?? Po polsku: Żarty mojego kolegi są naprawdę dobre. !! Funny znaczy „zabawny”.
wybierz: Wybierz przymiotnik, który najlepiej pasuje do opisu. >> Ola has got a lot of friends. She's very ___. | *friendly | small | new ?? Po polsku: Ola ma dużo przyjaciół. !! Friendly znaczy „przyjazny, życzliwy”.
wybierz: Wybierz przymiotnik, który najlepiej pasuje do opisu. >> My sister can always help me. She's very ___. | *helpful | new | small ?? Po polsku: Moja siostra zawsze może mi pomóc. !! Helpful znaczy „pomocny”.
wybierz: Wybierz poprawne zdanie. | *I've got a new hat. | I've got a hat new. | I've got new a hat. ?? Po polsku: Mam nową czapkę. !! Przymiotnik stoi przed rzeczownikiem: a new hat.
wybierz: Wybierz poprawne zdanie. | *She's got two new hats. | She's got two news hats. | She's got two hats new. ?? Po polsku: Ona ma dwie nowe czapki. !! Po angielsku przymiotnik nie zmienia się w liczbie mnogiej: new hats.
wybierz: Wybierz poprawne zdanie. | *My bike is very old. | My bike very is old. | My bike is old very. ?? Po polsku: Mój rower jest bardzo stary. !! „Very” stoi przed przymiotnikiem: very old.
kliknij: Kliknij wszystkie słowa, które opisują, jaki ktoś lub coś jest. >> My *new* friend is *clever* and *funny*, and his dog is *small*. !! Jaki? New, clever, funny, small — to przymiotniki.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> My sister is very [friendly]. ?? Po polsku: Moja siostra jest bardzo przyjazna. !! Friendly — w środku piszemy „ie”, jak w słowie friend.
`,
  ),

  en(
    'b-a5-u0-czytanie',
    80,
    'Czytanie po angielsku',
    'Najpierw przeczytaj cały tekst. Odpowiedzi szukaj w tekście. True znaczy „prawda”, a false — „fałsz”.',
    `
hi = cześć
too = też
today = dzisiaj
flat = mieszkanie
nice = ładny, miły
a lot of = dużo
how old = ile lat
how many = ile
where = gdzie
when = kiedy
who = kto
what = co
what colour = jakiego koloru
true = prawda
false = fałsz
very = bardzo
but = ale
`,
    `
tekst: My friend Hania >> Hi! I'm Kuba. I'm eleven years old and I'm from Poland. This is my best friend, Hania. She's twelve and her birthday is in October. Hania has got a brother, but she hasn't got a sister. // Hania is very sporty. She can swim and ride a bike, but she can't skateboard. Her favourite colour is green. Today she's got a green hoodie and white trainers. // Hania has got a pet too. It's a hamster and its name is Pixel. Pixel is small and very funny.
wybierz: How old is Kuba? | *eleven | twelve | ten ?? Po polsku: Ile lat ma Kuba? !! W tekście: „I'm eleven years old”.
wybierz: Where is Kuba from? | *Poland | Spain | the UK ?? Po polsku: Skąd jest Kuba? !! W tekście: „I'm from Poland”.
wybierz: When is Hania's birthday? | *in October | in August | in November ?? Po polsku: Kiedy Hania ma urodziny? !! W tekście: „her birthday is in October”.
wybierz: True or false? >> Hania has got a sister. | *false | true ?? Po polsku: Hania ma siostrę. Prawda czy fałsz? !! W tekście: „she hasn't got a sister”.
wybierz: What can't Hania do? | *skateboard | swim | ride a bike ?? Po polsku: Czego Hania nie umie robić? !! W tekście: „she can't skateboard”.
wybierz: What colour is Hania's hoodie? | *green | white | red ?? Po polsku: Jakiego koloru jest bluza Hani? !! W tekście: „a green hoodie”.
wpisz: Uzupełnij zdanie zgodnie z tekstem. >> Hania's pet is a [hamster]. ?? Po polsku: Zwierzątko Hani to… !! W tekście: „It's a hamster”.
wybierz: Who is Pixel? | *Hania's hamster | Hania's brother | Kuba's dog ?? Po polsku: Kim jest Pixel? !! W tekście: „It's a hamster and its name is Pixel”.
wybierz: True or false? >> Pixel is big. | *false | true ?? Po polsku: Pixel jest duży. Prawda czy fałsz? !! W tekście: „Pixel is small”.
tekst: Our flat >> This is our flat. It isn't very big, but it's nice. There are two bedrooms, a living room, a kitchen and a bathroom. // In the living room there's a big sofa and there are two old armchairs. There isn't a TV, but there are a lot of books on the shelves. My dad's guitar is next to the sofa. // My bedroom is small. There's a bed, a desk and a wardrobe. My clothes are in the wardrobe and my skateboard is under the bed. My sister's room is next to the kitchen. There are a lot of posters on the walls in her room.
wybierz: How many bedrooms are there in the flat? | *two | one | three ?? Po polsku: Ile sypialni jest w mieszkaniu? !! W tekście: „There are two bedrooms”.
wybierz: True or false? >> There is a TV in the living room. | *false | true ?? Po polsku: W salonie jest telewizor. Prawda czy fałsz? !! W tekście: „There isn't a TV”.
wybierz: Where are the books? | *on the shelves | on the sofa | in the wardrobe ?? Po polsku: Gdzie są książki? !! W tekście: „a lot of books on the shelves”.
wybierz: What is next to the sofa? | *a guitar | a desk | a skateboard ?? Po polsku: Co stoi obok kanapy? !! W tekście: „My dad's guitar is next to the sofa”.
wybierz: True or false? >> The armchairs are new. | *false | true ?? Po polsku: Fotele są nowe. Prawda czy fałsz? !! W tekście: „two old armchairs”.
wybierz: Where is the skateboard? | *under the bed | in the wardrobe | next to the sofa ?? Po polsku: Gdzie jest deskorolka? !! W tekście: „my skateboard is under the bed”.
wpisz: Uzupełnij zdanie zgodnie z tekstem. >> My clothes are [in] the wardrobe. ?? Po polsku: Moje ubrania są w szafie. !! W tekście: „My clothes are in the wardrobe”.
wybierz: Where is the sister's room? | *next to the kitchen | next to the bathroom | next to the living room ?? Po polsku: Gdzie jest pokój siostry? !! W tekście: „My sister's room is next to the kitchen”.
wybierz: True or false? >> There are posters in the sister's room. | *true | false ?? Po polsku: W pokoju siostry są plakaty. Prawda czy fałsz? !! W tekście: „There are a lot of posters on the walls in her room”.
`,
  ),
];
