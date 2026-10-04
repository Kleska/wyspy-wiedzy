# Wyspy Wiedzy

Aplikacja do nauki w przeglądarce dla ucznia (start: klasa 3). Działa na iPadzie, Androidzie i Windowsie,
można ją zainstalować na ekranie głównym i używać bez internetu. Postępy synchronizują się między urządzeniami.

**Co jest w środku**

- Kilka osób na jednym koncie: każde dziecko ma swój profil, klasę, postępy, punkty i wygląd.
  Przy uruchomieniu aplikacja pyta „Kto się dziś uczy?”.
- Ekran startowy: powitanie, karta „Teraz” (plan od rodzica, a gdy go nie ma — temat ostatnio ćwiczony albo polecany),
  kartkówki, przedmioty, powtórka; niżej zwijane karty (zadania na dziś, cele, mini-gry, test na start).
  Po wejściu w przedmiot — plansza z tematami jednego działu dla klasy dziecka.

- 6 wyglądów do przełączania przez dziecko: *Wyspy Wiedzy* (domyślny), *Akademia Pilotów*, *Pixel Quest*, *Zeszyt*, *Kosmos*, *Wyścigi* —
  przy wyborze widać miniaturę każdego. W tym samym oknie („Wygląd”) dziecko zmienia też swojego bohatera.
- 6 typów zadań: wybór odpowiedzi, klikanie słów w zdaniu, sortowanie do koszyków (przeciąganie lub stuknięcia),
  uzupełnianie luk (z przyciskami ą ć ę ł ń ó ś ź ż), łączenie w pary i dyktando (aplikacja czyta zdanie na głos).
- Każdy temat ma ściągę (zasada z przykładami): widać ją przed tematem i po błędnej odpowiedzi.
- Język obcy: „Podpowiedź” pokazuje polskie tłumaczenie zdania i znaczenie słówek, które w nim występują;
  temat ma listę słówek z wymową (głośnik) i trybem „ukryj tłumaczenia”; pod tekstem do czytania są „Słówka z tekstu”.
  Zdania czyta angielski głos, przy wpisywaniu jest klawisz apostrofu (isn't), a apostrof z iPada (’) liczy się jak zwykły.
- Tematy startowe:
  - klasa 3 — polski: rzeczownik, czasownik, przymiotnik, mieszanka części mowy, czasy czasownika, osoba i liczba;
    matematyka: dodawanie i odejmowanie do 100, mnożenie przez 6 i 7 oraz 8 i 9, dzielenie, zadania z treścią;
  - klasa 5 — polski: przypadki, stopniowanie przymiotnika, ó/u, „nie” z częściami mowy, części mowy odmienne
    i nieodmienne, podmiot i orzeczenie; matematyka: dzielenie pisemne bez reszty i z resztą (same słupki z kratkami, w które
    dziecko wpisuje cyfry na ekranie jak na karcie pracy; dzielnik jedno- i dwucyfrowy; lekcja, w której słupek
    odsłania się krok po kroku; sprawdzenie mnożeniem pisemnym też w kratkach; serie po 5 przykładów z nowymi
    liczbami w karcie tematu — „Nowe liczby bez końca”),
    ułamki (skracanie, dodawanie, odejmowanie), ułamki dziesiętne,
    pole i obwód, kolejność działań, cechy podzielności;
  - dyktanda dla klasy 3 i 5 (ó, rz, ż, ch, h);
  - czytanie ze zrozumieniem dla klasy 3 i 5 (teksty z pytaniami; tekst jest nad każdym pytaniem);
  - klasa 5 — angielski, dział powtórzeniowy „Unit 0”: to be, kraje i narodowości, miesiące, have got, can,
    there is / there are, this / that / these / those, zaimki dzierżawcze i przymiotniki, czytanie po angielsku.
  Wyniki zadań matematycznych są liczone w kodzie, nie wpisywane ręcznie.
- Poziomy tematów (Nowy → Próbowany → Znany → Biegły → Opanowany) — rosną i spadają razem z pamięcią dziecka;
  po ćwiczeniu ekran „Co się zmieniło”.
- Sprawdzian z oceną 1–6 (bez podpowiedzi, z listą błędów i „Popraw błędy”), test na start, który od razu
  zalicza znane tematy, trening matematyki bez końca (zawsze nowe liczby) oraz mini-gry na ekranie startowym:
  Błyskawica (60 sekund na rekord) i Pary na czas (połącz 6 par jak najszybciej).
- „Moje błędy”: jednym przyciskiem dziecko poprawia zadania, w których pomyliło się w ostatnich 2 tygodniach.
- Mapa tabliczki mnożenia 10 × 10: zielone — umie na pamięć (dobrze i szybko), żółte — uczy się, czerwone — do poprawy;
  przycisk „Ćwicz najsłabsze”.
- Sprawdzian w szkole? Zdjęcie zakresu (albo opis) → AI dobiera pasujące tematy, układa brakujące zadania i ustawia
  plan z terminem. Działa też bez klucza API, przez zwykły czat z Claude.
- Tryb nauki: przed ćwiczeniami dziecko czyta krótką lekcję w kartach na jeden ekran — najważniejsze w trzech
  zdaniach, krok po kroku z przykładem, „tak / nie tak” (typowy błąd obok poprawnej wersji, z powodem), sposób na
  zapamiętanie i 2–3 pytania kontrolne z wyjaśnieniem. „Powtórka” zbiera najważniejsze rzeczy z całego rozdziału
  albo planu na jednej stronie. Karta planu prowadzi po kolei: Nauka → Ćwiczenia → Sprawdzian próbny, a „Popraw swoje
  błędy” układa sesję z zadań z planu, w których dziecko się pomyliło. Lekcje do własnych tematów wpisuje się
  w edytorze tematu (pole „Lekcja”).
- Działy: każdy temat należy do działu (np. „Ułamki zwykłe”, „Części mowy”, „Unit 0”) — plansza przedmiotu pokazuje
  jeden dział naraz, a listy tematów w panelu rodzica są zwijanymi działami (z przyciskiem „Zaznacz dział”).
  Własnemu tematowi dział wpisuje się w edytorze; bez działu trafia do „Pozostałych”.
- Porządek tematów dla każdego dziecka osobno (Panel rodzica → Tematy → „Dla kogo”): **Teraz** — temat jest w planie
  i stoi na górze ekranu startowego; **Biblioteka** — zwykły temat na planszy; **Skończony** — schodzi z planszy do
  zwiniętej sekcji „Skończone”, ale zostaje w powtórkach, „Moich błędach” i sprawdzianach. Cały dział przenosi się
  jednym przyciskiem. Po terminie planu panel rodzica pyta raz: przenieść tematy do skończonych, zostawić na
  planszy czy przedłużyć plan o tydzień.
- Kartkówka od rodzica: w panelu rodzica wybierasz dziecko, tematy, liczbę pytań i termin; dziecko widzi ją na
  ekranie startowym, pisze raz, bez podpowiedzi, a ocena wraca do panelu rodzica (przy koncie rodziny — na żywo).
- Błędy z kartkówek i sprawdzianów: dziecko po napisaniu widzi pytania, w których się pomyliło (swoją odpowiedź,
  poprawną i wyjaśnienie), i może do nich wrócić z karty kartkówki („Zobacz błędy”). Rodzic widzi te same pytania
  w „Plan i sprawdziany” i jednym przyciskiem zadaje kartkówkę dokładnie z nich — albo ze wszystkich niepoprawionych
  błędów z ostatnich 30 dni („Kartkówka z błędów”).
- Plan od rodzica (tematy przypięte np. przed sprawdzianem w szkole, z terminem i sprawdzianem próbnym),
  cel tygodnia, zamrożenie serii, kamienie milowe serii, wspólny cel rodzeństwa.
- Powtórki rozłożone w czasie: błędne zadania wracają na końcu ćwiczenia i w kolejnych dniach (1, 2, 4, 7, 14 dni).
  Gwiazdki tematu rosną dopiero, gdy dziecko pamięta zadania przez kilka dni.
- Punkty doświadczenia i poziomy, waluta (muszelki/monety/punkty), seria dni, 3 zadania dnia i skrzynia,
  20 odznak, sklep z bohaterami, prawdziwe nagrody zatwierdzane przez rodzica (z listą gotowych pomysłów).
- Liczenie aktywnego czasu nauki (tylko gdy ekran jest widoczny i dziecko coś robi), statystyki dla rodzica:
  minuty dziennie, poprawność, poziomy tematów, zadania sprawiające kłopot razem z błędnymi odpowiedziami dziecka,
  raport tygodnia do udostępnienia (np. w wiadomości), historia sesji i sprawdzianów.
- Panel rodzica za 6-cyfrowym PIN-em: dodawanie tematów ręcznie, ze zdjęcia książki (AI), z opisu (AI) albo przez zwykły
  czat z Claude (bez klucza API), import/eksport kopii zapasowej.
- Czytanie poleceń na głos (głos systemowy pl-PL), dźwięki.

## Jak to działa (w skrócie)

```
przeglądarka (React, PWA)                           Supabase (darmowy plan)
┌──────────────────────────────┐   synchronizacja   ┌─────────────────────────┐
│ IndexedDB: dziennik odpowiedzi│ ◄───────────────► │ tabela ww_docs + RLS     │
│ postęp liczony z dziennika    │                   │ funkcja „ai” → Claude API│
└──────────────────────────────┘                    └─────────────────────────┘
```

Aplikacja zapisuje **zdarzenia** (każdą odpowiedź, każdą sesję), a XP, monety, serię i opanowanie **wylicza** z nich.
Urządzenia tylko dopisują zdarzenia, więc przełączanie się między iPadem, telefonem i komputerem nie powoduje
konfliktów ani utraty postępu. Bez internetu wszystko działa, a zaległe zapisy wysyłają się po połączeniu.

Bez konfiguracji chmury aplikacja działa w trybie lokalnym (jedno urządzenie).

## Uruchomienie — krok po kroku

### 1. GitHub (hosting aplikacji)

1. Utwórz puste repozytorium, np. `wyspy-wiedzy` (może być prywatne tylko na płatnym planie GitHub — na darmowym
   GitHub Pages wymaga repozytorium publicznego; w kodzie nie ma żadnych sekretów).
2. Wgraj ten kod (`git push`) na gałąź `main`.
3. **Settings → Pages → Source: GitHub Actions.** Po chwili aplikacja będzie pod adresem
   `https://<twój-login>.github.io/wyspy-wiedzy/`.

### 2. Supabase (konto rodziny: wspólne postępy na żywo na wszystkich urządzeniach)

Po włączeniu rodzic widzi u siebie postępy z tabletu dziecka (po sekundzie–dwóch), a plan, tematy i nagrody
ustawione na telefonie rodzica od razu trafiają na urządzenia dzieci.

1. Załóż projekt na [supabase.com](https://supabase.com) (region: Frankfurt, plan Free).
2. **SQL Editor → New query** → wklej zawartość `supabase/migrations/001_init.sql` → **Run**
   (tabela, ochrona danych RLS i kanał „na żywo”; skrypt można uruchomić ponownie bez szkody).
3. **Authentication → Users → Add user → Create new user**: e-mail i hasło konta rodziny, zaznacz *Auto Confirm User*.
4. **Authentication → Sign In / Providers**: wyłącz *Allow new users to sign up* (nikt obcy nie założy konta).
5. **Project Settings → API Keys** (albo przycisk **Connect**): skopiuj *Project URL* i klucz *publishable*
   (`sb_publishable_…`; w starszych projektach *anon*) do `public/config.js`:
   ```js
   window.WW_CONFIG = { supabaseUrl: "https://xxxx.supabase.co", supabaseAnonKey: "sb_publishable_..." };
   ```
   Ten klucz jest publiczny z założenia — dostęp do danych chroni RLS (każde konto widzi tylko swoje wiersze).
   Klucza *secret* / *service_role* nigdy tu nie wklejaj.
6. Zrób commit i push. Na każdym urządzeniu otwórz adres aplikacji i raz zaloguj się kontem rodziny
   (dopóki urządzenie nie jest zalogowane, aplikacja pokazuje ekran logowania).

Jak to działa po włączeniu:

- **Kolejność pierwszego logowania:** zaloguj najpierw urządzenie rodzica. Pierwsze urządzenie wysyła do chmury
  swoje ustawienia rodziny (PIN, nagrody, wspólny cel); każde kolejne przyjmuje je z chmury, a dokłada swoje
  osoby, odpowiedzi i tematy. Od tej chwili PIN jest jeden na wszystkich urządzeniach.
- **To samo dziecko na liście dwa razy** (profil założony osobno na dwóch urządzeniach): Panel rodzica →
  Ustawienia → przy zbędnym profilu „Połącz z…” — postępy z obu profili się zsumują.
- **Zapomniany PIN:** na ekranie PIN-u „Nie pamiętam PIN-u” → hasło konta rodziny → nowy PIN.
- **Zmiany z dwóch urządzeń naraz** scalają się pole po polu (np. dziecko zmienia wygląd offline, a rodzic
  w tym czasie ustawia plan — zostaje jedno i drugie). Odpowiedzi są tylko dopisywane, więc nic nie ginie.
- **Bez internetu** aplikacja działa normalnie i dosyła zaległe zapisy po połączeniu. Sygnał „na żywo” tylko
  przyspiesza pobieranie — gdy go zabraknie, urządzenie pobiera zmiany przy otwarciu aplikacji i co minutę.
- **Darmowy plan Supabase** usypia projekt po około tygodniu bez ruchu (np. wakacje). Dostaniesz e-mail;
  w panelu Supabase wystarczy kliknąć *Resume project* — dane zostają, a aplikacja w tym czasie działa lokalnie.

### 3. AI — zadania ze zdjęcia książki i z opisu (opcjonalnie)

Funkcja w chmurze trzyma klucz API na serwerze i wymaga PIN-u rodzica, więc dziecko nie wyda środków.

1. Utwórz klucz na [console.anthropic.com](https://console.anthropic.com) i doładuj konto (płatność za użycie;
   jeden temat to zwykle kilka groszy — zdjęcia są pomniejszane przed wysłaniem).
2. Wdróż funkcję (w terminalu, w katalogu projektu):
   ```bash
   npx supabase login
   npx supabase functions deploy ai --project-ref <ref-projektu>
   npx supabase secrets set --project-ref <ref-projektu> ANTHROPIC_API_KEY=sk-ant-... PARENT_PIN=1234
   ```
   `PARENT_PIN` ustaw na ten sam PIN, którego używasz w panelu rodzica.
   Opcjonalnie: `ANTHROPIC_MODEL` (domyślnie `claude-sonnet-5-5`), `ALLOWED_ORIGIN=https://<login>.github.io`.

Bez klucza API też możesz generować zadania: **Panel rodzica → Dodaj → „Bez klucza: przez czat z Claude”**
kopiuje gotowe polecenie; wklejasz je do zwykłego czatu z Claude (z dołączonym zdjęciem), a odpowiedź wklejasz z powrotem.

Jest też tryb awaryjny: klucz API wpisany w **Ustawieniach** działa tylko w tej przeglądarce (wpisuj go wyłącznie
na własnym urządzeniu).

### 4. Na tablecie i telefonie

- **iPad / iPhone (Safari):** Udostępnij → *Do ekranu początkowego*. To ważne: Safari może usuwać dane stron
  nieużywanych przez 7 dni, a aplikacje dodane do ekranu początkowego są z tego wyłączone. Z chmurą postęp i tak
  jest bezpieczny na serwerze.
- **Android (Chrome):** menu ⋮ → *Zainstaluj aplikację*.
- **Windows (Edge/Chrome):** ikona instalacji w pasku adresu.

## Dodawanie zadań ręcznie — format tekstowy

Jedno zadanie w jednej linii. `!!` na końcu dodaje wyjaśnienie, które dziecko zobaczy po odpowiedzi.

```
wybierz: Które słowo jest czasownikiem? | *biega | kot | szybki | bardzo !! Biega — co robi? To czasownik.
wybierz: W jakim czasie jest czasownik? >> Wczoraj {pojechałem} rowerem. | *przeszłym | teraźniejszym | przyszłym
kliknij: Kliknij wszystkie rzeczowniki. >> *Kot* śpi na *kanapie*.
sortuj: Posegreguj słowa. >> rzeczownik = kot, dom ; czasownik = biega, pisze ; przymiotnik = mały, zielona
wpisz: Odmień czasownik „pisać”. >> ja piszę, ty [piszesz], oni [piszą]
wpisz: Zamień na czas przeszły. >> Wczoraj [rysowałem|rysowałam].
pary: Połącz osobę z czasownikiem. >> ja = skaczę ; ty = skaczesz ; oni = skaczą
dyktando: Posłuchaj i wpisz brakujący wyraz. >> Latem jedziemy nad [morze]. !! Morze — rz wymienia się na r: morski.
tekst: Jeż w ogrodzie >> Wieczorem Zosia zobaczyła jeża. // Jeż szukał jedzenia pod krzakiem.
wybierz: Gdzie jeż szukał jedzenia? | *pod krzakiem | pod drzewem | przy furtce
tekst: koniec
```

Linia `tekst:` wprowadza tekst do czytania ze zrozumieniem — zadania pod nią są pytaniami do tego tekstu
(aż do następnej linii `tekst:` albo `tekst: koniec`). `//` dzieli tekst na akapity.

- `*gwiazdka*` — dobra odpowiedź (w `wybierz` przed odpowiedzią, w `kliknij` wokół słowa).
- `{nawias}` — wyróżnione słowo w zdaniu, `___` — luka do pokazania.
- `[a|b]` — luka do wpisania; wszystkie akceptowane odpowiedzi rozdzielone `|`. Wielkość liter i kropka na końcu
  nie mają znaczenia, polskie znaki mają.
- `?? podpowiedź` — przed wyjaśnieniem (`!!`): dziecko widzi ją po stuknięciu „Podpowiedź”, np. tłumaczenie
  zdania: `wybierz: Wybierz formę. >> My sister ___ ten. | *is | are ?? Po polsku: Moja siostra ma dziesięć lat. !! She → is.`
- Słówka tematu (pole „Słówka” w edytorze, przy języku obcym): linie `wardrobe = szafa` — lista do nauki z wymową
  i źródło podpowiedzi do słów w zdaniach.

Edytor w panelu rodzica pokazuje podgląd i błędy linia po linii.

## Rozwój i zmiany

```bash
npm install
npm run dev        # serwer deweloperski (też w sieci lokalnej — otwórz z iPada)
npm test           # testy jednostkowe (format zadań, silnik postępu, wszystkie tematy wbudowane)
npm run e2e        # testy w przeglądarce (tablet + telefon)
npm run build      # wersja produkcyjna do dist/
```

Zmiany możesz zlecać Claude: podłącz to repozytorium w nowej sesji z Claude i opisz, co zmienić
(np. „dodaj temat: ortografia ó/u”, „dodaj typ zadania: układanie zdania z rozsypanki”). Opis architektury dla
Claude jest w `CLAUDE.md`. Po `git push` GitHub sam zbuduje i opublikuje nową wersję.

## Prywatność i bezpieczeństwo

- Dane dziecka (imię, odpowiedzi, czasy) trafiają tylko do Twojego projektu Supabase. Brak analityki i reklam.
- Czcionki są w paczce aplikacji — żadnych zapytań do Google Fonts.
- PIN panelu rodzica to zabezpieczenie „przed dzieckiem”, nie przed atakującym: dziecko korzysta z tego samego
  konta rodziny, więc technicznie ma dostęp do danych rodziny. Realną barierą przy AI jest PIN sprawdzany na serwerze.
- Zdjęcia z książki nie są nigdzie zapisywane — idą tylko do wygenerowania zadań.
- Zadania z AI zawsze przechodzą przez podgląd rodzica przed zapisaniem; AI potrafi się pomylić w gramatyce.
