import { nowIso, store, uid } from '../../data/store';
import { sessionMistakes } from '../../engine';
import { plural } from '../../themes';
import type { AssignedQuiz, Profile } from '../../types';
import { Icon } from '../icons';
import { MistakeList, mistakeRows, type MistakeRow } from '../Mistakes';

/** Najwięcej pytań w kartkówce z błędów — dłuższa przestaje być kartkówką. */
export const MISTAKE_QUIZ_MAX = 20;

/** Błędy z jednej sesji (sprawdzian, kartkówka) z treścią zadań — dla tabel w panelu rodzica. */
export function examMistakeRows(profileId: string, sessionId: string): MistakeRow[] {
  return mistakeRows(sessionMistakes(sessionId, store.list('attempt')), store.topicsFor(profileId));
}

/**
 * Zadaje kartkówkę dokładnie z podanych zadań (np. z tych, w których dziecko się pomyliło).
 * Zwraca liczbę pytań. Zapis idzie przez aktualny profil ze store — tak jak wymaga synchronizacja.
 */
export async function assignMistakeQuiz(profileId: string, title: string, rows: { topicId: string; exerciseId: string }[]): Promise<number> {
  const p = store.get('profile', profileId);
  const items = rows.slice(0, MISTAKE_QUIZ_MAX).map(({ topicId, exerciseId }) => ({ topicId, exerciseId }));
  if (!p || !items.length) return 0;
  const quiz: AssignedQuiz = { id: uid(), title, topicIds: [...new Set(items.map((i) => i.topicId))], count: items.length, items, createdAt: nowIso() };
  await store.put('profile', { ...p, quizzes: [...(p.quizzes ?? []), quiz], updatedAt: nowIso() });
  return items.length;
}

/** Rozwinięcie wiersza sprawdzianu lub kartkówki: w których pytaniach dziecko się pomyliło + kartkówka z tych pytań. */
export function ExamMistakes({ p, rows, title, onAssigned }: { p: Profile; rows: MistakeRow[]; title: string; onAssigned: (msg: string) => void }) {
  if (!rows.length) return <p className="muted">Zadań z tego sprawdzianu nie ma już w tematach (zmieniono ich treść), więc nie da się pokazać błędów.</p>;
  const n = Math.min(rows.length, MISTAKE_QUIZ_MAX);
  return (
    <div className="col exam-mistakes" style={{ gap: 10 }}>
      <MistakeList rows={rows} reportFor={p.id} />
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <button
          className="btn btn-primary btn-sm"
          onClick={async () => {
            const k = await assignMistakeQuiz(p.id, `Poprawa: ${title}`, rows);
            onAssigned(`Zadano kartkówkę z ${k} ${plural(k, ['pytania', 'pytań', 'pytań'])}, w których ${p.name} się pomylił(a). Jest na ekranie startowym.`);
          }}
        >
          <Icon name="test" size={16} /> Zadaj kartkówkę z tych błędów ({n})
        </button>
      </div>
    </div>
  );
}
