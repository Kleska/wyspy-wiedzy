import { BUILTIN_TOPICS } from './content/seed';
import { store, nowIso } from './data/store';
import { parseDsl } from './dsl';
import { hashPin } from './ui/parent/ParentGate';

/** Dane demonstracyjne trafiają wyłącznie do osobnej bazy kompilacji staging. */
export async function seedPreview() {
  const initial = !store.profiles().length;
  const at = nowIso();
  const until = new Date(Date.now() + 7 * 86400000).toLocaleDateString('sv-SE');
  const lesson = BUILTIN_TOPICS.find((t) => t.subject === 'ang' && t.grades?.includes(3) && t.lesson);
  const next = BUILTIN_TOPICS.find((t) => t.subject === 'mat' && t.grades?.includes(3));
  const ids = [lesson?.id, next?.id].filter((id): id is string => !!id);
  if (initial) {
  await store.put('profile', {
    id: 'demo-odkrywca',
    name: 'Odkrywca',
    avatar: 'hero:street',
    grade: 3,
    theme: 'wyspy',
    createdAt: at,
    updatedAt: at,
    plan: { title: 'Mała wyprawa po wiedzę', topicIds: ids, setAt: at, until },
  });
  await store.put('profile', { id: 'demo-badaczka', name: 'Badaczka', avatar: 'hero:nova', grade: 5, theme: 'kosmos', createdAt: at, updatedAt: at });
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
  // Starszy podgląd dostaje tylko brakujące przykłady; własnych wyników nie nadpisujemy.
  if (store.get('profile', 'demo-badaczka') && !store.get('profile', 'demo-kolezanka')) await store.put('profile', { id: 'demo-kolezanka', name: 'Koleżanka', grade: 5, avatar: 'hero:artist', theme: 'kosmos', createdAt: at, updatedAt: at });
  for (const pid of ['demo-odkrywca', 'demo-badaczka']) {
    const p = store.get('profile', pid); if (!p) continue;
    const topics = store.topicsFor(pid);
    const topic = topics.find((t) => t.subject === 'mat' && t.exercises.length >= 5) ?? topics.find((t) => t.exercises.length);
    if (!topic) continue;
    const quizId = `demo-history-quiz-${pid}`;
    const items = topic.exercises.slice(0, 5).map((ex) => ({ topicId: topic.id, exerciseId: ex.id }));
    if (!p.quizzes?.some((q) => q.id === quizId)) await store.put('profile', { ...p, quizzes: [...(p.quizzes ?? []), { id: quizId, title: 'Przykładowa kartkówka', topicIds: [topic.id], items, count: items.length, createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), ...(pid === 'demo-badaczka' ? { batchId: 'demo-class-five' } : {}) }], updatedAt: at });
    const kinds = ['learn', 'topic', 'test', 'test', 'diagnostic'] as const;
    for (let i = 0; i < kinds.length; i++) {
      const id = `demo-history-${pid}-${i}`; if (store.get('session', id)) continue;
      const startedAt = new Date(Date.now() - (i + 1) * 86400000).toISOString();
      const completed = i !== 3;
      const answered = i === 0 ? 0 : i === 3 ? 2 : items.length;
      await store.put('session', { id, profileId: pid, topicId: topic.id, topicIds: [topic.id], mode: kinds[i], title: i === 2 ? 'Przykładowa kartkówka' : topic.title, ...(i === 2 ? { quizId } : {}), startedAt, endedAt: completed ? new Date(Date.parse(startedAt) + 180000).toISOString() : null, activeSeconds: 180, answered, correct: Math.max(0, answered - 1), completed });
      await store.putMany('attempt', items.slice(0, answered).map((item, j) => ({ id: `${id}-answer-${j}`, profileId: pid, sessionId: id, topicId: item.topicId, exerciseId: item.exerciseId, at: startedAt, correct: j > 0, retry: false, hint: false, ms: 8000, ...(j === 0 ? { answer: 'Przykładowa odpowiedź do poprawy' } : {}) })));
    }
    if (pid === 'demo-badaczka') {
      const friend = store.get('profile', 'demo-kolezanka');
      if (friend && !friend.quizzes?.some((q) => q.id === 'demo-friend-quiz')) await store.put('profile', { ...friend, quizzes: [...(friend.quizzes ?? []), { id: 'demo-friend-quiz', batchId: 'demo-class-five', title: 'Przykładowa kartkówka', topicIds: [topic.id], items, count: items.length, createdAt: at }], updatedAt: at });
    }
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
          Wybierz Odkrywcę (klasa 3) lub Badaczkę i Koleżankę (klasa 5). Obejrzyj historię, wyniki i nową kolekcję bohaterów. Badaczka i Koleżanka pozwalają sprawdzić wspólną kartkówkę. W panelu rodzica przełącz dziecko, a potem
          sekcję — wybór zostaje. Możesz też dodać własny profil testowy. Dane zapisują się tylko w tej przeglądarce; ta strona nie łączy się z kontem rodziny.
        </p>
      </details>
    </aside>
  );
}
