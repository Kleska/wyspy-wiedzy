import type { Browser, BrowserContext, Page, Route, WebSocketRoute } from '@playwright/test';
import { expect, test, useLocalConfig } from './fixtures';

/*
 * Synchronizacja między urządzeniami. Zamiast prawdziwego Supabase używamy atrapy w pamięci testu:
 * odpowiada na logowanie i na zapytania do tabeli `ww_docs` tak jak PostgREST, a przez WebSocket wysyła
 * sygnały „na żywo” tak jak Supabase Realtime (protokół Phoenix, wiadomości [join_ref, ref, temat, zdarzenie, treść]).
 * Dwa konteksty przeglądarki
 * to dwa urządzenia (telefon rodzica i tablet córki) podłączone do tej samej „chmury”.
 */

const SUPA = 'https://fake-project.supabase.co';
const EMAIL = 'rodzina@example.com';
const PASSWORD = 'tajne-haslo';
const USER_ID = '11111111-2222-4333-8444-555555555555';

const shots = process.env.SHOTS_DIR;
async function snap(page: Page, name: string) {
  if (shots) await page.screenshot({ path: `${shots}/${test.info().project.name}-${name}.png`, fullPage: true });
}

const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*', 'access-control-expose-headers': '*' };
const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');

interface Row {
  family_id: string;
  kind: string;
  id: string;
  data: Record<string, unknown>;
  deleted: boolean;
  server_updated_at: string;
}

class FakeSupabase {
  rows = new Map<string, Row>();
  offline = new Set<BrowserContext>();
  /** Sygnały „na żywo” wysłane do urządzeń (do sprawdzenia w teście). */
  liveSignals = 0;
  private clock = Date.now();
  private sockets = new Map<WebSocketRoute, { ctx: BrowserContext; topics: Map<string, number[]> }>();

  private session() {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const user = { id: USER_ID, aud: 'authenticated', role: 'authenticated', email: EMAIL, app_metadata: { provider: 'email' }, user_metadata: {}, identities: [], created_at: '2026-10-01T00:00:00Z' };
    const access_token = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: USER_ID, role: 'authenticated', aud: 'authenticated', email: EMAIL, exp })}.podpis`;
    return { access_token, token_type: 'bearer', expires_in: 3600, expires_at: exp, refresh_token: 'odswiez', user };
  }

  /** Włącza „chmurę” na urządzeniu: konfiguracja aplikacji wskazuje atrapę, a zapytania trafiają tutaj. */
  async enable(ctx: BrowserContext) {
    await ctx.route('**/config.js', (r) => r.fulfill({ contentType: 'application/javascript', body: `window.WW_CONFIG = { supabaseUrl: "${SUPA}", supabaseAnonKey: "sb_publishable_test" };` }));
    await ctx.route(`${SUPA}/**`, (r) => this.handle(ctx, r));
    await ctx.routeWebSocket(/fake-project\.supabase\.co\/realtime/, (ws) => {
      const state = { ctx, topics: new Map<string, number[]>() };
      this.sockets.set(ws, state);
      ws.onClose(() => this.sockets.delete(ws));
      ws.onMessage((raw) => {
        const [joinRef, ref, topic, event, payload] = JSON.parse(String(raw)) as [string | null, string | null, string, string, { config?: { postgres_changes?: object[] } }];
        let response: object = {};
        if (event === 'phx_join') {
          const filters = (payload.config?.postgres_changes ?? []).map((f, i) => ({ ...f, id: i + 1 }));
          state.topics.set(topic, filters.map((f) => f.id));
          response = { postgres_changes: filters };
        }
        if (event === 'phx_leave') state.topics.delete(topic);
        if (ref) ws.send(JSON.stringify([joinRef, ref, topic, 'phx_reply', { status: 'ok', response }]));
      });
    });
  }

  /** Jak baza: po każdym zapisie wysyła sygnał do wszystkich podłączonych urządzeń rodziny. */
  private notify(row: Row) {
    for (const [ws, { ctx, topics }] of this.sockets) {
      if (this.offline.has(ctx)) continue;
      for (const [topic, ids] of topics) {
        this.liveSignals++;
        ws.send(JSON.stringify([null, null, topic, 'postgres_changes', { ids, data: { schema: 'public', table: 'ww_docs', commit_timestamp: row.server_updated_at, type: 'INSERT', columns: [], record: row, errors: null } }]));
      }
    }
  }

  rowsOf(kind: string) {
    return [...this.rows.values()].filter((r) => r.kind === kind);
  }
  doc(kind: string, pick: (d: Record<string, unknown>) => boolean) {
    return this.rowsOf(kind).find((r) => pick(r.data))?.data;
  }

  private async handle(ctx: BrowserContext, route: Route) {
    const req = route.request();
    if (this.offline.has(ctx)) return route.abort('internetdisconnected');
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    const url = new URL(req.url());
    const json = (status: number, body: unknown) => route.fulfill({ status, headers: { ...cors, 'content-type': 'application/json' }, body: JSON.stringify(body) });

    if (url.pathname === '/auth/v1/token') {
      if (url.searchParams.get('grant_type') === 'refresh_token') return json(200, this.session());
      const body = req.postDataJSON() as { email?: string; password?: string };
      if (body.email === EMAIL && body.password === PASSWORD) return json(200, this.session());
      return json(400, { code: 400, error_code: 'invalid_credentials', msg: 'Invalid login credentials' });
    }
    if (url.pathname === '/auth/v1/user') return json(200, this.session().user);
    if (url.pathname === '/auth/v1/logout') return route.fulfill({ status: 204, headers: cors });

    if (url.pathname === '/rest/v1/ww_docs') {
      if (req.method() === 'POST') {
        for (const r of req.postDataJSON() as Row[]) {
          // Jak w bazie: znacznik czasu nadaje serwer, każdy zapis dostaje późniejszy.
          this.clock += 1;
          const row = { ...r, server_updated_at: new Date(this.clock).toISOString() };
          this.rows.set(`${r.kind}:${r.id}`, row);
          this.notify(row);
        }
        return route.fulfill({ status: 201, headers: cors, body: '' });
      }
      let out = [...this.rows.values()];
      const since = url.searchParams.get('server_updated_at');
      if (since?.startsWith('gt.')) out = out.filter((r) => Date.parse(r.server_updated_at) > Date.parse(since.slice(3)));
      const kinds = url.searchParams.get('kind');
      if (kinds?.startsWith('in.(')) {
        const set = new Set(kinds.slice(4, -1).split(',').map((k) => k.replace(/"/g, '')));
        out = out.filter((r) => set.has(r.kind));
      }
      out.sort((a, b) => a.server_updated_at.localeCompare(b.server_updated_at));
      return json(200, out.slice(0, Number(url.searchParams.get('limit') ?? 1000)));
    }
    return json(404, { message: `atrapa nie zna ${url.pathname}` });
  }
}

async function device(browser: Browser): Promise<{ ctx: BrowserContext; page: Page }> {
  const ctx = await browser.newContext({ serviceWorkers: 'block' });
  // Na początku urządzenie działa lokalnie (bez chmury); `cloud.enable` podłącza je potem do atrapy.
  await useLocalConfig(ctx);
  return { ctx, page: await ctx.newPage() };
}

async function onboard(page: Page, name: string, grade: number) {
  await page.goto('/');
  await page.getByPlaceholder('Imię').fill(name);
  await page.getByRole('group', { name: 'Klasa' }).getByRole('button', { name: String(grade), exact: true }).click();
  await page.getByRole('button', { name: 'Zaczynamy!' }).click();
  await expect(page.getByText(`Cześć, ${name}!`)).toBeVisible();
}

/** Odpowiada na bieżące zadanie „jakkolwiek” — tu liczy się sam zapis odpowiedzi, nie jej poprawność. */
async function answerAny(page: Page) {
  if (await page.locator('.practice .opt').count()) {
    await page.locator('.practice .opt:not([disabled])').first().click();
  } else if (await page.locator('.word').count()) {
    await page.locator('.word').first().click();
  } else if (await page.locator('.token').count()) {
    while (await page.locator('.bank .token').count()) {
      await page.locator('.bank .token').first().click();
      await page.locator('.basket').first().click();
      await page.waitForTimeout(60);
    }
  } else if (await page.locator('.gap').count()) {
    const gaps = page.locator('.gap');
    for (let i = 0; i < (await gaps.count()); i++) await gaps.nth(i).fill('May');
  } else if (await page.locator('.match-item').count()) {
    const left = page.locator('.match-col').nth(0).locator('.match-item');
    const right = page.locator('.match-col').nth(1).locator('.match-item');
    for (let i = 0; i < (await left.count()); i++) {
      await left.nth(i).click();
      await right.nth(i).click();
    }
  }
}

async function typePin(page: Page, pin: string) {
  for (const d of pin) await page.getByRole('button', { name: d, exact: true }).click();
  await page.getByRole('button', { name: 'Zatwierdź' }).click();
}

async function login(page: Page, password = PASSWORD) {
  await expect(page.getByRole('heading', { name: 'Zaloguj konto rodziny' })).toBeVisible();
  await page.getByLabel('E-mail').fill(EMAIL);
  await page.getByLabel('Hasło').fill(password);
  await page.getByRole('button', { name: 'Zaloguj' }).click();
}

/** Aplikacja pobiera zmiany, gdy wraca na pierwszy plan — tak jak po odblokowaniu tabletu. */
const wake = (page: Page) => page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));

test('dwa urządzenia: postępy córki widać u rodzica, plan od rodzica trafia na tablet', async ({ browser }) => {
  const cloud = new FakeSupabase();
  const phone = await device(browser); // telefon rodzica
  const tablet = await device(browser); // tablet córki

  // ── Zanim włączono chmurę: każde urządzenie ma własne dane i własny PIN ──
  await onboard(tablet.page, 'Zosia', 5);
  await tablet.page.locator('.subject-big', { hasText: 'Angielski' }).click();
  await tablet.page.getByRole('button', { name: /Miesiące/ }).first().click();
  await tablet.page.getByRole('dialog').getByRole('button', { name: /Graj!/ }).click();
  for (let i = 0; i < 3; i++) {
    await expect(tablet.page.getByRole('button', { name: 'Sprawdź' })).toBeVisible();
    await answerAny(tablet.page);
    await tablet.page.getByRole('button', { name: 'Sprawdź' }).click();
    await tablet.page.waitForTimeout(750);
    await tablet.page.getByRole('button', { name: /^(Dalej|Zakończ)$/ }).click();
  }
  await tablet.page.getByRole('button', { name: 'Zakończ ćwiczenie' }).click();
  await tablet.page.getByRole('alertdialog').getByRole('button', { name: 'Skończ' }).click();
  await tablet.page.getByRole('button', { name: 'Wróć', exact: true }).click();
  await tablet.page.getByRole('button', { name: 'Panel rodzica' }).click();
  await typePin(tablet.page, '111111');
  await typePin(tablet.page, '111111');
  await expect(tablet.page.getByRole('heading', { name: 'Postępy' })).toBeVisible();
  await tablet.page.getByRole('button', { name: 'Wyjdź' }).click();

  await onboard(phone.page, 'Kuba', 3);
  await phone.page.getByRole('button', { name: 'Panel rodzica' }).click();
  await typePin(phone.page, '123456');
  await typePin(phone.page, '123456');
  await phone.page.getByRole('button', { name: 'Nagrody' }).click();
  await phone.page.locator('.idea', { hasText: 'Wybieram obiad na jutro' }).getByRole('button', { name: 'Dodaj' }).click();
  await expect(phone.page.locator('.idea', { hasText: 'Wybieram obiad na jutro' }).getByRole('button', { name: 'Dodano' })).toBeVisible();

  // ── Rodzic loguje konto rodziny najpierw u siebie: jego dane i ustawienia idą do chmury ──
  await cloud.enable(phone.ctx);
  await phone.page.reload();
  await login(phone.page, 'zle-haslo');
  await expect(phone.page.getByRole('alert')).toHaveText('Zły e-mail albo hasło.');
  await snap(phone.page, 's01-login');
  await login(phone.page);
  await expect(phone.page.getByText('Cześć, Kuba!')).toBeVisible();
  await expect.poll(() => cloud.rowsOf('profile').length).toBe(1);
  const familyRewards = () => ((cloud.doc('settings', () => true)?.rewards ?? []) as { title: string }[]).map((r) => r.title);
  await expect.poll(familyRewards).toContain('Wybieram obiad na jutro');
  const phonePin = cloud.doc('settings', () => true)?.parentPinHash;
  expect(phonePin).toBeTruthy();

  // ── Tablet dołącza: wysyła profil i odpowiedzi córki, a ustawienia rodziny (PIN, nagrody) bierze z chmury ──
  await cloud.enable(tablet.ctx);
  await tablet.page.reload();
  // Zanim rodzic zaloguje tablet, córka może uczyć się dalej lokalnie — nic nie idzie jeszcze do chmury.
  await tablet.page.getByRole('button', { name: 'Na razie bez logowania' }).click();
  await expect(tablet.page.getByText('Cześć, Zosia!')).toBeVisible();
  expect(cloud.rowsOf('attempt').length).toBe(0);
  await tablet.page.reload();
  await login(tablet.page);
  // Tablet zostaje przy profilu córki, choć z chmury doszedł drugi profil.
  await expect(tablet.page.getByText('Cześć, Zosia!')).toBeVisible();
  await expect.poll(() => cloud.rowsOf('profile').length).toBe(2);
  await expect.poll(() => cloud.rowsOf('attempt').length).toBe(3);
  expect(cloud.doc('settings', () => true)?.parentPinHash).toBe(phonePin);
  expect(familyRewards()).toContain('Wybieram obiad na jutro');

  // ── Rodzic na telefonie widzi córkę i jej odpowiedzi, przypina jej plan ──
  await phone.page.getByRole('button', { name: 'Panel rodzica' }).click();
  await typePin(phone.page, '123456');
  // Kanał „na żywo” działa: profil i odpowiedzi córki przyszły same, bez odświeżania.
  await expect(phone.page.locator('.sync-bar')).toContainText('na żywo');
  await snap(phone.page, 's02-parent-live');
  await expect(phone.page.getByLabel('Uczeń').locator('option', { hasText: 'Zosia' })).toHaveCount(1);
  await phone.page.getByLabel('Uczeń').selectOption({ label: (await phone.page.getByLabel('Uczeń').locator('option', { hasText: 'Zosia' }).innerText()).trim() });
  await expect(phone.page.locator('.parent-main')).toContainText('Miesiące');

  await phone.page.getByRole('button', { name: 'Plan i sprawdziany' }).click();
  await phone.page.getByLabel('Uczeń').selectOption({ label: (await phone.page.getByLabel('Uczeń').locator('option', { hasText: 'Zosia' }).innerText()).trim() });
  await phone.page.getByPlaceholder('np. Sprawdzian z ułamków').fill('Sprawdzian: Unit 0');
  await phone.page.getByRole('button', { name: 'Zaznacz wszystkie (9)' }).click();
  await phone.page.getByRole('button', { name: 'Zapisz plan (9)' }).click();
  await expect(phone.page.getByText('Zapisano plan: Zosia.')).toBeVisible();
  const zosia = () => cloud.doc('profile', (d) => d.name === 'Zosia') as { theme?: string; plan?: { title?: string } | null } | undefined;
  await expect.poll(() => zosia()?.plan?.title).toBe('Sprawdzian: Unit 0');

  // ── Plan pojawia się na tablecie córki sam, na żywo ──
  await expect(tablet.page.getByRole('heading', { name: 'Sprawdzian: Unit 0' })).toBeVisible();
  expect(cloud.liveSignals).toBeGreaterThan(0);

  // ── Córka odpowiada na pytanie, a rodzic widzi to u siebie bez odświeżania ──
  await phone.page.getByRole('button', { name: 'Postępy' }).click();
  const answersOnPhone = () => phone.page.evaluate(() => document.querySelector('.parent-main')?.textContent ?? '');
  const before = await answersOnPhone();
  await tablet.page.getByRole('button', { name: /Ćwicz: / }).click();
  await expect(tablet.page.getByRole('button', { name: 'Sprawdź' })).toBeVisible();
  await answerAny(tablet.page);
  await tablet.page.getByRole('button', { name: 'Sprawdź' }).click();
  await expect.poll(() => cloud.rowsOf('attempt').length).toBe(4);
  await expect.poll(answersOnPhone).not.toBe(before);
  await tablet.page.waitForTimeout(750);
  await tablet.page.getByRole('button', { name: /^(Dalej|Zakończ)$/ }).click();
  await tablet.page.getByRole('button', { name: 'Zakończ ćwiczenie' }).click();
  await tablet.page.getByRole('alertdialog').getByRole('button', { name: 'Skończ' }).click();
  await tablet.page.getByRole('button', { name: 'Wróć', exact: true }).click();
  await expect(tablet.page.getByText('Cześć, Zosia!')).toBeVisible();
  await phone.page.getByRole('button', { name: 'Plan i sprawdziany' }).click();
  await phone.page.getByLabel('Uczeń').selectOption({ label: (await phone.page.getByLabel('Uczeń').locator('option', { hasText: 'Zosia' }).innerText()).trim() });

  // ── Rodzic zadaje córce kartkówkę: pojawia się na jej tablecie na żywo ──
  await phone.page.getByRole('button', { name: 'Zadaj kartkówkę' }).click();
  await phone.page.locator('.quiz-form').getByPlaceholder('np. Have got i can').fill('Miesiące na jutro');
  await phone.page.locator('.quiz-form .check-row', { hasText: 'Miesiące' }).locator('input').check();
  await phone.page.locator('.quiz-form').getByRole('button', { name: /^Zadaj kartkówkę \(/ }).click();
  await expect(tablet.page.getByRole('region', { name: 'Kartkówki od rodzica' })).toContainText('Miesiące na jutro');

  // ── Tablet bez internetu: córka zmienia wygląd, a rodzic w tym czasie zmienia plan. Nic nie może zginąć. ──
  cloud.offline.add(tablet.ctx);
  await tablet.page.getByRole('button', { name: 'Wygląd' }).click();
  await tablet.page.getByRole('dialog').getByRole('button', { name: /Zeszyt/ }).click();
  if (await tablet.page.getByRole('dialog').count()) await tablet.page.keyboard.press('Escape');
  await phone.page.getByPlaceholder('np. Sprawdzian z ułamków').fill('Sprawdzian w piątek');
  await phone.page.getByRole('button', { name: 'Zapisz plan (9)' }).click();
  await expect.poll(() => zosia()?.plan?.title).toBe('Sprawdzian w piątek');
  await tablet.page.waitForTimeout(2500); // nieudana próba wysłania zmiany wyglądu
  cloud.offline.delete(tablet.ctx);
  await wake(tablet.page);
  await expect.poll(() => zosia()?.theme).toBe('zeszyt');
  expect(zosia()?.plan?.title).toBe('Sprawdzian w piątek');
  await expect(tablet.page.getByRole('heading', { name: 'Sprawdzian w piątek' })).toBeVisible();

  // ── Na tablecie działa już PIN rodziny (z telefonu), a zapomniany PIN ustawia się od nowa hasłem konta ──
  await tablet.page.getByRole('button', { name: 'Panel rodzica' }).click();
  await typePin(tablet.page, '111111');
  await expect(tablet.page.getByText('Zły PIN.')).toBeVisible();
  await snap(tablet.page, 's03-pin-forgot-link');
  await tablet.page.getByRole('button', { name: 'Nie pamiętam PIN-u' }).click();
  await tablet.page.getByLabel('Hasło konta rodziny').fill('nie-to');
  await tablet.page.getByRole('button', { name: 'Dalej' }).click();
  await expect(tablet.page.getByRole('alert')).toHaveText('Złe hasło.');
  await snap(tablet.page, 's04-pin-reset');
  await tablet.page.getByLabel('Hasło konta rodziny').fill(PASSWORD);
  await tablet.page.getByRole('button', { name: 'Dalej' }).click();
  await expect(tablet.page.getByRole('heading', { name: 'Ustaw PIN rodzica' })).toBeVisible();
  await typePin(tablet.page, '246810');
  await typePin(tablet.page, '246810');
  await expect(tablet.page.getByRole('heading', { name: 'Postępy' })).toBeVisible();
  await tablet.page.getByRole('button', { name: 'Ustawienia' }).click();
  await expect(tablet.page.getByLabel('Połącz z inną osobą: Zosia')).toBeVisible();
  await expect(tablet.page.getByText('Tryb na żywo:')).toContainText('działa');
  await snap(tablet.page, 's05-settings');
  await expect.poll(() => cloud.doc('settings', () => true)?.parentPinHash).not.toBe(phonePin);
  expect(familyRewards()).toContain('Wybieram obiad na jutro');

  // Nowy PIN obowiązuje też na telefonie rodzica.
  await phone.page.getByRole('button', { name: 'Wyjdź' }).click();
  await phone.page.waitForTimeout(1500);
  await phone.page.getByRole('button', { name: 'Panel rodzica' }).click();
  await typePin(phone.page, '246810');
  await expect(phone.page.getByRole('heading', { name: 'Postępy' })).toBeVisible();

  // Po ponownym uruchomieniu tablet jest nadal zalogowany i ma komplet danych.
  await tablet.page.reload();
  await expect(tablet.page.getByRole('heading', { name: 'Kto się dziś uczy?' })).toBeVisible();
  await expect(tablet.page.getByRole('button', { name: /Kuba/ })).toBeVisible();

  // Urządzenie raz podłączone do konta wymaga logowania (bez „Na razie bez logowania”).
  await phone.page.getByRole('button', { name: 'Ustawienia' }).click();
  await phone.page.getByRole('button', { name: 'Wyloguj urządzenie' }).click();
  await phone.page.getByRole('alertdialog').getByRole('button', { name: 'Wyloguj' }).click();
  await expect(phone.page.getByRole('heading', { name: 'Zaloguj konto rodziny' })).toBeVisible();
  await expect(phone.page.getByRole('button', { name: 'Na razie bez logowania' })).toHaveCount(0);

  await phone.ctx.close();
  await tablet.ctx.close();
});
