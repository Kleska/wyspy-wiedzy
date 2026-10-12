# Wersja testowa: czytelniejsza nauka

Prywatny podgląd: https://wyspy-wiedzy-test.mankinz.chatgpt.site

Podgląd jest osobną aplikacją z danymi demonstracyjnymi. Nie podłącza się do konta rodziny w Supabase i nie publikuje zmian na istniejącej stronie GitHub Pages. Dostęp do prywatnego podglądu wymaga konta właściciela.

## Co sprawdzić

- Wybierz Odkrywcę (klasa 3) lub Badaczkę i Koleżankę (klasa 5); można też dodać własny profil testowy.
- Dzisiaj: jedna polecana czynność i dzisiejszy czas nauki. Cały plan rozwija się osobno.
- Nauka: przedmioty, wspólny układ tematów we wszystkich sześciu motywach, powtórki i poprawa błędów.
- Karta tematu: „Poznaj temat” i „Ćwicz”; ściąga, dodatkowe treningi i sprawdzian są pod „Więcej”.
- Gry, Postępy i Nagrody: osobne pozycje w stałym menu ucznia.
- Postępy ucznia: podsumowanie, historia oraz sprawdziany i kartkówki. Filtry okresu, przedmiotu i rodzaju; szczegóły wyniku z błędami do poprawy. Oceny tylko ukończonych sprawdzianów.
- Bohaterowie v3: 6 darmowych postaci na start i 8 premium za 300–500 punktów. Ronaldo i Messi mają zachowane zdjęcia. Pozostałe 12 portretów zmieniono: 8 nowych ilustracji, grafika Harry’ego Pottera przesłana przez użytkownika i 3 zweryfikowane wizerunki postaci ze stron wydawców. Harry korzysta z lokalnego portretu i miniatury twarzy; brak fotografii cosplay. Karty są krótsze, a źródła są rozwijane osobno. Wizerunki wydawców wymagają dostępu do ich serwerów. Przycisk „Powiększ” pozwala obejrzeć grafikę przed wyborem. Źródła i prompty: docs/AVATAR_ART.md.
- Panel rodzica dostępny także bez wyboru dziecka na ekranie profili i przez przycisk „Zaloguj do panelu rodzica” po uwierzytelnieniu konta.
- Kartkówka: zaznacz Badaczkę i Koleżankę jako odbiorców, wybierz tematy i zadaj. Identyczne pytania, osobne podejścia i oceny; „Wyniki grupy” pokazują odbiorców. Odbiorcy muszą mieć profil w tym samym koncie rodziny i tę samą klasę.
- Panel rodzica: PIN demonstracyjny **123456**. Wybierz inne dziecko i przejdź między Postępami, Planem i Tematami — wybór powinien zostać.
- Android / przeglądarka: Wstecz powinno zamknąć otwarte okno lub wrócić do poprzedniego widoku. Po rozpoczęciu odpowiadania w ćwiczeniu wymaga potwierdzenia.

## Ograniczenia podglądu

Dane zapisują się wyłącznie w lokalnej, osobnej bazie `wyspy-wiedzy-test`. Podgląd nie testuje logowania, rzeczywistej synchronizacji rodziny ani płatnego generowania AI. Nie ma service workera, który mógłby utrzymywać starszą wersję testową. Zachowanie synchronizacji jest objęte dotychczasowymi testami logiki.

## Walidacja

- 204 testy Vitest: treści, logika postępów, scalanie danych, arytmetyka oraz 20 testów interfejsu DOM, historia oraz wspólne kartkówki i odblokowywanie portretów.
- TypeScript sprawdza teraz także pliki e2e.
- Osobne kompilacje produkcyjna i testowa.
- Scenariusze Playwright dostosowano do nowych ścieżek; ich wykonanie i wizualna kontrola na telefonie pozostają do sprawdzenia w środowisku z dostępną przeglądarką. Testy DOM nie zastępują kontroli układu na urządzeniu.

## Budowanie

`npm ci`, potem `npm test` i `npm run build:test`.

Gotowy podgląd znajduje się w `dist-staging/`. Skrypt budowania usuwa rzeczywistą konfigurację chmury, manifest PWA oraz service worker. Kompilacja staging dodatkowo ignoruje konfigurację Supabase, niezależnie od zawartości pliku config.js.

Zwykłe `npm run build` zachowuje dotychczasową konfigurację produkcyjną. Dopiero osobna decyzja o scaleniu gałęzi do main uruchamia istniejące wdrożenie GitHub Pages.
