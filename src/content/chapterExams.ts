import { parseDsl } from '../dsl';
import type { ParsedTopic } from '../types';
import { historyChapter1ExamItems } from './history5Exam';
import { MATH_NATURAL5 } from './naturalNumbers5';

export const NATURAL_NUMBERS_EXAMS = (['A', 'B'] as const).map((id, index) => ({
  id,
  label: `Wariant ${id}`,
  items: MATH_NATURAL5.flatMap((t) => parseDsl(t.dsl).exercises.slice(-8 + index * 4, index === 0 ? -4 : undefined)
    .map((ex) => ({ topicId: t.id, exerciseId: ex.id }))),
}));

/** Gotowy zestaw uruchamiamy wyłącznie dla pełnego rozdziału i aktualnie dozwolonych zadań. */
export function chapterExamFor(subjectId: string, topics: ParsedTopic[]) {
  if (subjectId === 'his') {
    const items = historyChapter1ExamItems(topics);
    return items ? { topicCount: 6, perTopic: 4, variants: [{ id: 'A', label: 'Pełny rozdział', items }] } : undefined;
  }
  if (subjectId !== 'mat' || topics.length !== MATH_NATURAL5.length ||
    !MATH_NATURAL5.every((t) => topics.some((candidate) => candidate.id === t.id))) return undefined;
  const variants = NATURAL_NUMBERS_EXAMS.filter((variant) => variant.items.every((item) =>
    topics.find((t) => t.id === item.topicId)?.exercises.some((ex) => ex.id === item.exerciseId)));
  return variants.length ? { topicCount: MATH_NATURAL5.length, perTopic: 4, variants } : undefined;
}
