import { describe, expect, it } from 'vitest';
import { HISTORY_GRADE5 } from '../src/content/history5';
import { HISTORY_CHAPTER1_EXAM, historyChapter1ExamItems } from '../src/content/history5Exam';
import { parseDsl, parseLesson, lessonListParts, LIST_BUDGET } from '../src/dsl';
import type { ParsedTopic } from '../src/types';

const topics: ParsedTopic[] = HISTORY_GRADE5.map((t) => ({ ...t, builtin: true, exercises: parseDsl(t.dsl).exercises, errors: [] }));
describe('pierwszy rozdział historii z PDF', () => {
  it('sprawdzian obejmuje wszystkie sześć tematów po równo i korzysta z istniejących, różnych pytań', () => {
    const items = historyChapter1ExamItems(topics)!;
    expect(items).toHaveLength(24);
    expect(new Set(items.map((i) => i.exerciseId)).size).toBe(24);
    for (const t of topics) {
      expect(t.exercises).toHaveLength(28);
      expect(items.filter((i) => i.topicId === t.id)).toHaveLength(4);
    }
    expect(items).toEqual(HISTORY_CHAPTER1_EXAM);
  });
  it('nie omija wyłączenia pytania przez rodzica ani wyboru części tematów', () => {
    const item = HISTORY_CHAPTER1_EXAM[0];
    const disabled = topics.map((t) => ({ ...t, exercises: t.exercises.filter((ex) => ex.id !== item.exerciseId) }));
    expect(historyChapter1ExamItems(disabled)).toBeUndefined();
    expect(historyChapter1ExamItems(topics.slice(0, 5))).toBeUndefined();
  });
  it('wszystkie fragmenty list mieszczą się w budżecie istniejących kart lekcji', () => {
    for (const t of topics) for (const list of parseLesson(t.lesson)!.lists) {
      for (const [a, b] of lessonListParts(list)) {
        const size = list.items.slice(a, b).reduce((sum, i) => sum + i.head.length + i.text.length + 70, 0);
        expect(size, `${t.title}: ${list.title}`).toBeLessThanOrEqual(LIST_BUDGET);
      }
    }
  });
});
