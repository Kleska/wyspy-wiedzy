/*
 * Minimalna warstwa trwałego zapisu na urządzeniu (IndexedDB).
 * Gdy IndexedDB jest niedostępne (tryb prywatny, podgląd), działa w pamięci.
 */

export interface StoredDoc {
  k: string;
  kind: string;
  id: string;
  data: unknown;
}

export interface OutboxEntry {
  seq?: number;
  kind: string;
  id: string;
  data: unknown;
  /** Wersja dokumentu sprzed tej zmiany (osoby, tematy, ustawienia) — do scalania zmian z dwóch urządzeń. */
  base?: unknown;
}

const DB_NAME = 'wyspy-wiedzy';
const VERSION = 1;

export interface KV {
  getAllDocs(): Promise<StoredDoc[]>;
  putDocs(docs: StoredDoc[]): Promise<void>;
  deleteDocs(keys: string[]): Promise<void>;
  clearDocs(): Promise<void>;
  addOutbox(e: OutboxEntry): Promise<void>;
  addOutboxMany(entries: OutboxEntry[]): Promise<void>;
  getOutbox(): Promise<OutboxEntry[]>;
  deleteOutbox(seqs: number[]): Promise<void>;
  clearOutbox(): Promise<void>;
  getMeta<T>(key: string): Promise<T | undefined>;
  setMeta(key: string, value: unknown): Promise<void>;
  readonly persistent: boolean;
}

function req<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

class IdbKV implements KV {
  readonly persistent = true;
  constructor(private db: IDBDatabase) {}

  private store(name: string, mode: IDBTransactionMode) {
    const tx = this.db.transaction(name, mode);
    return { tx, os: tx.objectStore(name) };
  }
  async getAllDocs() {
    return req(this.store('docs', 'readonly').os.getAll()) as Promise<StoredDoc[]>;
  }
  async putDocs(docs: StoredDoc[]) {
    if (!docs.length) return;
    const { tx, os } = this.store('docs', 'readwrite');
    docs.forEach((d) => os.put(d));
    await txDone(tx);
  }
  async deleteDocs(keys: string[]) {
    const { tx, os } = this.store('docs', 'readwrite');
    keys.forEach((k) => os.delete(k));
    await txDone(tx);
  }
  async clearDocs() {
    const { tx, os } = this.store('docs', 'readwrite');
    os.clear();
    await txDone(tx);
  }
  async addOutbox(e: OutboxEntry) {
    const { tx, os } = this.store('outbox', 'readwrite');
    os.add(e.base === undefined ? { kind: e.kind, id: e.id, data: e.data } : { kind: e.kind, id: e.id, data: e.data, base: e.base });
    await txDone(tx);
  }
  async addOutboxMany(entries: OutboxEntry[]) {
    if (!entries.length) return;
    const { tx, os } = this.store('outbox', 'readwrite');
    entries.forEach((e) => os.add(e.base === undefined ? { kind: e.kind, id: e.id, data: e.data } : { kind: e.kind, id: e.id, data: e.data, base: e.base }));
    await txDone(tx);
  }
  async getOutbox() {
    return req(this.store('outbox', 'readonly').os.getAll()) as Promise<OutboxEntry[]>;
  }
  async deleteOutbox(seqs: number[]) {
    const { tx, os } = this.store('outbox', 'readwrite');
    seqs.forEach((s) => os.delete(s));
    await txDone(tx);
  }
  async clearOutbox() {
    const { tx, os } = this.store('outbox', 'readwrite');
    os.clear();
    await txDone(tx);
  }
  async getMeta<T>(key: string) {
    const row = (await req(this.store('meta', 'readonly').os.get(key))) as { key: string; value: T } | undefined;
    return row?.value;
  }
  async setMeta(key: string, value: unknown) {
    const { tx, os } = this.store('meta', 'readwrite');
    os.put({ key, value });
    await txDone(tx);
  }
}

class MemoryKV implements KV {
  readonly persistent = false;
  private docs = new Map<string, StoredDoc>();
  private outbox: OutboxEntry[] = [];
  private seq = 1;
  private meta = new Map<string, unknown>();
  async getAllDocs() {
    return [...this.docs.values()];
  }
  async putDocs(docs: StoredDoc[]) {
    docs.forEach((d) => this.docs.set(d.k, d));
  }
  async deleteDocs(keys: string[]) {
    keys.forEach((k) => this.docs.delete(k));
  }
  async clearDocs() {
    this.docs.clear();
  }
  async addOutbox(e: OutboxEntry) {
    this.outbox.push({ ...e, seq: this.seq++ });
  }
  async addOutboxMany(entries: OutboxEntry[]) {
    for (const e of entries) await this.addOutbox(e);
  }
  async getOutbox() {
    return this.outbox.slice();
  }
  async deleteOutbox(seqs: number[]) {
    const s = new Set(seqs);
    this.outbox = this.outbox.filter((e) => !s.has(e.seq!));
  }
  async clearOutbox() {
    this.outbox = [];
  }
  async getMeta<T>(key: string) {
    return this.meta.get(key) as T | undefined;
  }
  async setMeta(key: string, value: unknown) {
    this.meta.set(key, value);
  }
}

export async function openKV(): Promise<KV> {
  try {
    if (typeof indexedDB === 'undefined') throw new Error('no idb');
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open(DB_NAME, VERSION);
      r.onupgradeneeded = () => {
        const d = r.result;
        if (!d.objectStoreNames.contains('docs')) d.createObjectStore('docs', { keyPath: 'k' });
        if (!d.objectStoreNames.contains('outbox')) d.createObjectStore('outbox', { keyPath: 'seq', autoIncrement: true });
        if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta', { keyPath: 'key' });
      };
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
      r.onblocked = () => reject(new Error('blocked'));
      setTimeout(() => reject(new Error('timeout')), 4000);
    });
    // Poproś przeglądarkę, żeby nie czyściła danych (Safari/Chrome).
    try {
      await navigator.storage?.persist?.();
    } catch {
      /* ignore */
    }
    return new IdbKV(db);
  } catch {
    return new MemoryKV();
  }
}
