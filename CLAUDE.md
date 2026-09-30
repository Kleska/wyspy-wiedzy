# Wyspy Wiedzy — notatki dla Claude

Aplikacja do nauki dla dziecka (klasa 3+), UI po polsku. React 18 + TypeScript + Vite, PWA, Supabase (opcjonalnie).

## Mapa kodu

- `src/types.ts` — typy: ćwiczenia (choice/tap/sort/fill/match), tematy, zdarzenia (Attempt, Session, Redemption), ustawienia.
- `src/dsl.ts` — format tekstowy zadań (parser, serializacja, sprawdzanie luk). Id zadania = hash treści linii (bez `!!` wyjaśnienia).
- `src/content/seed.ts` — tematy wbudowane (DSL). Zmiana linii zmienia id zadania → reset postępu tego zadania.
- `src/engine.ts` — CAŁY postęp wyliczany z dziennika: XP, monety, poziomy, seria, pudełka Leitnera, zadania dnia, odznaki, układanie sesji.
- `src/data/store.ts` — magazyn: pamięć + IndexedDB (`idb.ts`) + synchronizacja z Supabase (tabela `ww_docs`, kursor po `server_updated_at`, kolejka outbox).
- `src/ai.ts` + `supabase/functions/ai/prompt.ts` (wspólny plik z poleceniem) + `supabase/functions/ai/index.ts` (Edge Function, Deno).
- `src/themes.ts` + `src/styles.css` — 4 motywy przez `data-theme` i zmienne CSS. Motyw nie zmienia logiki.
- `src/ui/` — ekrany: Home (4 układy planszy: map/route/grid/list), Practice, exercises/, Summary, Rewards, parent/.

## Zasady

- Nie zapisuj stanu pochodnego (XP, monet, gwiazdek) — dopisuj zdarzenia i licz w `engine.ts`. To gwarantuje synchronizację bez konfliktów.
- Nowy typ zadania: `types.ts` → `dsl.ts` (parse + `exerciseToDsl`) → `ui/exercises/logic.ts` (initial/ready/correct/correctText/summary) → komponent w `Exercises.tsx` → `supabase/functions/ai/prompt.ts` (opis formatu) → testy.
- Treści dla dziecka: bezbłędna polszczyzna, jednoznaczne odpowiedzi. Każdy temat wbudowany musi przejść `npm test` (test parsuje wszystkie).
- Polskie formy liczebników: `plural()` z `themes.ts`.
- Przed commitem: `npm test && npm run build`; przy zmianach UI także `CHROME_PATH=... npm run e2e`.
