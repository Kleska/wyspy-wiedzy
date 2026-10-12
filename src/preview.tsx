import { BUILTIN_TOPICS } from './content/seed';
import { store, nowIso } from './data/store';
import { parseDsl } from './dsl';
import { hashPin } from './ui/parent/ParentGate';

/** Dane demonstracyjne trafiają wyłącznie do osobnej bazy kompilacji staging. */
export async function seedPreview() {
  if (store.profiles().length) return;
  const at = nowIso();
  const until = new Date(Date.now() + 7 * 86400000).toLocaleDateString('sv-SE');
  const lesson = BUILTIN_TOPICS.find((t) => t.subject === 'ang' && t.grades?.includes(3) && t.lesson);
  const next = BUILTIN_TOPICS.find((t) => t.subject === 'mat' && t.grades?.includes(3));
  const ids = [lesson?.id, next?.id].filter((id): id is string => !!id);
  await store.put('profile', {
    id: 'demo-odkrywca',
    name: 'Odkrywca',
    avatar: '🦊',
    grade: 3,
    theme: 'wyspy',
    createdAt: at,
    updatedAt: at,
    plan: { title: 'Mała wyprawa po wiedzę', topicIds: ids, setAt: at, until },
  });
  await store.put('profile', { id: 'demo-badaczka', name: 'Badaczka', avatar: '🦉', grade: 5, theme: 'kosmos', createdAt: at, updatedAt: at });
  await store.saveSettings({ parentPinHash: await hashPin('123456', 'test-preview'), pinSalt: 'test-preview', pinLength: 6, sounds: false });
  if (next) {
    const exercises = parseDsl(next.dsl).exercises.slice(0, 4);
    await store.put('session', {
      id: 'demo-session',
      profileId: 'demo-odkrywca',
      topicId: next.id,
      mode: 'topic',
      startedAt: at,
      endedAt: at,
      activeSeconds: 180,
      answered: exercises.length,
      correct: Math.max(0, exercises.length - 1),
      completed: true,
    });
    await store.putMany(
      'attempt',
      exercises.map((ex, i) => ({
        id: `demo-attempt-${i}`,
        profileId: 'demo-odkrywca',
        sessionId: 'demo-session',
        topicId: next.id,
        exerciseId: ex.id,
        at,
        correct: i !== 0,
        retry: false,
        hint: false,
        ms: 6000,
        ...(i === 0 ? { answer: 'Przykładowa błędna odpowiedź' } : {}),
      })),
    );
  }
}

export function PreviewBanner() {
  return (
    <aside className="preview-banner" aria-label="Wersja testowa">
      <b>WERSJA TESTOWA</b>
      <span>Osobne dane demo · PIN rodzica: 123456</span>
      <details>
        <summary>Jak sprawdzić tę wersję?</summary>
        <p>
          Wybierz Odkrywcę (klasa 3) lub Badaczkę (klasa 5). Obejrzyj zadanie na dziś, naukę, gry, postępy i nagrody. W panelu rodzica przełącz dziecko, a potem
          sekcję — wybór zostaje. Możesz też dodać własny profil testowy. Dane zapisują się tylko w tej przeglądarce; ta strona nie łączy się z kontem rodziny.
        </p>
      </details>
    </aside>
  );
}
