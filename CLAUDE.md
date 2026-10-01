# Wyspy Wiedzy — notatki dla Claude

Aplikacja do nauki dla dziecka (klasa 3+), UI po polsku. React 18 + TypeScript + Vite, PWA, Supabase (opcjonalnie).

## Mapa kodu

- `src/types.ts` — typy: ćwiczenia (choice/tap/sort/fill/match/dictation), tematy (z `guide` — ściąga), zdarzenia (Attempt z `answer` przy błędach, Session z `mode`: topic/review/test/diagnostic/gen/fix/sprint/pairs (`durationMs` dla Par na czas), Redemption), ustawienia (`familyGoal`), Profile (`plan`).
- `src/dsl.ts` — format tekstowy zadań (parser, serializacja, sprawdzanie luk). Id zadania = hash treści linii (bez `!!` wyjaśnienia).
- `src/content/seed.ts` (+ `math.ts`, `polish5.ts`, `dictation.ts`, `guides.ts`, `util.ts`) — tematy wbudowane (DSL) z polem `grades`; ściągi w `guides.ts` (test wymaga ściągi dla każdego tematu). Matematyka generowana kodem (wyniki liczone). Zmiana treści linii zmienia id zadania → reset postępu tego zadania; wyjaśnienie po `!!` można zmieniać bez resetu.
- `src/content/generators.ts` — trening bez końca i Błyskawica (zadania losowane, `topicId` = `gen:<id>`, bez pudełek Leitnera). `rewardIdeas.ts` — pomysły na nagrody.
- Profile mają `grade`; `store.topicsFor(profileId)` filtruje tematy po klasie. Start = wybór przedmiotu (`Home`), potem `SubjectScreen`.
- `src/engine.ts` — CAŁY postęp wyliczany z dziennika: XP, monety, poziomy, seria (z zamrożeniami = Redemption `freeze`), kamienie milowe, pudełka Leitnera, poziomy tematów 0–4 (z zaliczeniem testem: ≥3 odpowiedzi i 80% w sprawdzianie/teście na start → reszta zadań wirtualnie w pudełku 2), cel tygodnia, oceny 1–6, zasady Błyskawicy, cel rodziny, układanie sesji (temat, powtórka, sprawdzian, test na start).
- `src/data/store.ts` — magazyn: pamięć + IndexedDB (`idb.ts`) + synchronizacja z Supabase (tabela `ww_docs`, kursor po `server_updated_at`, kolejka outbox).
- `src/ai.ts` + `supabase/functions/ai/prompt.ts` (wspólny plik z poleceniem) + `supabase/functions/ai/index.ts` (Edge Function, Deno).
- `src/themes.ts` + `src/styles.css` — 4 motywy przez `data-theme` i zmienne CSS. Motyw nie zmienia logiki.
- `src/ui/` — ekrany: Home (plan, cel tygodnia, cel rodziny, test na start; SubjectScreen z 4 układami planszy i „Wyzwaniami”), Practice (rodzaje: `Run` w `hooks.ts`), Sprint (Błyskawica), Pairs (Pary na czas), ThemePreview (miniatury motywów przez lokalne `data-theme`), exercises/, Summary (ocena, „Co się zmieniło”, błędy), Rewards (zamrożenie), bits.tsx (Modal, LevelChip, ściąga), parent/ (Postępy z raportem, Plan i sprawdziany, Tematy, Dodaj, Nagrody z celem rodziny, Ustawienia).

## Zasady

- Nie zapisuj stanu pochodnego (XP, monet, gwiazdek) — dopisuj zdarzenia i licz w `engine.ts`. To gwarantuje synchronizację bez konfliktów.
- Nowy typ zadania: `types.ts` → `dsl.ts` (parse + `exerciseToDsl`) → `ui/exercises/logic.ts` (initial/ready/correct/correctText/summary) → komponent w `Exercises.tsx` → `supabase/functions/ai/prompt.ts` (opis formatu) → testy.
- Treści dla dziecka: bezbłędna polszczyzna, jednoznaczne odpowiedzi. Każdy temat wbudowany musi przejść `npm test` (test parsuje wszystkie).
- Polskie formy liczebników: `plural()` z `themes.ts`.
- Przed commitem: `npm test && npm run build`; przy zmianach UI także `CHROME_PATH=... npm run e2e` (testy przeglądarkowe działają na zbudowanym `dist`, więc najpierw `npm run build`).
