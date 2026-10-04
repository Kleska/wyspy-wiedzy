import type { ParsedTopic } from '../types';
import { withFractions } from './exercises/Exercises';
import { correctText, questionText } from './exercises/logic';
import { Icon } from './icons';

/** Jeden błąd do pokazania: treść zadania, co odpowiedziało dziecko, jak jest dobrze i dlaczego. */
export interface MistakeRow {
  topicId: string;
  exerciseId: string;
  topic: string;
  question: string;
  given: string;
  correct: string;
  explain?: string;
}

/**
 * Błędy (z dziennika odpowiedzi albo z właśnie skończonego sprawdzianu) połączone z treścią zadań.
 * Zadania, których już nie ma w temacie (rodzic zmienił treść), pomijamy.
 */
export function mistakeRows(items: { topicId: string; exerciseId: string; answer?: string }[], topics: ParsedTopic[]): MistakeRow[] {
  return items.flatMap((m) => {
    const t = topics.find((x) => x.id === m.topicId);
    const ex = t?.exercises.find((e) => e.id === m.exerciseId);
    if (!t || !ex) return [];
    return [
      {
        topicId: t.id,
        exerciseId: ex.id,
        topic: t.title,
        question: `${ex.prompt} ${questionText(ex)}`.trim(),
        given: m.answer ?? '',
        correct: correctText(ex),
        explain: ex.explain,
      },
    ];
  });
}

/** Lista błędów: pytanie, odpowiedź dziecka, poprawna odpowiedź i wyjaśnienie. `mine` — tekst dla dziecka („Twoja odpowiedź”). */
export function MistakeList({ rows, mine }: { rows: MistakeRow[]; mine?: boolean }) {
  return (
    <div className="mistake-list">
      {rows.map((m, i) => (
        <div key={i} className="mistake">
          <div className="mistake-q">
            {withFractions(m.question)}
            <span className="muted"> · {m.topic}</span>
          </div>
          <div>
            <span className="pill bad">{mine ? 'Twoja odpowiedź' : 'Odpowiedź'}</span> {withFractions(m.given || '—')}
          </div>
          <div>
            <span className="pill good">Poprawnie</span> {withFractions(m.correct)}
          </div>
          {m.explain && (
            <div className="mistake-why">
              <Icon name="bulb" size={16} /> <span>{withFractions(m.explain)}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
