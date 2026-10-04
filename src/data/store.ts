import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { BUILTIN_TOPICS, SUBJECTS } from '../content/seed';
import { parseDsl } from '../dsl';
import type { DocKind, DocMap, ParsedTopic, Profile, Settings, Topic } from '../types';
import { openKV, type KV, type OutboxEntry, type StoredDoc } from './idb';
import { mergeDoc, MUTABLE_KINDS, sameJson } from './merge';

declare global {
  interface Window {
    WW_CONFIG?: { supabaseUrl?: string; supabaseAnonKey?: string };
  }
}

export type SyncStatus = 'local' | 'idle' | 'syncing' | 'offline' | 'error';

export interface AuthState {
  status: 'none' | 'checking' | 'signedOut' | 'signedIn';
  email?: string;
  userId?: string;
  error?: string;
}

export interface StoreState {
  ready: boolean;
  persistent: boolean;
  cloud: boolean;
  /** To urządzenie było już kiedyś zalogowane do konta rodziny. */
  joined: boolean;
  auth: AuthState;
  /** `live` — działa kanał „na żywo”: zmiany z innych urządzeń przychodzą od razu, a nie co minutę. */
  sync: { status: SyncStatus; lastSync: number | null; pending: number; error?: string; firstPullDone: boolean; live?: boolean };
  version: number;
}

export const DEFAULT_SETTINGS: Settings = {
  id: 'family',
  dailyGoalMinutes: 15,
  sessionLength: 10,
  autoRead: false,
  sounds: true,
  hiddenBuiltins: [],
  rewards: [
    { id: 'r-deser', title: 'Deser do wyboru', cost: 100 },
    { id: 'r-gra30', title: '30 minut gry', cost: 150 },
    { id: 'r-film', title: 'Wieczór filmowy — Ty wybierasz film', cost: 300 },
  ],
  updatedAt: '1970-01-01T00:00:00.000Z',
};

const KINDS: DocKind[] = ['profile', 'topic', 'attempt', 'session', 'redemption', 'settings'];
const SYNC_TABLE = 'ww_docs';

export function uid(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
}

export const nowIso = () => new Date().toISOString();

export function gradeOf(p: { grade?: number } | undefined): number {
  return p?.grade ?? 3;
}

type Docs = { [K in DocKind]: Map<string, DocMap[K]> };

export class Store {
  private kv!: KV;
  private docs: Docs = {
    profile: new Map(),
    topic: new Map(),
    attempt: new Map(),
    session: new Map(),
    redemption: new Map(),
    settings: new Map(),
  };
  private listeners = new Set<() => void>();
  private supa: SupabaseClient | null = null;
  private channel: RealtimeChannel | null = null;
  private syncTimer: ReturnType<typeof setTimeout> | null = null;
  private syncing = false;
  private syncAgain = false;
  /**
   * Dokumenty właśnie zapisywane na tym urządzeniu (klucz „rodzaj:id”): już zmienione w pamięci, ale wpis jeszcze
   * nie trafił do kolejki wysyłki. Pobranie z chmury, które akurat trwa (przy słabej sieci nawet kilka sekund,
   * bo zapytanie jest ponawiane), nie może nadpisać takiej świeżej zmiany.
   */
  private writing = new Map<string, number>();
  private markWriting(keys: string[], delta: 1 | -1) {
    for (const k of keys) {
      const n = (this.writing.get(k) ?? 0) + delta;
      if (n > 0) this.writing.set(k, n);
      else this.writing.delete(k);
    }
  }
  private parsedCache: { version: number; all: ParsedTopic[] } | null = null;

  state: StoreState = {
    ready: false,
    persistent: false,
    cloud: false,
    joined: false,
    auth: { status: 'none' },
    sync: { status: 'local', lastSync: null, pending: 0, firstPullDone: false },
    version: 0,
  };

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  getVersion = () => this.state.version;

  private emit() {
    this.state = { ...this.state, version: this.state.version + 1 };
    this.listeners.forEach((l) => l());
  }
  private patch(p: Partial<StoreState>) {
    this.state = { ...this.state, ...p };
    this.emit();
  }
  private patchSync(p: Partial<StoreState['sync']>) {
    this.patch({ sync: { ...this.state.sync, ...p } });
  }

  // ─── Start ────────────────────────────────────────────────────────────────

  async init() {
    this.kv = await openKV();
    const all = await this.kv.getAllDocs();
    for (const d of all) {
      const m = this.docs[d.kind as DocKind] as Map<string, unknown> | undefined;
      if (m) m.set(d.id, d.data);
    }
    const cfg = typeof window !== 'undefined' ? window.WW_CONFIG : undefined;
    const cloud = !!(cfg?.supabaseUrl && cfg?.supabaseAnonKey);
    this.state = {
      ...this.state,
      ready: true,
      persistent: this.kv.persistent,
      cloud,
      joined: !!(await this.kv.getMeta<string>('cloudUser')),
      auth: cloud ? { status: 'checking' } : { status: 'none' },
      sync: { ...this.state.sync, status: cloud ? 'idle' : 'local', firstPullDone: !cloud },
    };
    this.emit();
    if (cloud) await this.initCloud(cfg!.supabaseUrl!, cfg!.supabaseAnonKey!);
  }

  // ─── Odczyt ───────────────────────────────────────────────────────────────

  list<K extends DocKind>(kind: K): DocMap[K][] {
    return [...this.docs[kind].values()] as DocMap[K][];
  }
  get<K extends DocKind>(kind: K, id: string): DocMap[K] | undefined {
    return this.docs[kind].get(id) as DocMap[K] | undefined;
  }

  get settings(): Settings {
    const s = this.docs.settings.get('family');
    return s ? { ...DEFAULT_SETTINGS, ...s } : DEFAULT_SETTINGS;
  }

  /** Wszystkie tematy (wbudowane + rodzinne), również ukryte. */
  allTopics(): ParsedTopic[] {
    if (this.parsedCache && this.parsedCache.version === this.topicVersion) return this.parsedCache.all;
    const family = this.list('topic').filter((t) => !t.deleted);
    const topics: Topic[] = [...BUILTIN_TOPICS, ...family];
    const subjOrder = (id: string) => {
      const i = SUBJECTS.findIndex((s) => s.id === id);
      return i < 0 ? 99 : i;
    };
    const all = topics
      .map((t) => {
        const { exercises, errors } = parseDsl(t.dsl);
        return { ...t, exercises, errors, builtin: t.source === 'builtin' };
      })
      .sort((a, b) => subjOrder(a.subject) - subjOrder(b.subject) || a.order - b.order || a.title.localeCompare(b.title, 'pl'));
    this.parsedCache = { version: this.topicVersion, all };
    return all;
  }

  /** Tematy widoczne dla ucznia. */
  topics(): ParsedTopic[] {
    const hidden = new Set(this.settings.hiddenBuiltins);
    return this.allTopics().filter((t) => !(t.builtin && hidden.has(t.id)) && t.exercises.length > 0);
  }

  /** Osoby (bez usuniętych), w kolejności dodania. */
  profiles(): Profile[] {
    return this.list('profile')
      .filter((p) => !p.deleted)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  /** Tematy dla konkretnej osoby — tylko z jej klasy (tematy bez klasy są dla wszystkich). */
  topicsFor(profileId: string | null | undefined): ParsedTopic[] {
    const grade = gradeOf(profileId ? this.get('profile', profileId) : undefined);
    return this.topics().filter((t) => !t.grades?.length || t.grades.includes(grade));
  }

  /** Ustawienia z uwzględnieniem celu dziennego konkretnej osoby. */
  settingsFor(profileId: string | null | undefined): Settings {
    const p = profileId ? this.get('profile', profileId) : undefined;
    const s = this.settings;
    return p?.dailyGoalMinutes ? { ...s, dailyGoalMinutes: p.dailyGoalMinutes } : s;
  }

  private topicVersion = 0;

  // ─── Zapis ────────────────────────────────────────────────────────────────

  async put<K extends DocKind>(kind: K, doc: DocMap[K]) {
    const id = (doc as { id: string }).id;
    const before = this.docs[kind].get(id);
    (this.docs[kind] as Map<string, DocMap[K]>).set(id, doc);
    if (kind === 'topic' || kind === 'settings') this.topicVersion++;
    this.emit();
    const keys = [`${kind}:${id}`];
    this.markWriting(keys, 1);
    try {
      await this.kv.putDocs([{ k: keys[0], kind, id, data: doc }]);
      if (this.state.cloud && this.state.auth.status === 'signedIn') {
        // Przy osobach, tematach i ustawieniach zapamiętujemy wersję sprzed zmiany — przyda się do scalania.
        await this.kv.addOutbox({ kind, id, data: doc, base: MUTABLE_KINDS.includes(kind) ? before : undefined });
        this.patchSync({ pending: this.state.sync.pending + 1 });
        this.scheduleSync(1500);
      }
    } finally {
      this.markWriting(keys, -1);
    }
  }

  /** Zapis wielu dokumentów naraz (jedna transakcja, jedno odświeżenie ekranu). */
  async putMany<K extends DocKind>(kind: K, docs: DocMap[K][]) {
    if (!docs.length) return;
    const m = this.docs[kind] as Map<string, DocMap[K]>;
    const before = new Map(docs.map((doc) => [(doc as { id: string }).id, m.get((doc as { id: string }).id)]));
    for (const doc of docs) m.set((doc as { id: string }).id, doc);
    if (kind === 'topic' || kind === 'settings') this.topicVersion++;
    const keys = docs.map((doc) => `${kind}:${(doc as { id: string }).id}`);
    this.markWriting(keys, 1);
    try {
      await this.kv.putDocs(docs.map((doc) => ({ k: `${kind}:${(doc as { id: string }).id}`, kind, id: (doc as { id: string }).id, data: doc })));
      if (this.state.cloud && this.state.auth.status === 'signedIn') {
        const mutable = MUTABLE_KINDS.includes(kind);
        await this.kv.addOutboxMany(docs.map((doc) => ({ kind, id: (doc as { id: string }).id, data: doc, base: mutable ? before.get((doc as { id: string }).id) : undefined })));
        this.patchSync({ pending: this.state.sync.pending + docs.length });
        this.scheduleSync(1500);
      } else {
        this.emit();
      }
    } finally {
      this.markWriting(keys, -1);
    }
  }

  /**
   * Łączy dwie osoby w jedną (np. to samo dziecko założone osobno na dwóch urządzeniach):
   * odpowiedzi, sesje i wymiany nagród osoby `fromId` przechodzą do `toId`, a `fromId` znika z listy.
   * Postęp i tak liczymy z dziennika, więc po połączeniu po prostu się sumuje.
   */
  async mergeProfiles(fromId: string, toId: string): Promise<number> {
    if (fromId === toId || !this.get('profile', toId)) return 0;
    let n = 0;
    for (const kind of ['attempt', 'session', 'redemption'] as const) {
      const moved = this.list(kind)
        .filter((d) => d.profileId === fromId)
        .map((d) => ({ ...d, profileId: toId }));
      n += moved.length;
      await this.putMany(kind, moved as never[]);
    }
    const from = this.get('profile', fromId);
    if (from) await this.put('profile', { ...from, deleted: true, updatedAt: nowIso() });
    return n;
  }

  async saveSettings(p: Partial<Settings>) {
    await this.put('settings', { ...this.settings, ...p, id: 'family', updatedAt: nowIso() });
  }

  /** Pełna kopia zapasowa (JSON). */
  exportAll() {
    const out: Record<string, unknown[]> = {};
    for (const k of KINDS) out[k] = this.list(k);
    return { app: 'wyspy-wiedzy', version: 1, exportedAt: nowIso(), docs: out };
  }

  async importAll(data: unknown): Promise<number> {
    const d = data as { app?: string; docs?: Record<string, unknown[]> };
    if (d?.app !== 'wyspy-wiedzy' || !d.docs) throw new Error('To nie jest kopia zapasowa tej aplikacji.');
    let n = 0;
    for (const k of KINDS) {
      const docs = (d.docs[k] ?? []).filter((doc) => doc && typeof doc === 'object' && typeof (doc as { id?: unknown }).id === 'string');
      await this.putMany(k, docs as never[]);
      n += docs.length;
    }
    return n;
  }

  async resetLocal() {
    await this.kv.clearDocs();
    await this.kv.clearOutbox();
    await this.kv.setMeta('cursor', null);
    for (const k of KINDS) this.docs[k].clear();
    this.topicVersion++;
    this.emit();
  }

  // ─── Chmura (Supabase) ────────────────────────────────────────────────────

  private async initCloud(url: string, key: string) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      this.supa = createClient(url, key, {
        auth: { persistSession: true, autoRefreshToken: true, storageKey: 'ww-auth' },
      });
      const { data } = await this.supa.auth.getSession();
      if (data.session) await this.onSignedIn(data.session.user.id, data.session.user.email ?? '');
      else this.patch({ auth: { status: 'signedOut' } });
      this.supa.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          this.stopLive();
          this.patch({ auth: { status: 'signedOut' } });
        }
        else if (session && this.state.auth.userId !== session.user.id) void this.onSignedIn(session.user.id, session.user.email ?? '');
      });
      window.addEventListener('online', () => this.scheduleSync(300));
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') this.scheduleSync(300);
      });
      setInterval(() => {
        if (document.visibilityState === 'visible') this.scheduleSync(0);
      }, 60_000);
    } catch (e) {
      this.patch({ auth: { status: 'signedOut', error: 'Nie udało się połączyć z chmurą: ' + String(e) } });
    }
  }

  async signIn(email: string, password: string) {
    if (!this.supa) throw new Error('Chmura nie jest skonfigurowana.');
    const { data, error } = await this.supa.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Zły e-mail albo hasło.' : error.message);
    await this.onSignedIn(data.user.id, data.user.email ?? email);
  }

  async signOut() {
    this.stopLive();
    await this.supa?.auth.signOut();
    this.patch({ auth: { status: 'signedOut' } });
  }

  /**
   * Kanał „na żywo” (Supabase Realtime): baza zgłasza każdą zmianę w danych rodziny, a aplikacja od razu
   * pobiera nowości. Sam sygnał nie niesie danych — zawsze robimy zwykłe pobranie, więc zgubiony sygnał
   * niczego nie psuje (zostaje pobieranie przy otwarciu aplikacji i co minutę).
   */
  private startLive(userId: string) {
    if (!this.supa || this.channel) return;
    this.channel = this.supa
      .channel('ww-docs')
      .on('postgres_changes', { event: '*', schema: 'public', table: SYNC_TABLE, filter: `family_id=eq.${userId}` }, (change) => {
        // Sygnał o własnym zapisie (to samo już mamy) pomijamy — pobieramy tylko po zmianach z innych urządzeń.
        const row = change.new as { kind?: string; id?: string; data?: unknown } | undefined;
        const mine = row?.kind && row.id && KINDS.includes(row.kind as DocKind) ? this.docs[row.kind as DocKind].get(row.id) : undefined;
        if (mine && row?.data && sameJson(mine, row.data)) return;
        this.scheduleSync(250);
      })
      .subscribe((status) => {
        const live = status === 'SUBSCRIBED';
        if (live !== !!this.state.sync.live) this.patchSync({ live });
        // Po przerwie w połączeniu mogły nas ominąć sygnały — nadrabiamy jednym pobraniem.
        if (live) this.scheduleSync(250);
      });
  }

  private stopLive() {
    if (this.channel) void this.supa?.removeChannel(this.channel);
    this.channel = null;
    if (this.state.sync.live) this.patchSync({ live: false });
  }

  private signInTask: Promise<void> | null = null;

  /** Logowanie zgłasza się dwa razy (wynik `signIn` i zdarzenie z biblioteki) — obsługujemy je raz. */
  private onSignedIn(userId: string, email: string): Promise<void> {
    if (this.state.auth.status === 'signedIn' && this.state.auth.userId === userId) return Promise.resolve();
    this.signInTask ??= this.handleSignedIn(userId, email).finally(() => (this.signInTask = null));
    return this.signInTask;
  }

  private async handleSignedIn(userId: string, email: string) {
    const prev = await this.kv.getMeta<string>('cloudUser');
    if (prev && prev !== userId) {
      await this.resetLocal();
    } else if (!prev) {
      // Pierwsze połączenie tego urządzenia: wyślij dane zebrane lokalnie. Do końca pierwszej synchronizacji
      // urządzenie „dołącza” — ustawienia rodziny (PIN, nagrody) przyjmuje z chmury, jeśli już tam są.
      await this.kv.setMeta('joining', true);
      for (const k of KINDS) {
        await this.kv.addOutboxMany(this.list(k).map((doc) => ({ kind: k, id: (doc as { id: string }).id, data: doc })));
      }
    }
    await this.kv.setMeta('cloudUser', userId);
    const pending = (await this.kv.getOutbox()).length;
    this.patch({ auth: { status: 'signedIn', userId, email }, joined: true });
    this.patchSync({ pending });
    await this.sync();
    this.startLive(userId);
  }

  scheduleSync(ms: number) {
    if (!this.supa || this.state.auth.status !== 'signedIn') return;
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => void this.sync(), ms);
  }

  async sync() {
    if (!this.supa || this.state.auth.status !== 'signedIn') return;
    if (this.syncing) {
      this.syncAgain = true;
      return;
    }
    this.syncing = true;
    this.patchSync({ status: 'syncing', error: undefined });
    try {
      const joining = !!(await this.kv.getMeta<boolean>('joining'));
      await this.reconcile(joining);
      await this.flush();
      await this.pull();
      if (joining) await this.kv.setMeta('joining', false);
      const pending = (await this.kv.getOutbox()).length;
      this.patchSync({ status: 'idle', lastSync: Date.now(), pending, firstPullDone: true });
    } catch (e) {
      const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
      this.patchSync({ status: offline ? 'offline' : 'error', error: e instanceof Error ? e.message : String(e), firstPullDone: true });
    } finally {
      this.syncing = false;
      if (this.syncAgain) {
        this.syncAgain = false;
        this.scheduleSync(500);
      }
    }
  }

  /**
   * Zanim wyślemy zmienione osoby, tematy i ustawienia, porównujemy je z wersją w chmurze i scalamy
   * (patrz `mergeDoc`). Bez tego urządzenie, które było offline, nadpisałoby np. plan ustawiony przez rodzica.
   */
  private async reconcile(joining: boolean) {
    const entries = await this.kv.getOutbox();
    const pending = new Map<string, OutboxEntry>();
    for (const e of entries) if (MUTABLE_KINDS.includes(e.kind as DocKind)) pending.set(`${e.kind}:${e.id}`, e);
    if (!pending.size) return;
    const { data, error } = await this.supa!.from(SYNC_TABLE).select('kind,id,data').in('kind', MUTABLE_KINDS).limit(1000);
    if (error) throw new Error(error.message);
    const drop: number[] = [];
    const toStore: StoredDoc[] = [];
    const toSend: OutboxEntry[] = [];
    for (const row of (data ?? []) as { kind: string; id: string; data: unknown }[]) {
      const key = `${row.kind}:${row.id}`;
      const mine = pending.get(key);
      if (!mine || !row.data || typeof row.data !== 'object') continue;
      const kind = row.kind as DocKind;
      const map = this.docs[kind] as Map<string, unknown>;
      const mineAll = entries.filter((e) => `${e.kind}:${e.id}` === key);
      // Wersja wspólna = stan sprzed pierwszej z czekających zmian tego dokumentu.
      const merged = mergeDoc(kind, mine.data, row.data, { joining, base: mineAll[0]?.base });
      drop.push(...mineAll.map((e) => e.seq!));
      // Do chmury idzie zawsze wersja scalona — nigdy surowy wpis z kolejki, który nadpisałby cudzą zmianę.
      // Zapamiętujemy przy niej wersję z chmury: gdyby wysyłka się nie udała, następne scalanie ma poprawną wersję wspólną.
      if (!sameJson(merged, row.data)) toSend.push({ kind, id: row.id, data: merged, base: row.data });
      // Lokalną kopię podmieniamy tylko wtedy, gdy nie zmieniła się od tego zapisu. Świeższa zmiana (zrobiona w trakcie
      // synchronizacji) ma własny wpis w kolejce i scali się w następnej rundzie.
      if (sameJson(map.get(row.id), mine.data) && !sameJson(merged, mine.data)) {
        map.set(row.id, merged);
        toStore.push({ k: key, kind, id: row.id, data: merged });
      }
    }
    await this.kv.putDocs(toStore);
    await this.kv.deleteOutbox(drop);
    await this.kv.addOutboxMany(toSend);
    if (toStore.length) {
      this.topicVersion++;
      this.emit();
    }
  }

  /** Sprawdza hasło konta rodziny (np. przed ustawieniem nowego PIN-u, gdy rodzic zapomniał starego). */
  async verifyPassword(password: string): Promise<boolean> {
    const email = this.state.auth.email;
    if (!this.supa || this.state.auth.status !== 'signedIn' || !email) throw new Error('To urządzenie nie jest zalogowane do konta rodziny.');
    const { error } = await this.supa.auth.signInWithPassword({ email, password });
    if (!error) return true;
    if (error.message === 'Invalid login credentials') return false;
    throw new Error(error.message);
  }

  private async flush() {
    const entries = await this.kv.getOutbox();
    if (!entries.length) return;
    const familyId = this.state.auth.userId!;
    const latest = new Map<string, (typeof entries)[number]>();
    for (const e of entries) latest.set(`${e.kind}:${e.id}`, e);
    const rows = [...latest.values()].map((e) => ({ family_id: familyId, kind: e.kind, id: e.id, data: e.data, deleted: false }));
    for (let i = 0; i < rows.length; i += 200) {
      const { error } = await this.supa!.from(SYNC_TABLE).upsert(rows.slice(i, i + 200), { onConflict: 'family_id,kind,id' });
      if (error) throw new Error(error.message);
    }
    await this.kv.deleteOutbox(entries.map((e) => e.seq!));
  }

  private async pull() {
    const cursor = (await this.kv.getMeta<string>('cursor')) ?? null;
    let since = cursor ? new Date(Date.parse(cursor) - 5000).toISOString() : '1970-01-01T00:00:00Z';
    let maxSeen = cursor;
    let changed = false;
    for (let page = 0; page < 200; page++) {
      const { data, error } = await this.supa!
        .from(SYNC_TABLE)
        .select('kind,id,data,deleted,server_updated_at')
        .gt('server_updated_at', since)
        .order('server_updated_at', { ascending: true })
        .limit(1000);
      if (error) throw new Error(error.message);
      if (!data || data.length === 0) break;
      // Kolejkę sprawdzamy dopiero po odpowiedzi z chmury: zapytanie mogło trwać długo, a dziecko w tym czasie
      // mogło coś zmienić. Dokumentu z niewysłaną zmianą nie nadpisujemy — scali go `reconcile` w następnej rundzie.
      const pendingKeys = new Set((await this.kv.getOutbox()).map((e) => `${e.kind}:${e.id}`));
      const toStore: StoredDoc[] = [];
      for (const row of data as { kind: string; id: string; data: unknown; deleted: boolean; server_updated_at: string }[]) {
        if (!KINDS.includes(row.kind as DocKind) || !row.data || typeof row.data !== 'object') continue;
        const key = `${row.kind}:${row.id}`;
        if (!maxSeen || row.server_updated_at > maxSeen) maxSeen = row.server_updated_at;
        if (pendingKeys.has(key) || this.writing.has(key)) continue;
        const map = this.docs[row.kind as DocKind] as Map<string, unknown>;
        // Własny zapis wraca z chmury w tej samej postaci — nie ma czego zapisywać ani odświeżać.
        if (sameJson(map.get(row.id), row.data)) continue;
        map.set(row.id, row.data);
        toStore.push({ k: key, kind: row.kind, id: row.id, data: row.data });
      }
      await this.kv.putDocs(toStore);
      if (toStore.length) changed = true;
      if (toStore.some((d) => d.kind === 'topic' || d.kind === 'settings')) this.topicVersion++;
      const last = (data[data.length - 1] as { server_updated_at: string }).server_updated_at;
      if (data.length < 1000 || last === since) break;
      since = last;
    }
    if (maxSeen && maxSeen !== cursor) await this.kv.setMeta('cursor', maxSeen);
    if (changed) this.emit();
  }

  // ─── AI ─────────────────────────────────────────────────────────────────

  get aiViaCloud() {
    return !!this.supa && this.state.auth.status === 'signedIn';
  }

  async invokeAiFunction(body: object, pin: string): Promise<unknown> {
    if (!this.supa) throw new Error('Chmura nie jest skonfigurowana.');
    const { data, error } = await this.supa.functions.invoke('ai', { body: body as Record<string, unknown>, headers: { 'x-parent-pin': pin } });
    if (error) {
      let msg = error.message;
      try {
        const ctx = (error as { context?: Response }).context;
        if (ctx) {
          const j = await ctx.json();
          if (j?.error) msg = j.error;
        }
      } catch {
        /* ignore */
      }
      throw new Error(msg);
    }
    return data;
  }
}

export const store = new Store();
