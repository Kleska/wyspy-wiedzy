import { describe, expect, it } from 'vitest';
import { HISTORY_CHAPTER2, HISTORY_GREECE5, GREECE_DATES } from '../src/content/historyGreece5';
import { HISTORY_GREECE_EXAMS, chapterExamFor } from '../src/content/chapterExams';
import { BUILTIN_TOPICS } from '../src/content/seed';
import { parseDsl, parseLesson, exerciseToDsl, lessonListParts, LIST_BUDGET } from '../src/dsl';
import { correctText } from '../src/ui/exercises/logic';
import type { ParsedTopic } from '../src/types';
const topics: ParsedTopic[] = HISTORY_GREECE5.map((t) => ({ ...t, builtin: true, ...parseDsl(t.dsl) }));
describe('starożytna Grecja według rozdziału II z PDF', () => {
  it('obejmuje pięć tematów i powtórkę, po 28 zadań z wyjaśnieniami i 3 inne pytania kontrolne', () => {
    expect(topics.map((t) => t.title)).toEqual(['Demokratyczne Ateny', 'Sparta i wojny z Persami', 'Bogowie i mity', 'Kultura starożytnej Grecji', 'Imperium Aleksandra Wielkiego', 'Powtórka: daty, postacie i pojęcia']);
    const bodies = new Set<string>();
    for (const t of topics) {
      expect(BUILTIN_TOPICS.some((builtin) => builtin.id === t.id)).toBe(true);
      expect(t.unit).toBe(HISTORY_CHAPTER2);
      expect(t.grades).toEqual([5]);
      expect(t.errors, t.title).toEqual([]);
      expect(t.exercises).toHaveLength(28);
      expect(t.guide).toBeTruthy();
      const lesson = parseLesson(t.lesson)!;
      expect(lesson.errors, t.title).toEqual([]);
      expect(lesson.checks).toHaveLength(3);
      expect(lesson.key.length).toBeLessThanOrEqual(3);
      expect(lesson.pairs).toHaveLength(3);
      expect(lesson.lists.some((list) => list.title === 'Daty' && !list.numbered)).toBe(true);
      expect(t.exercises.some((e) => e.type === 'fill')).toBe(true);
      const body = (ex: typeof t.exercises[number]) => exerciseToDsl({ ...ex, explain: undefined, hint: undefined });
      const own = new Set(t.exercises.map(body));
      for (const ex of [...t.exercises, ...lesson.checks]) {
        expect(ex.explain, ex.prompt).toBeTruthy();
        expect(bodies.has(body(ex)), ex.prompt).toBe(false);
        bodies.add(body(ex));
        if (ex.type === 'choice') expect(ex.options.every((o) => o.length < 115), ex.prompt).toBe(true);
      }
      for (const check of lesson.checks) expect(own.has(body(check))).toBe(false);
      for (const list of lesson.lists) for (const [a, b] of lessonListParts(list)) {
        const cost = list.items.slice(a, b).reduce((sum, row) => sum + row.head.length + row.text.length + 70, 0);
        expect(cost, `${t.title}: ${list.title}`).toBeLessThanOrEqual(LIST_BUDGET);
      }
    }
    expect(bodies.size).toBe(186);
  });
  it('oba warianty mają po 24 unikalne pytania, po cztery z każdego tematu i żadnych wspólnych zadań', () => {
    const chapter = chapterExamFor('his', topics)!;
    expect(chapter).toMatchObject({ topicCount: 6, perTopic: 4 });
    expect(chapter.variants).toEqual(HISTORY_GREECE_EXAMS);
    const all: string[] = [];
    for (const variant of chapter.variants) {
      expect(variant.items).toHaveLength(24);
      for (const t of topics) expect(variant.items.filter((i) => i.topicId === t.id)).toHaveLength(4);
      for (const item of variant.items) {
        expect(topics.find((t) => t.id === item.topicId)!.exercises.some((e) => e.id === item.exerciseId)).toBe(true);
        all.push(item.exerciseId);
      }
    }
    expect(new Set(all).size).toBe(48);
  });
  it('respektuje wyłączenia rodzica i pełny zakres rozdziału', () => {
    expect(chapterExamFor('his', topics.slice(0, -1))).toBeUndefined();
    const disabled = new Set(HISTORY_GREECE_EXAMS.map((v) => v.items[0].exerciseId));
    const filtered = topics.map((t) => ({ ...t, exercises: t.exercises.filter((e) => !disabled.has(e.id)) }));
    expect(chapterExamFor('his', filtered)).toBeUndefined();
    const onlyA = topics.map((t) => ({ ...t, exercises: t.exercises.filter((e) => e.id !== HISTORY_GREECE_EXAMS[1].items[0].exerciseId) }));
    expect(chapterExamFor('his', onlyA)?.variants.map((v) => v.id)).toEqual(['A']);
    expect(chapterExamFor('mat', topics)).toBeUndefined();
  });
  it('utrzymuje sprawdzone daty oraz różnicę między wierzeniami i historią', () => {
    const byPrompt = (part: string) => topics.flatMap((t) => t.exercises).find((e) => e.prompt.includes(part))!;
    expect(correctText(byPrompt('datę lądowego zwycięstwa'))).toContain('490');
    expect(correctText(byPrompt('rok bitwy morskiej pod Salaminą'))).toContain('480');
    expect(correctText(byPrompt('datę bitwy pod Issos'))).toContain('333');
    expect(correctText(byPrompt('datę rozstrzygającego zwycięstwa'))).toContain('331');
    expect(correctText(byPrompt('rok śmierci Aleksandra Wielkiego'))).toContain('323');
    expect(correctText(byPrompt('O czym przede wszystkim opowiada Iliada'))).toContain('walkach podczas wojny');
    expect(correctText(byPrompt('Która para składa się z postaci mitycznych'))).toContain('Achilles i Herakles');
    expect(correctText(byPrompt('Do którego wieku należy 490'))).toContain('V wieku p.n.e.');
    expect(correctText(byPrompt('Do którego wieku należy 333'))).toContain('IV wieku p.n.e.');
    const exactDates = GREECE_DATES.map(([date]) => /^(\d+) r\./.exec(date)?.[1]).filter(Boolean).map(Number);
    expect(exactDates).toEqual([...exactDates].sort((a, b) => b - a));
  });
});
