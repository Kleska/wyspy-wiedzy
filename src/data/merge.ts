import type { DocKind } from '../types';

/*
 * Scalanie dokumentów, które mogą się zmieniać na kilku urządzeniach naraz (osoby, tematy, ustawienia).
 * Odpowiedzi, sesje i wymiany nagród są tylko dopisywane, więc ich nie trzeba scalać.
 */

export const MUTABLE_KINDS: DocKind[] = ['profile', 'topic', 'settings'];

type AnyDoc = Record<string, unknown> & { updatedAt?: string };

const stamp = (d: AnyDoc | undefined) => (typeof d?.updatedAt === 'string' ? d.updatedAt : '');

/** Kiedy rodzic ostatnio ustawił albo usunął plan (starsze profile mają tylko `plan.setAt`). */
function planStamp(d: AnyDoc): string {
  if (typeof d.planAt === 'string') return d.planAt;
  const plan = d.plan as { setAt?: string } | null | undefined;
  return typeof plan?.setAt === 'string' ? plan.setAt : '';
}

/** Porównanie treści JSON bez względu na kolejność kluczy (baza zwraca klucze w innej kolejności). */
export function sameJson(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return (a ?? null) === (b ?? null);
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    const bb = b as unknown[];
    return a.length === bb.length && a.every((v, i) => sameJson(v, bb[i]));
  }
  const ao = a as Record<string, unknown>;
  const bo = b as Record<string, unknown>;
  // Klucz z wartością undefined znika w JSON-ie, więc traktujemy go jak brak klucza.
  const keys = new Set([...Object.keys(ao), ...Object.keys(bo)]);
  for (const k of keys) if (!sameJson(ao[k], bo[k])) return false;
  return true;
}

/**
 * Zwraca dokument, który powinien zostać po obu stronach.
 *
 * Gdy znamy wersję wspólną (`base` — dokument sprzed zmian zrobionych na tym urządzeniu), scalamy pole po polu:
 * każda strona zachowuje to, co sama zmieniła, a gdy obie zmieniły to samo pole, wygrywa nowsza wersja dokumentu.
 * Dzięki temu zmiana wyglądu na tablecie dziecka i plan ustawiony w tym samym czasie przez rodzica zostają oba.
 *
 * Bez wersji wspólnej (urządzenie pierwszy raz łączy się z kontem albo dokument powstał osobno po obu stronach):
 * - temat: wygrywa nowsza wersja (`updatedAt`);
 * - ustawienia: jak wyżej, ale urządzenie, które dopiero dołącza do konta (`joining`), przyjmuje ustawienia
 *   rodziny z chmury — PIN, nagrody i wspólny cel ustawione przez rodzica nie znikają;
 * - osoba: wygrywa nowsza wersja, ale plan od rodzica bierzemy z tej strony, gdzie zmieniono go później.
 *
 * Zawsze: usunięcie osoby i „Zacznij od nowa” nie cofają się.
 */
export function mergeDoc(kind: DocKind, local: unknown, remote: unknown, opts: { joining?: boolean; base?: unknown } = {}): unknown {
  const l = local as AnyDoc;
  const r = remote as AnyDoc;
  if (!r || typeof r !== 'object') return local;
  if (!l || typeof l !== 'object') return remote;
  const localNewer = stamp(l) > stamp(r);
  const b = opts.base as AnyDoc | undefined;

  let out: AnyDoc;
  if (b && typeof b === 'object') {
    out = {};
    for (const k of new Set([...Object.keys(l), ...Object.keys(r), ...Object.keys(b)])) {
      const mine = !sameJson(l[k], b[k]);
      const theirs = !sameJson(r[k], b[k]);
      const v = mine && theirs ? (localNewer ? l[k] : r[k]) : mine ? l[k] : r[k];
      if (v !== undefined) out[k] = v;
    }
    out.updatedAt = localNewer ? l.updatedAt : r.updatedAt;
  } else if (kind === 'settings' && opts.joining) {
    return remote;
  } else {
    out = localNewer ? l : r;
    const other = localNewer ? r : l;
    if (kind === 'profile' && planStamp(other) > planStamp(out)) out = { ...out, plan: other.plan ?? null, planAt: other.planAt };
  }

  if (kind === 'profile') {
    const resetAt = [l.resetAt, r.resetAt].filter((x): x is string => typeof x === 'string').sort().pop();
    if (resetAt && resetAt !== out.resetAt) out = { ...out, resetAt };
    if ((l.deleted || r.deleted) && !out.deleted) out = { ...out, deleted: true };
  }
  return out;
}
