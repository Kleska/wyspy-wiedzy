import { test as base, expect, type BrowserContext } from '@playwright/test';

/*
 * Testy działają na zbudowanej aplikacji, a ta ma w `config.js` prawdziwe konto rodziny (Supabase).
 * Żeby testy nie dotykały prawdziwych danych i nie zatrzymywały się na ekranie logowania, każde „urządzenie”
 * w teście dostaje pustą konfigurację — aplikacja działa wtedy lokalnie. Test synchronizacji podmienia ją
 * na atrapę chmury (`e2e/sync.spec.ts`).
 */
export const LOCAL_CONFIG = 'window.WW_CONFIG = { supabaseUrl: "", supabaseAnonKey: "" };';

export async function useLocalConfig(context: BrowserContext) {
  await context.route('**/config.js', (route) => route.fulfill({ contentType: 'application/javascript', body: LOCAL_CONFIG }));
  // Bezpiecznik: żadne zapytanie z testów nie wychodzi do prawdziwego Supabase.
  await context.route(/^https:\/\/[a-z0-9]+\.supabase\.co\//, (route) => route.abort());
}

export const test = base.extend<{ localConfig: void }>({
  localConfig: [
    async ({ context }, use) => {
      await useLocalConfig(context);
      await use();
    },
    { auto: true },
  ],
});

export { expect };
