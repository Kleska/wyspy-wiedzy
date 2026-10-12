import { HISTORY_GRADE5 } from './history5';
import { parseDsl } from '../dsl';
import type { ParsedTopic } from '../types';

/** Cztery zagadnienia przekrojowe z każdego tematu. Aktualne filtry zadań pozostają nadrzędne. */
export const HISTORY_CHAPTER1_EXAM = HISTORY_GRADE5.flatMap((t) => parseDsl(t.dsl).exercises.slice(-4).map((ex) => ({ topicId: t.id, exerciseId: ex.id })));

export function historyChapter1ExamItems(topics: ParsedTopic[]) {
  if (topics.length !== HISTORY_GRADE5.length) return undefined;
  if (!HISTORY_CHAPTER1_EXAM.every((item) => topics.find((t) => t.id === item.topicId)?.exercises.some((ex) => ex.id === item.exerciseId))) return undefined;
  return HISTORY_CHAPTER1_EXAM.map((item) => ({ ...item }));
}
