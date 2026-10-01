import type { SupabaseClient } from '@supabase/supabase-js';
import { BUILTIN_TOPICS, SUBJECTS } from '../content/seed';
import { parseDsl } from '../dsl';
import type { DocKind, DocMap, ParsedTopic, Profile, Settings, Topic } from '../types';
import { openKV, type KV, type StoredDoc } from './idb';

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
  auth: AuthState;
  sync: { status: SyncStatus; lastSync: number | null; pending: number; error?: string; firstPullDone: boolean };
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
  private syncTimer: ReturnType<typeof setTimeout> | null = null;
  private syncing = false;
  private syncAgain = false;
  private parsedCache: { version: number; all: ParsedTopic[] } | null = null;

  state: StoreState = {
    ready: false,
    persistent: false,
    cloud: false,
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
    (this.docs[kind] as Map<string, DocMap[K]>).set(id, doc);
    if (kind === 'topic' || kind === 'settings') this.topicVersion++;
    this.emit();
    await this.kv.putDocs([{ k: `${kind}:${id}`, kind, id, data: doc }]);
    if (this.state.cloud && this.state.auth.status === 'signedIn') {
      await this.kv.addOutbox({ kind, id, data: doc });
      this.patchSync({ pending: this.state.sync.pending + 1 });
      this.scheduleSync(1500);
    }
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
      for (const doc of d.docs[k] ?? []) {
        if (doc && typeof doc === 'object' && typeof (doc as { id?: unknown }).id === 'string') {
          await this.put(k, doc as never);
          n++;
        }
      }
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
        if (event === 'SIGNED_OUT') this.patch({ auth: { status: 'signedOut' } });
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
    await this.supa?.auth.signOut();
    this.patch({ auth: { status: 'signedOut' } });
  }

  private async onSignedIn(userId: string, email: string) {
    const prev = await this.kv.getMeta<string>('cloudUser');
    if (prev && prev !== userId) {
      await this.resetLocal();
    } else if (!prev) {
      // Pierwsze połączenie tego urządzenia: wyślij dane zebrane lokalnie.
      for (const k of KINDS) {
        for (const doc of this.list(k)) await this.kv.addOutbox({ kind: k, id: (doc as { id: string }).id, data: doc });
      }
    }
    await this.kv.setMeta('cloudUser', userId);
    const pending = (await this.kv.getOutbox()).length;
    this.patch({ auth: { status: 'signedIn', userId, email } });
    this.patchSync({ pending });
    await this.sync();
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
      await this.flush();
      await this.pull();
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
    const pendingKeys = new Set((await this.kv.getOutbox()).map((e) => `${e.kind}:${e.id}`));
    for (let page = 0; page < 200; page++) {
      const { data, error } = await this.supa!
        .from(SYNC_TABLE)
        .select('kind,id,data,deleted,server_updated_at')
        .gt('server_updated_at', since)
        .order('server_updated_at', { ascending: true })
        .limit(1000);
      if (error) throw new Error(error.message);
      if (!data || data.length === 0) break;
      const toStore: StoredDoc[] = [];
      for (const row of data as { kind: string; id: string; data: unknown; deleted: boolean; server_updated_at: string }[]) {
        if (!KINDS.includes(row.kind as DocKind) || !row.data || typeof row.data !== 'object') continue;
        const key = `${row.kind}:${row.id}`;
        if (pendingKeys.has(key)) continue;
        (this.docs[row.kind as DocKind] as Map<string, unknown>).set(row.id, row.data);
        toStore.push({ k: key, kind: row.kind, id: row.id, data: row.data });
        if (!maxSeen || row.server_updated_at > maxSeen) maxSeen = row.server_updated_at;
      }
      await this.kv.putDocs(toStore);
      if (toStore.some((d) => d.kind === 'topic' || d.kind === 'settings')) this.topicVersion++;
      const last = (data[data.length - 1] as { server_updated_at: string }).server_updated_at;
      if (data.length < 1000 || last === since) break;
      since = last;
    }
    if (maxSeen) await this.kv.setMeta('cursor', maxSeen);
    this.emit();
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
