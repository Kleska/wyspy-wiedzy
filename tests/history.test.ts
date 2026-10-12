import { describe, expect, it } from 'vitest';
import { childHistory, filterHistory, historyStats } from '../src/studentHistory';
import { parseDsl } from '../src/dsl';
import { hideQuizzes } from '../src/engine';
import type { Attempt, Profile, Session, ParsedTopic } from '../src/types';
const at = '2026-10-12T12:00:00.000Z';
const p: Profile = { id: 'a', name: 'A', avatar: 'hero:nova', grade: 5, theme: 'kosmos', createdAt: at, updatedAt: at };
const topic: ParsedTopic = { id: 't', builtin: false, order: 1, source: 'manual', title: 'Ułamki', subject: 'mat', unit: 'Liczby', grades: [5], dsl: 'wybierz: 1/2 to? | *połowa | całość', createdAt: at, updatedAt: at, ...parseDsl('wybierz: 1/2 to? | *połowa | całość') };
const session = (over: Partial<Session> = {}): Session => ({ id: 's', profileId: 'a', topicId: 't', title: 'Dawna nazwa', mode: 'test', startedAt: at, endedAt: at, activeSeconds: 120, answered: 2, correct: 2, completed: true, ...over });
const attempt = (over: Partial<Attempt> = {}): Attempt => ({ id: 'x', profileId: 'a', sessionId: 's', topicId: 't', exerciseId: 'e', at, correct: false, retry: false, hint: false, ms: 1000, ...over });
describe('historia dziecka', () => {
  it('liczy pierwsze odpowiedzi zamiast sumy poprawek', () => {
    const [entry] = childHistory(p, [session()], [attempt(), attempt({ id: 'y', exerciseId: 'f', correct: true }), attempt({ id: 'z', retry: true, correct: true })], [topic]);
    expect(entry).toMatchObject({ answered: 2, correct: 1, grade: 3, retries: 1, title: 'Dawna nazwa' });
  });
  it('ocenia wyłącznie ukończony sprawdzian z odpowiedziami', () => {
    const entries = childHistory(p, [session({ id: 'incomplete', completed: false }), session({ id: 'start', mode: 'diagnostic' }), session({ id: 'empty', answered: 0, correct: 0 })], [], [topic]);
    expect(entries.every((e) => e.grade === null)).toBe(true);
  });
  it('oddziela dziecko, reset i puste przerwane sesje', () => {
    expect(childHistory({ ...p, resetAt: '2026-10-11T00:00:00Z' }, [session({ id: 'old', startedAt: '2026-10-10T00:00:00Z' }), session({ id: 'other', profileId: 'b' }), session({ id: 'empty', completed: false, answered: 0, activeSeconds: 0 }), session()], [], [topic]).map((e) => e.session.id)).toEqual(['s']);
  });
  it('archiwum dziecka zachowuje schowane przez nie kartkówki, respektuje decyzję rodzica', () => {
    const s = session({ quizId: 'q' });
    const childHidden = { ...p, ...hideQuizzes(p, ['q'], 'child', true, at) };
    expect(childHistory(childHidden, [s], [], [topic])).toHaveLength(1);
    const parentHidden = { ...p, ...hideQuizzes(p, ['q'], 'parent', true, at) };
    expect(childHistory(parentHidden, [s], [], [topic])).toHaveLength(0);
    expect(childHistory(parentHidden, [s], [], [topic], 'parent')).toHaveLength(1);
  });
  it('przechowuje tytuł po usunięciu tematu i rozpoznaje przedmiot generatora', () => {
    expect(childHistory(p, [session()], [], [])[0].title).toBe('Dawna nazwa');
    expect(childHistory(p, [session({ mode: 'sprint', topicId: null, genId: 'quiz:ang' })], [], [])[0].subjectIds).toEqual(['ang']);
  });
  it('filtruje kalendarzowo, według rodzaju i przedmiotu', () => {
    const entries = childHistory(p, [session(), session({ id: 'old', startedAt: '2026-09-01T12:00:00Z', endedAt: '2026-09-01T12:00:00Z' }), session({ id: 'quiz', quizId: 'q' })], [], [topic]);
    expect(filterHistory(entries, '7', 'test', 'mat', Date.parse(at))).toHaveLength(1);
    expect(filterHistory(entries, 'all', 'all', '', Date.parse(at))).toHaveLength(3);
    expect(filterHistory(entries, 'all', 'all', 'ang', Date.parse(at))).toHaveLength(0);
  });
  it('nie miesza trafności gier i lekcji, pokazuje tylko rzeczywiste wyniki', () => {
    const entries = childHistory(p, [session(), session({ id: 'game', mode: 'pairs', answered: 100, correct: 6 }), session({ id: 'lesson', mode: 'learn', answered: 0, correct: 0 }), session({ id: 'unfinished', completed: false, correct: 0 })], [], [topic]);
    expect(historyStats(entries)).toMatchObject({ seconds: 480, completed: 3, lessons: 1, assessments: 1, answered: 4, correct: 2, accuracy: 50 });
    expect(historyStats([]).accuracy).toBeNull();
  });
});
