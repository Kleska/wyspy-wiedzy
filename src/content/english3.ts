import type { Topic } from '../types';
import { builtin } from './util';

/*
 * Angielski, klasa 3 — podręcznik „Kids Can! 3” (Macmillan), Unit 1 „Where do people do sport?”.
 * Zakres jak na sprawdzianie: słówka ze stron 8, 9 i 12 (znaczenie i pisownia) oraz zdania
 * I play football. / I don't play football. / Do you play football? Yes, I do. / No, I don't.
 *
 * Zasady pisania (jak w `english5.ts`, ale dla ośmiolatka):
 * - polecenia, wyjaśnienia („!!”) i podpowiedzi („??”) po polsku, krótko i prosto; zdania i odpowiedzi po angielsku;
 * - tylko I / we / you — formy he / she (plays, doesn't) przychodzą w podręczniku później, więc ich tu nie ma;
 * - znaczenie ćwiczymy w kierunku polski → angielski (odpowiedzi czyta wtedy angielski głos) i w „pary”;
 *   słówko angielskie, o które pytamy, nie może stać w zdaniu nad pytaniem (podpowiedź ze słowniczka zdradziłaby odpowiedź);
 * - ściąga i lekcja stoją przy temacie (jak w lekturach i historii);
 * - kolejny rozdział: osobna stała, id `b-a3-u<numer>-…`, `order` z kolejnej setki (Unit 1: 110–199).
 */

const UNIT_1 = 'Unit 1';

function en3(id: string, order: number, title: string, description: string, words: string, dsl: string, guide: string, lesson: string): Topic {
  return { ...builtin(id, 'ang', order, title, description, dsl, [3]), unit: UNIT_1, words: words.trim(), guide: guide.trim(), lesson: lesson.trim() };
}

// ─── Sporty i miejsca (str. 8–9) ──────────────────────────────────────────────

const SPORTY = en3(
  'b-a3-u1-sporty',
  110,
  'Sporty i miejsca',
  'Sporty i miejsca, w których się je uprawia — słówka ze stron 8 i 9 podręcznika.',
  `
do gymnastics = ćwiczyć gimnastykę
gym = sala gimnastyczna
play football = grać w piłkę nożną
football pitch = boisko do piłki nożnej
play basketball = grać w koszykówkę
basketball court = boisko do koszykówki
go swimming = pływać
swimming pool = basen
go running = biegać
running track = bieżnia
sport = sport
sports centre = centrum sportowe
`,
  `
wybierz: Jak jest po angielsku „basen”? | *swimming pool | running track | basketball court ?? Running track to bieżnia. !! Swimming pool to basen, running track to bieżnia, a basketball court to boisko do koszykówki.
wybierz: Jak jest po angielsku „bieżnia”? | *running track | swimming pool | gym ?? Gym to sala gimnastyczna. !! Running track to bieżnia, swimming pool to basen, a gym to sala gimnastyczna.
wybierz: Jak jest po angielsku „sala gimnastyczna”? | *gym | football pitch | swimming pool ?? Football pitch to boisko do piłki nożnej. !! Gym to sala gimnastyczna, football pitch to boisko do piłki nożnej, a swimming pool to basen.
wybierz: Jak jest po angielsku „boisko do piłki nożnej”? | *football pitch | basketball court | running track ?? Basketball court to boisko do koszykówki. !! Football pitch to boisko do piłki nożnej, a basketball court — do koszykówki.
wybierz: Jak jest po angielsku „boisko do koszykówki”? | *basketball court | football pitch | gym ?? Football pitch to boisko do piłki nożnej. !! Basketball court to boisko do koszykówki, a football pitch — do piłki nożnej.
wybierz: Jak jest po angielsku „grać w piłkę nożną”? | *play football | play basketball | go running ?? Go running to biegać. !! Play football to grać w piłkę nożną, play basketball — w koszykówkę, a go running to biegać.
wybierz: Jak jest po angielsku „grać w koszykówkę”? | *play basketball | play football | do gymnastics ?? Do gymnastics to ćwiczyć gimnastykę. !! Play basketball to grać w koszykówkę, a play football — w piłkę nożną.
wybierz: Jak jest po angielsku „pływać”? | *go swimming | go running | play football ?? Go running to biegać. !! Go swimming to pływać, a go running to biegać.
wybierz: Jak jest po angielsku „biegać”? | *go running | go swimming | do gymnastics ?? Go swimming to pływać. !! Go running to biegać, a go swimming to pływać.
wybierz: Jak jest po angielsku „ćwiczyć gimnastykę”? | *do gymnastics | play basketball | go swimming ?? Play basketball to grać w koszykówkę. !! Do gymnastics to ćwiczyć gimnastykę.
wybierz: Co robi ta osoba? 🏊 | *go swimming | go running | play football ?? Ta osoba jest w wodzie. !! Go swimming to pływać.
wybierz: Co robi ta osoba? 🏃 | *go running | go swimming | do gymnastics ?? Ta osoba szybko przebiera nogami. !! Go running to biegać.
wybierz: Co robi ta osoba? 🤸 | *do gymnastics | play basketball | go running ?? Ta osoba robi gwiazdę. !! Do gymnastics to ćwiczyć gimnastykę.
wybierz: W co gra ta osoba? ⚽ | *play football | play basketball | go swimming ?? Tę piłkę kopie się nogą. !! Play football to grać w piłkę nożną.
pary: Połącz sport z miejscem. >> play football = football pitch ; play basketball = basketball court ; go swimming = swimming pool ; go running = running track !! W piłkę nożną gramy na football pitch, w koszykówkę na basketball court, pływamy w swimming pool, a biegamy na running track.
pary: Połącz słówko z polskim znaczeniem. >> gym = sala gimnastyczna ; swimming pool = basen ; running track = bieżnia ; football pitch = boisko do piłki nożnej !! Gym — sala gimnastyczna, swimming pool — basen, running track — bieżnia, football pitch — boisko do piłki nożnej.
pary: Połącz słówko z polskim znaczeniem. >> go swimming = pływać ; go running = biegać ; play football = grać w piłkę nożną ; do gymnastics = ćwiczyć gimnastykę !! Go swimming — pływać, go running — biegać, play football — grać w piłkę nożną, do gymnastics — ćwiczyć gimnastykę.
sortuj: Play, do czy go? >> play = football, basketball ; do = gymnastics ; go = swimming, running !! Gry z piłką: play. Gimnastyka: do. Słowa na -ing: go.
wybierz: Które słowo pasuje? >> ___ swimming | *go | play | do ?? Po polsku: pływać. !! Słowo kończy się na -ing, więc mówimy go: go swimming.
wybierz: Które słowo pasuje? >> ___ gymnastics | *do | go | play ?? Po polsku: ćwiczyć gimnastykę. !! Gimnastykę się „robi”: do gymnastics.
wybierz: Które słowo pasuje? >> ___ basketball | *play | go | do ?? Po polsku: grać w koszykówkę. !! W gry z piłką gramy: play basketball.
wybierz: Gdzie gramy w koszykówkę? | *on a basketball court | in a swimming pool | on a running track ?? Swimming pool to basen. !! W koszykówkę gramy na boisku do koszykówki: basketball court.
wybierz: Gdzie pływamy? | *in a swimming pool | in a gym | on a football pitch ?? Gym to sala gimnastyczna. !! Pływamy w basenie: swimming pool.
wybierz: Gdzie ćwiczymy gimnastykę? | *in a gym | on a running track | in a swimming pool ?? Running track to bieżnia. !! Gimnastykę ćwiczymy na sali gimnastycznej: gym.
wybierz: Uzupełnij zdanie. >> I play football ___ a football pitch. | *on | in ?? Po polsku: Gram w piłkę nożną na boisku. !! Na boisku — on: on a football pitch.
wybierz: Uzupełnij zdanie. >> I go swimming ___ a swimming pool. | *in | on ?? Po polsku: Pływam w basenie. !! W basenie — in, bo pływamy w wodzie.
wpisz: Wpisz play, do albo go. >> I [go] running on a running track. ?? Po polsku: Biegam na bieżni. !! Running kończy się na -ing, więc go running.
`,
  `
Piłka → play: play football, play basketball.
Gimnastyka → do: do gymnastics.
Słowo na -ing → go: go swimming, go running.
Miejsca: gym — sala gimnastyczna, football pitch — boisko do piłki nożnej, basketball court — boisko do koszykówki, swimming pool — basen, running track — bieżnia.
On a pitch / court / track (na boisku, na bieżni), in a pool / gym (w basenie, w sali).
`,
  `
# Najważniejsze
W gry z piłką „gramy”: play football, play basketball.
Gimnastykę „robimy”: do gymnastics. A gdy słowo kończy się na -ing, mówimy go: go swimming, go running.
Każdy sport ma swoje miejsce: football pitch, basketball court, swimming pool, running track, gym.
# Krok po kroku
Popatrz na sport: czy gra się w niego piłką?
Piłka → play. Gimnastyka → do. Słowo z -ing na końcu → go.
Pomyśl, gdzie się go uprawia, i dobierz miejsce.
Przykład: piłka nożna → jest piłka → play football. Gramy na boisku: football pitch.
## Sporty
do gymnastics: ćwiczyć gimnastykę
play football: grać w piłkę nożną
play basketball: grać w koszykówkę
go swimming: pływać
go running: biegać
## Miejsca
gym: sala gimnastyczna
football pitch: boisko do piłki nożnej
basketball court: boisko do koszykówki
swimming pool: basen
running track: bieżnia
# Tak / nie tak
tak: go swimming | nie: play swimming | bo: w pływanie się nie gra. Słowo kończy się na -ing, więc mówimy go swimming.
tak: do gymnastics | nie: play gymnastics | bo: w gimnastyce nie ma piłki. Gimnastykę się „robi”: do.
tak: basketball court | nie: basketball pitch | bo: boisko do koszykówki to court. Pitch to boisko do piłki nożnej.
tak: running track | nie: running pool | bo: biegamy po bieżni, czyli track. Pool to basen — w nim się pływa.
# Zapamiętaj
Piłka → play. Gimnastyka → do. Na końcu -ing → go.
Pool ma dwa „o” — jak dwa koła ratunkowe w basenie.
# Sprawdź się
wybierz: Które słowo pasuje? >> ___ running | *go | play | do !! Running kończy się na -ing, więc go running.
wybierz: Gdzie biegamy? | *on a running track | in a swimming pool | in a gym !! Biegamy na bieżni: running track.
`,
);

// ─── Joga: polecenia (str. 12) ────────────────────────────────────────────────

const JOGA = en3(
  'b-a3-u1-joga',
  120,
  'Joga: polecenia',
  'Polecenia z lekcji jogi: jak się pochylić, gdzie usiąść i na czym stanąć. Słówka ze strony 12 podręcznika.',
  `
stand on one leg = stań na jednej nodze
bend to the left = zrób skłon w lewo
bend to the right = zrób skłon w prawo
sit on the floor = usiądź na podłodze
stand = stać, stań
sit = siedzieć, usiądź
bend = zrób skłon
left = lewo
right = prawo
floor = podłoga
leg = noga
one = jeden, jedna
yoga = joga
tree = drzewo
rainbow = tęcza
butterfly = motyl
position = pozycja
`,
  `
wybierz: Jak jest po angielsku „usiądź na podłodze”? | *sit on the floor | stand on one leg | bend to the left ?? Stand to stać. !! Sit on the floor to usiądź na podłodze.
wybierz: Jak jest po angielsku „stań na jednej nodze”? | *stand on one leg | sit on the floor | bend to the right ?? Sit to siedzieć. !! Stand on one leg to stań na jednej nodze.
wybierz: Jak jest po angielsku „zrób skłon w lewo”? | *bend to the left | bend to the right | sit on the floor ?? Right to prawo. !! Bend to the left — skłon w lewo, bend to the right — skłon w prawo.
wybierz: Jak jest po angielsku „zrób skłon w prawo”? | *bend to the right | bend to the left | stand on one leg ?? Left to lewo. !! Bend to the right — skłon w prawo, bend to the left — skłon w lewo.
pary: Połącz polecenie z polskim znaczeniem. >> stand on one leg = stań na jednej nodze ; bend to the left = skłon w lewo ; bend to the right = skłon w prawo ; sit on the floor = usiądź na podłodze !! Stand — stań, bend — skłon, sit — usiądź. Left to lewo, a right to prawo.
pary: Połącz słowo z polskim znaczeniem. >> left = lewo ; right = prawo ; floor = podłoga ; leg = noga !! Left — lewo, right — prawo, floor — podłoga, leg — noga.
wybierz: Pozycja „drzewo” (the tree). Co robisz? | *stand on one leg | sit on the floor | bend to the left ?? Drzewo stoi na jednym pniu. !! W pozycji drzewa stoisz na jednej nodze: stand on one leg.
wybierz: Pozycja „motyl” (the butterfly). Co robisz? | *sit on the floor | stand on one leg | bend to the right ?? Nogi układasz jak skrzydła motyla. !! W pozycji motyla siedzisz na podłodze: sit on the floor.
wybierz: Pozycja „tęcza” (the rainbow). Co robisz? | *bend to the left and to the right | sit on the floor | stand on one leg ?? Tęcza jest wygięta w łuk. !! W pozycji tęczy robisz skłon w lewo i w prawo: bend to the left, bend to the right.
wybierz: Uzupełnij polecenie „zrób skłon w prawo”. >> Bend to the ___. | *right | left | floor ?? Left to lewo. !! Right to prawo: bend to the right.
wybierz: Uzupełnij polecenie „usiądź na podłodze”. >> Sit on the ___. | *floor | leg | left ?? Leg to noga. !! Floor to podłoga: sit on the floor.
wybierz: Uzupełnij polecenie „stań na jednej nodze”. >> Stand on one ___. | *leg | floor | right ?? Floor to podłoga. !! Leg to noga: stand on one leg.
wybierz: Które słowo znaczy „usiądź”? >> ___ on the floor. | *Sit | Stand | Bend ?? Stand to stań. !! Sit — usiądź, stand — stań, bend — zrób skłon.
wybierz: Które słowo znaczy „stań”? >> ___ on one leg. | *Stand | Sit | Bend ?? Sit to usiądź. !! Stand — stań, sit — usiądź, bend — zrób skłon.
sortuj: Na stojąco czy na siedząco? >> na stojąco = stand on one leg, bend to the left, bend to the right ; na siedząco = sit on the floor !! Na siedząco robisz tylko jedno: sit on the floor. Skłony i stanie na jednej nodze robisz na stojąco.
wpisz: Napisz po angielsku „usiądź na podłodze”. >> Sit on the [floor]. ?? Podłoga to po angielsku słowo z dwoma „o”. !! Floor — podłoga. Piszemy dwa „o”.
wpisz: Napisz po angielsku „stań na jednej nodze”. >> Stand on one [leg]. ?? Noga to krótkie słowo — trzy litery. !! Leg — noga.
wpisz: Napisz po angielsku „zrób skłon w lewo”. >> Bend to the [left]. ?? Lewo po angielsku też zaczyna się na L. !! Left — lewo. Oba słowa zaczynają się na L.
wpisz: Napisz po angielsku „zrób skłon w prawo”. >> Bend to the [right]. ?? Prawo po angielsku zaczyna się na R. !! Right — prawo. Piszemy r-i-g-h-t, chociaż słychać „rajt”.
`,
  `
stand on one leg — stań na jednej nodze
bend to the left — zrób skłon w lewo
bend to the right — zrób skłon w prawo
sit on the floor — usiądź na podłodze
Pozycje jogi: the tree (drzewo) — stand on one leg, the rainbow (tęcza) — bend to the left and to the right, the butterfly (motyl) — sit on the floor.
Left i lewo zaczynają się na L.
`,
  `
# Najważniejsze
Na lekcji jogi słyszysz polecenia. Każde zaczyna się od ruchu: bend — skłon, sit — usiądź, stand — stań.
Left to lewo, a right to prawo.
# Krok po kroku
Posłuchaj pierwszego słowa: bend, sit albo stand.
Posłuchaj końca: to the left, to the right, on the floor, on one leg.
Zrób ruch.
Przykład: Bend to the right. Bend → skłon, to the right → w prawo. Robisz skłon w prawo.
## Polecenia
stand on one leg: stań na jednej nodze
bend to the left: zrób skłon w lewo
bend to the right: zrób skłon w prawo
sit on the floor: usiądź na podłodze
## Pozycje jogi
the tree — drzewo: stand on one leg
the rainbow — tęcza: bend to the left and to the right
the butterfly — motyl: sit on the floor
# Tak / nie tak
tak: left — lewo | nie: left — prawo | bo: left i lewo zaczynają się na tę samą literę: L.
tak: Sit on the floor. | nie: Sit on the flor. | bo: w słowie floor są dwa „o”, chociaż słychać jedno.
tak: Stand on one leg. | nie: Stand on one legs. | bo: one to jedna, a jedna noga to leg — bez -s na końcu.
tak: right | nie: rait | bo: piszemy r-i-g-h-t. Litery gh są ciche — nie słychać ich.
# Zapamiętaj
Wyciągnij przed siebie obie ręce, kciuki do środka. Lewa ręka (kciuk i palec wskazujący) robi literę L — left, lewo.
# Sprawdź się
wybierz: Uzupełnij polecenie „zrób skłon w lewo”. >> Bend to the ___. | *left | right | leg !! Left to lewo: bend to the left.
wybierz: Który ruch robisz na siedząco? | *sit on the floor | stand on one leg | bend to the right !! Sit to usiądź, więc na siedząco robisz sit on the floor.
`,
);

// ─── Pisownia słówek (str. 8, 9, 12) ──────────────────────────────────────────

const PISOWNIA = en3(
  'b-a3-u1-pisownia',
  130,
  'Pisownia słówek',
  'Napisz słówka z rozdziału bez błędu: posłuchaj, przetłumacz, wybierz dobrą pisownię. Uważaj na podwójne litery.',
  `
do gymnastics = ćwiczyć gimnastykę
gym = sala gimnastyczna
play football = grać w piłkę nożną
football pitch = boisko do piłki nożnej
play basketball = grać w koszykówkę
basketball court = boisko do koszykówki
go swimming = pływać
swimming pool = basen
go running = biegać
running track = bieżnia
stand on one leg = stań na jednej nodze
bend to the left = zrób skłon w lewo
bend to the right = zrób skłon w prawo
sit on the floor = usiądź na podłodze
`,
  `
dyktando: Posłuchaj i wpisz brakujący wyraz. >> We go [swimming]. ?? Po polsku: Pływamy. !! Swimming — podwójne „m”: swim-ming.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> I go [running]. ?? Po polsku: Biegam. !! Running — podwójne „n”: run-ning.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> I play [basketball]. ?? Po polsku: Gram w koszykówkę. !! Basketball to basket (kosz) + ball (piłka). Na końcu dwa „l”.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> We play [football]. ?? Po polsku: Gramy w piłkę nożną. !! Football to foot (stopa) + ball (piłka). W środku „oo”, na końcu dwa „l”.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> I do [gymnastics]. ?? Po polsku: Ćwiczę gimnastykę. !! Gymnastics — po „g” piszemy „y”, jak w słowie gym.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> This is a [gym]. ?? Po polsku: To jest sala gimnastyczna. !! Gym — piszemy „y”, chociaż słychać „i”.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> This is a swimming [pool]. ?? Po polsku: To jest basen. !! Pool — dwa „o”, a słychać długie „u”.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> This is a running [track]. ?? Po polsku: To jest bieżnia. !! Track — na końcu „ck”.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> This is a football [pitch]. ?? Po polsku: To jest boisko do piłki nożnej. !! Pitch — na końcu „tch”, a słychać „cz”.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> This is a basketball [court]. ?? Po polsku: To jest boisko do koszykówki. !! Court — w środku „ou”, a słychać „o”.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Please sit on the [floor]. ?? Po polsku: Usiądź, proszę, na podłodze. !! Floor — dwa „o”.
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Now bend to the [right]. ?? Po polsku: Teraz zrób skłon w prawo. !! Right — litery „gh” są ciche.
wpisz: Napisz po angielsku. >> basen → [swimming pool] ?? Dwa słowa: „pływanie” i „basen”. !! Swimming pool — swimming z podwójnym „m” i pool z dwoma „o”.
wpisz: Napisz po angielsku. >> bieżnia → [running track] ?? Dwa słowa: „bieganie” i „tor”. !! Running track — running z podwójnym „n”, track z „ck” na końcu.
wpisz: Napisz po angielsku. >> sala gimnastyczna → [gym] ?? Krótkie słowo — tylko trzy litery. !! Gym — z „y” w środku.
wpisz: Napisz po angielsku. >> boisko do koszykówki → [basketball court] ?? Dwa słowa: „koszykówka” i „kort”. !! Basketball court — basket + ball i court z „ou”.
wpisz: Napisz po angielsku. >> boisko do piłki nożnej → [football pitch] ?? Dwa słowa: „piłka nożna” i „boisko”. !! Football pitch — foot + ball i pitch z „tch”.
wpisz: Dokończ po angielsku. >> pływać → go [swimming] ?? Słowo kończy się na -ing. !! Go swimming — swimming z podwójnym „m”.
wpisz: Dokończ po angielsku. >> biegać → go [running] ?? Słowo kończy się na -ing. !! Go running — running z podwójnym „n”.
wpisz: Dokończ po angielsku. >> grać w koszykówkę → play [basketball] ?? Kosz to basket, a piłka to ball. !! Play basketball — basket + ball.
wpisz: Dokończ po angielsku. >> ćwiczyć gimnastykę → do [gymnastics] ?? Zaczyna się tak samo jak gym. !! Do gymnastics — gymnastics z „y” po „g”.
wpisz: Dokończ po angielsku. >> grać w piłkę nożną → play [football] ?? Stopa to foot, a piłka to ball. !! Play football — foot + ball.
wybierz: Która pisownia jest poprawna? | *swimming | swiming | swimmimg ?? Posłuchaj: swim-ming. !! Swimming — podwójne „m”.
wybierz: Która pisownia jest poprawna? | *running | runing | runnig ?? Posłuchaj: run-ning. !! Running — podwójne „n” i „ing” na końcu.
wybierz: Która pisownia jest poprawna? | *gymnastics | gimnastics | gymnastiks ?? Pomyśl o słowie gym. !! Gymnastics — „y” po „g” i „cs” na końcu.
wybierz: Która pisownia jest poprawna? | *basketball | basketbal | baskettball ?? Basket to kosz, a ball to piłka. !! Basketball — basket + ball.
wybierz: Która pisownia jest poprawna? | *football | futball | footbal ?? Foot to stopa, a ball to piłka. !! Football — foot + ball.
wybierz: Która pisownia jest poprawna? | *pitch | picz | pich ?? Na końcu są trzy litery. !! Pitch — na końcu „tch”.
`,
  `
Podwójne litery: swimming (mm), running (nn).
Football = foot + ball, basketball = basket + ball — na końcu dwa „l”.
Gym, gymnastics — „y” zamiast „i”.
Dwa „o”: pool, floor.
Końcówki: pitch (tch), track (ck). Court — „ou” w środku. Right — ciche „gh”.
`,
  `
# Najważniejsze
Po angielsku często piszemy inaczej, niż słyszymy.
Największe pułapki: podwójne litery (swimming, running), „oo” (pool, floor) i „y” w słowie gym.
# Krok po kroku
Przeczytaj słówko na głos.
Podziel je na kawałki: swim-ming, run-ning, foot-ball, bas-ket-ball.
Napisz po kawałku i sprawdź pułapki z listy.
Przykład: swimming → swim + ming. Po krótkim „i” podwajamy „m”: swimming.
## Pułapki
swimming: podwójne „mm”
running: podwójne „nn”
football: foot (stopa) + ball (piłka)
basketball: basket (kosz) + ball (piłka)
gym, gymnastics: „y” zamiast „i”
pool, floor: dwa „o”
pitch: na końcu „tch”
track: na końcu „ck”
court: w środku „ou”
right: ciche „gh”
# Tak / nie tak
tak: swimming | nie: swiming | bo: w swim jest krótkie „i”, więc przed -ing dokładamy drugie „m”.
tak: football | nie: futbol | bo: to dwa angielskie słowa: foot + ball. „Futbol” to polska pisownia.
tak: gym | nie: gim | bo: po angielsku w tym słowie piszemy „y”, chociaż słychać „i”.
tak: basketball court | nie: basketball kort | bo: kort to polskie słowo. Po angielsku court — przez „c” i „ou”.
# Zapamiętaj
Ball ma dwie litery „l” — jak dwa słupki bramki.
Pool ma dwa „o” — jak dwa koła ratunkowe w basenie.
# Sprawdź się
wybierz: Która pisownia jest poprawna? | *track | trak | treck !! Track — na końcu „ck”.
wybierz: Która pisownia jest poprawna? | *floor | flor | floore !! Floor — dwa „o” i nic na końcu.
`,
);

// ─── I play… / I don't play… (str. 9) ─────────────────────────────────────────

const I_PLAY = en3(
  'b-a3-u1-i-play',
  140,
  "I play… / I don't play…",
  'Jak powiedzieć, co robisz, a czego nie robisz. Zdania z I i we, twierdzące i przeczące.',
  `
I = ja
we = my
don't = nie (skrót od do not)
do not = nie
play = grać
go = iść, chodzić
do = robić, ćwiczyć
play football = grać w piłkę nożną
play basketball = grać w koszykówkę
go swimming = pływać
go running = biegać
do gymnastics = ćwiczyć gimnastykę
swimming pool = basen
football pitch = boisko do piłki nożnej
running track = bieżnia
gym = sala gimnastyczna
`,
  `
wybierz: Które zdanie znaczy „Gram w koszykówkę”? | *I play basketball. | I don't play basketball. | Do you play basketball? ?? Szukaj zdania bez „nie”. !! I play basketball — gram w koszykówkę. Zdanie z don't znaczy „nie gram”.
wybierz: Które zdanie znaczy „Nie gram w piłkę nożną”? | *I don't play football. | I play football. | I not play football. ?? „Nie” to po angielsku jedno słowo przed „play”. !! Przeczenie: don't przed czasownikiem — I don't play football.
wybierz: Które zdanie znaczy „Pływamy”? | *We go swimming. | We don't go swimming. | We play swimming. ?? We to my. !! We go swimming — pływamy. W pływanie się nie gra, więc nie „play swimming”.
wybierz: Które zdanie znaczy „Nie biegamy”? | *We don't go running. | We go running. | We don't play running. ?? Running łączy się z go. !! We don't go running — nie biegamy.
wybierz: Wybierz brakujące słowo. >> I ___ play football. I play basketball. | *don't | not | no ?? Po polsku: Nie gram w piłkę nożną. Gram w koszykówkę. !! „Nie” przed czasownikiem to don't. Samo „not” albo „no” tu nie pasuje.
wybierz: Wybierz brakujące słowo. >> We ___ swimming in the swimming pool. | *go | play | do ?? Po polsku: Pływamy w basenie. !! Swimming kończy się na -ing, więc go swimming.
wybierz: Wybierz brakujące słowo. >> I ___ gymnastics in the gym. | *do | play | go ?? Po polsku: Ćwiczę gimnastykę na sali gimnastycznej. !! Gimnastykę się „robi”: do gymnastics.
wybierz: Wybierz brakujące słowo. >> We ___ football on the football pitch. | *play | go | do ?? Po polsku: Gramy w piłkę nożną na boisku. !! W piłkę gramy: play football.
wpisz: Zmień na „nie”. >> I play basketball. → I [don't|do not] play basketball. ?? Po polsku: Nie gram w koszykówkę. !! Przed play dopisujemy don't.
wpisz: Zmień na „nie”. >> We go running. → We [don't|do not] go running. ?? Po polsku: Nie biegamy. !! Przed go dopisujemy don't.
wpisz: Zmień na „nie”. >> I do gymnastics. → I [don't|do not] do gymnastics. ?? Po polsku: Nie ćwiczę gimnastyki. !! I don't do gymnastics — dwa razy „do” i tak ma być: don't to „nie”, a do gymnastics to „ćwiczyć gimnastykę”.
wpisz: Zmień na „tak”. >> I don't play football. → I [play] football. ?? Po polsku: Gram w piłkę nożną. !! Bez don't zdanie znaczy „gram”: I play football.
wpisz: Dokończ. >> don't = do [not] !! Don't to skrót od do not.
wybierz: Które zdanie jest poprawne? | *I don't go running. | I go not running. | I no go running. ?? „Nie” stoi przed go. !! Don't stoi przed czasownikiem: I don't go running.
wybierz: Które zdanie jest poprawne? | *We don't do gymnastics. | We don't gymnastics. | We not do gymnastics. ?? Potrzebne są dwa „do”. !! Don't to „nie”, a do gymnastics to „ćwiczyć gimnastykę” — potrzebne są oba.
kliknij: Kliknij słowo, które znaczy „nie”. >> We *don't* go swimming. !! Don't znaczy „nie”: we don't go swimming — nie pływamy.
pary: Ułóż zdanie „Nie gram w piłkę nożną”: połącz numer ze słowem. >> 1 = I ; 2 = don't ; 3 = play ; 4 = football !! I don't play football. Don't stoi przed play.
pary: Ułóż zdanie „Nie pływamy”: połącz numer ze słowem. >> 1 = We ; 2 = don't ; 3 = go ; 4 = swimming !! We don't go swimming. Don't stoi przed go.
sortuj: Robię czy nie robię? >> robię = I play football, We go swimming, I do gymnastics ; nie robię = I don't play basketball, We don't go running !! Zdanie z don't mówi, czego NIE robisz.
`,
  `
Robię: I play football. We go swimming. I do gymnastics.
Nie robię: przed czasownikiem don't — I don't play football. We don't go running. I don't do gymnastics.
don't = do not.
„No” to „nie” tylko w odpowiedzi. W zdaniu: don't.
`,
  `
# Najważniejsze
Gdy coś robisz, mówisz: I play football. We go swimming.
Gdy czegoś nie robisz, przed czasownikiem stawiasz don't: I don't play football. We don't go swimming.
Don't to skrót od do not.
# Krok po kroku
Zacznij od osoby: I (ja) albo we (my).
Nie robisz tego? Dopisz don't.
Dokończ sportem: play football, go running, do gymnastics.
Przykład: Nie biegam. → I → I don't → I don't go running.
## Zdania z podręcznika
I play basketball.: Gram w koszykówkę.
I don't play football.: Nie gram w piłkę nożną.
We go swimming.: Pływamy.
We don't go running.: Nie biegamy.
# Tak / nie tak
tak: I don't play football. | nie: I not play football. | bo: po angielsku samo „not” nie wystarczy. Przed czasownikiem stawiamy don't.
tak: I don't play football. | nie: I no play football. | bo: „no” to „nie” tylko w odpowiedzi: No, I don't. W zdaniu mówimy don't.
tak: I don't do gymnastics. | nie: I don't gymnastics. | bo: don't to tylko „nie”. Nadal potrzebna jest czynność: do gymnastics.
# Zapamiętaj
Don't stoi zawsze tuż przed sportem: I don't play, we don't go, I don't do.
Don't = do not — apostrof zastępuje literę „o”.
# Sprawdź się
wybierz: Które zdanie znaczy „Nie pływam”? | *I don't go swimming. | I not go swimming. | I go swimming. !! Nie pływam — I don't go swimming.
wpisz: Zmień na „nie”. >> We play basketball. → We [don't|do not] play basketball. !! Przed play dopisujemy don't.
`,
);

// ─── Do you play…? Yes, I do. / No, I don't. (str. 13) ───────────────────────

const DO_YOU = en3(
  'b-a3-u1-do-you',
  150,
  'Do you play…? Yes, I do.',
  'Jak zapytać kolegę, czy uprawia jakiś sport, i jak krótko odpowiedzieć „tak” albo „nie”.',
  `
do you = czy (ty)… — na początku pytania
you = ty
yes = tak
no = nie
Yes, I do. = Tak. (krótka odpowiedź)
No, I don't. = Nie. (krótka odpowiedź)
play football = grać w piłkę nożną
play basketball = grać w koszykówkę
go swimming = pływać
go running = biegać
do gymnastics = ćwiczyć gimnastykę
swimming pool = basen
`,
  `
wybierz: Wybierz pytanie: „Czy grasz w piłkę nożną?” | *Do you play football? | You play football? | Play you football? ?? Po angielsku pytanie ma na początku jedno dodatkowe słowo. !! Pytanie zaczynamy od Do: Do you play football?
wybierz: Wybierz pytanie: „Czy pływasz?” | *Do you go swimming? | Do you swimming? | You go swimming? ?? Pływać to go swimming. !! Do you + go swimming: Do you go swimming?
wybierz: Wybierz pytanie: „Czy ćwiczysz gimnastykę?” | *Do you do gymnastics? | Do you gymnastics? | You do gymnastics? ?? Ćwiczyć gimnastykę to do gymnastics. !! Dwa razy „do”: pierwsze robi pytanie, drugie to „ćwiczyć” (do gymnastics).
wybierz: Odpowiedz „tak”. >> Do you play basketball? | *Yes, I do. | Yes, I play. | Yes, I am. ?? Po polsku: Czy grasz w koszykówkę? !! Na pytanie z Do you…? odpowiadamy krótko: Yes, I do.
wybierz: Odpowiedz „nie”. >> Do you go running? | *No, I don't. | No, I do. | No, I not. ?? Po polsku: Czy biegasz? !! Krótka odpowiedź „nie”: No, I don't.
wybierz: Odpowiedz „nie”. >> Do you do gymnastics? | *No, I don't. | No, I play. | Yes, I do. ?? Po polsku: Czy ćwiczysz gimnastykę? !! Odpowiedź „nie” to No, I don't.
wybierz: Jak odpowiesz, jeśli NIE grasz w piłkę nożną? >> Do you play football? | *No, I don't. | Yes, I do. | No, I do. ?? Po polsku: Czy grasz w piłkę nożną? !! Nie grasz, więc: No, I don't.
wpisz: Uzupełnij pytanie. >> [Do] you play football? ?? Po polsku: Czy grasz w piłkę nożną? !! Pytanie zaczynamy od Do.
wpisz: Uzupełnij pytanie. >> Do [you] go swimming? ?? Po polsku: Czy pływasz? !! You to ty: Do you go swimming?
wpisz: Dokończ odpowiedź. >> Do you play basketball? Yes, I [do]. ?? Po polsku: Czy grasz w koszykówkę? — Tak. !! Krótka odpowiedź „tak”: Yes, I do.
wpisz: Dokończ odpowiedź. >> Do you go running? No, I [don't|do not]. ?? Po polsku: Czy biegasz? — Nie. !! Krótka odpowiedź „nie”: No, I don't.
wpisz: Dokończ odpowiedź. >> Do you do gymnastics? Yes, I [do]. ?? Po polsku: Czy ćwiczysz gimnastykę? — Tak. !! Krótka odpowiedź „tak”: Yes, I do.
wybierz: Wybierz brakujące słowo. >> ___ you do gymnastics? | *Do | Are | Is ?? Po polsku: Czy ćwiczysz gimnastykę? !! Pytanie o to, co robisz, zaczynamy od Do.
wybierz: Jak zapytasz kolegę, czy biega? | *Do you go running? | Do you running? | Are you go running? ?? Biegać to go running. !! Do you + go running: Do you go running?
wybierz: Które pytanie jest poprawne? | *Do you play football? | Do you football? | You do play football? ?? W pytaniu są cztery słowa. !! Do + you + play football: Do you play football?
pary: Ułóż pytanie „Czy grasz w koszykówkę?”: połącz numer ze słowem. >> 1 = Do ; 2 = you ; 3 = play ; 4 = basketball? !! Do you play basketball? Pytanie zaczyna się od Do.
pary: Ułóż pytanie „Czy biegasz?”: połącz numer ze słowem. >> 1 = Do ; 2 = you ; 3 = go ; 4 = running? !! Do you go running? Pytanie zaczyna się od Do.
wybierz: Przeczytaj i wybierz brakujące słowa. >> Do you go swimming? Yes, I do. I go swimming in the ___. | *swimming pool | running track | basketball court ?? Po polsku: Czy pływasz? — Tak. Pływam w… !! Pływamy w basenie: swimming pool.
`,
  `
Pytanie: Do you + sport + ? → Do you play football? Do you go swimming? Do you do gymnastics?
Tak: Yes, I do.
Nie: No, I don't.
Na „Do you…?” nie odpowiadamy „Yes, I am” — to odpowiedź na „Are you…?”.
`,
  `
# Najważniejsze
Pytanie o sport zaczynamy od Do you: Do you play football?
Krótka odpowiedź „tak” to Yes, I do. Krótka odpowiedź „nie” to No, I don't.
# Krok po kroku
Zacznij od Do you.
Dodaj sport: play football, go swimming, do gymnastics.
Na końcu postaw znak zapytania.
Przykład: Czy grasz w koszykówkę? → Do you + play basketball + ? → Do you play basketball? Yes, I do.
## Pytania i odpowiedzi
Do you play basketball?: Czy grasz w koszykówkę?
Do you go swimming?: Czy pływasz?
Yes, I do.: Tak.
No, I don't.: Nie.
# Tak / nie tak
tak: Do you play football? | nie: You play football? | bo: po angielsku pytanie potrzebuje na początku Do. Bez niego to zwykłe zdanie.
tak: Yes, I do. | nie: Yes, I am. | bo: pytanie zaczyna się od Do, więc i odpowiedź kończy się na do. „I am” pasuje do pytań z Are you.
tak: No, I don't. | nie: No, I not. | bo: krótka odpowiedź „nie” to No, I don't — z don't, nie z samym not.
tak: Do you do gymnastics? | nie: Do you gymnastics? | bo: pierwsze Do robi pytanie, a drugie do znaczy „ćwiczyć”. Potrzebne są oba.
# Zapamiętaj
Pytanie zaczyna się od Do — i odpowiedź kończy się na do: Yes, I do. / No, I don't.
# Sprawdź się
wybierz: Odpowiedz „tak”. >> Do you go swimming? | *Yes, I do. | Yes, I am. | Yes, I go. !! Na pytanie z Do you…? odpowiadamy: Yes, I do.
wpisz: Uzupełnij pytanie. >> [Do] you go running? !! Pytanie zaczynamy od Do.
`,
);

export const ENGLISH_GRADE3: Topic[] = [SPORTY, JOGA, PISOWNIA, I_PLAY, DO_YOU];
