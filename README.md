# Wyspy Wiedzy

Aplikacja do nauki w przeglądarce dla ucznia (start: klasa 3). Działa na iPadzie, Androidzie i Windowsie,
można ją zainstalować na ekranie głównym i używać bez internetu. Postępy synchronizują się między urządzeniami.

**Co jest w środku**

- Kilka osób na jednym koncie: każde dziecko ma swój profil, klasę, postępy, punkty i wygląd.
  Przy uruchomieniu aplikacja pyta „Kto się dziś uczy?”.
- Start od wyboru przedmiotu (Język polski, Matematyka), potem plansza z tematami dla klasy dziecka.

- 4 wyglądy do przełączania przez dziecko: *Wyspy Wiedzy* (domyślny), *Akademia Pilotów*, *Pixel Quest*, *Zeszyt*.
- 6 typów zadań: wybór odpowiedzi, klikanie słów w zdaniu, sortowanie do koszyków (przeciąganie lub stuknięcia),
  uzupełnianie luk (z przyciskami ą ć ę ł ń ó ś ź ż), łączenie w pary i dyktando (aplikacja czyta zdanie na głos).
- Każdy temat ma ściągę (zasada z przykładami): widać ją przed tematem i po błędnej odpowiedzi.
- Tematy startowe:
  - klasa 3 — polski: rzeczownik, czasownik, przymiotnik, mieszanka części mowy, czasy czasownika, osoba i liczba;
    matematyka: dodawanie i odejmowanie do 100, mnożenie przez 6 i 7 oraz 8 i 9, dzielenie, zadania z treścią;
  - klasa 5 — polski: przypadki, stopniowanie przymiotnika, ó/u, „nie” z częściami mowy, części mowy odmienne
    i nieodmienne, podmiot i orzeczenie; matematyka: ułamki (skracanie, dodawanie, odejmowanie), ułamki dziesiętne,
    pole i obwód, kolejność działań, cechy podzielności;
  - dyktanda dla klasy 3 i 5 (ó, rz, ż, ch, h).
  Wyniki zadań matematycznych są liczone w kodzie, nie wpisywane ręcznie.
- Poziomy tematów (Nowy → Próbowany → Znany → Biegły → Opanowany) — rosną i spadają razem z pamięcią dziecka;
  po ćwiczeniu ekran „Co się zmieniło”.
- Sprawdzian z oceną 1–6 (bez podpowiedzi, z listą błędów i „Popraw błędy”), test na start, który od razu
  zalicza znane tematy, trening matematyki bez końca (zawsze nowe liczby) i Błyskawica — 60 sekund na rekord.
- Plan od rodzica (tematy przypięte np. przed sprawdzianem w szkole, z terminem i sprawdzianem próbnym),
  cel tygodnia, zamrożenie serii, kamienie milowe serii, wspólny cel rodzeństwa.
- Powtórki rozłożone w czasie: błędne zadania wracają na końcu ćwiczenia i w kolejnych dniach (1, 2, 4, 7, 14 dni).
  Gwiazdki tematu rosną dopiero, gdy dziecko pamięta zadania przez kilka dni.
- Punkty doświadczenia i poziomy, waluta (muszelki/monety/punkty), seria dni, 3 zadania dnia i skrzynia,
  20 odznak, sklep z bohaterami, prawdziwe nagrody zatwierdzane przez rodzica (z listą gotowych pomysłów).
- Liczenie aktywnego czasu nauki (tylko gdy ekran jest widoczny i dziecko coś robi), statystyki dla rodzica:
  minuty dziennie, poprawność, poziomy tematów, zadania sprawiające kłopot razem z błędnymi odpowiedziami dziecka,
  raport tygodnia do udostępnienia (np. w wiadomości), historia sesji i sprawdzianów.
- Panel rodzica za PIN-em: dodawanie tematów ręcznie, ze zdjęcia książki (AI), z opisu (AI) albo przez zwykły
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

### 2. Supabase (wspólne postępy na wszystkich urządzeniach)

1. Załóż projekt na [supabase.com](https://supabase.com) (region: Frankfurt).
2. **SQL Editor → New query** → wklej zawartość `supabase/migrations/001_init.sql` → **Run**.
3. **Authentication → Users → Add user → Create new user**: e-mail i hasło konta rodziny, zaznacz *Auto Confirm User*.
4. **Authentication → Sign In / Providers**: wyłącz *Allow new users to sign up* (nikt obcy nie założy konta).
5. **Project Settings → API**: skopiuj *Project URL* i klucz *anon / publishable* do `public/config.js`:
   ```js
   window.WW_CONFIG = { supabaseUrl: "https://xxxx.supabase.co", supabaseAnonKey: "eyJ..." };
   ```
   Ten klucz jest publiczny z założenia — dostęp do danych chroni RLS (każde konto widzi tylko swoje wiersze).
6. Zrób commit i push. Na każdym urządzeniu otwórz adres aplikacji i raz zaloguj się kontem rodziny.

Dane zebrane wcześniej w trybie lokalnym zostaną wysłane do chmury przy pierwszym logowaniu na tym urządzeniu.

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
```

- `*gwiazdka*` — dobra odpowiedź (w `wybierz` przed odpowiedzią, w `kliknij` wokół słowa).
- `{nawias}` — wyróżnione słowo w zdaniu, `___` — luka do pokazania.
- `[a|b]` — luka do wpisania; wszystkie akceptowane odpowiedzi rozdzielone `|`. Wielkość liter i kropka na końcu
  nie mają znaczenia, polskie znaki mają.

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
