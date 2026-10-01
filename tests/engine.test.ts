import { describe, expect, it } from 'vitest';
import { BUILTIN_TOPICS } from '../src/content/seed';
import { DEFAULT_SETTINGS } from '../src/data/store';
import { parseDsl } from '../src/dsl';
import { buildReviewQueue, buildTopicQueue, computeProgress, itemKey, levelFromXp, suggestTopic } from '../src/engine';
import type { Attempt, ParsedTopic, Session } from '../src/types';

const topics: ParsedTopic[] = BUILTIN_TOPICS.map((t) => ({ ...t, ...parseDsl(t.dsl), builtin: true }));
const noun = topics.find((t) => t.id === 'b-rzeczownik')!;
const P = 'kid';
let n = 0;

function att(topic: ParsedTopic, i: number, correct: boolean, at: string, sessionId = 's1', retry = false): Attempt {
  return { id: `a${n++}`, profileId: P, sessionId, topicId: topic.id, exerciseId: topic.exercises[i].id, correct, retry, hint: false, ms: 3000, at };
}

function sess(id: string, startedAt: string, completed = true, activeSeconds = 300): Session {
  return { id, profileId: P, topicId: noun.id, mode: 'topic', startedAt, endedAt: startedAt, activeSeconds, answered: 10, correct: 9, completed };
}

function progress(attempts: Attempt[], sessions: Session[], now: string) {
  return computeProgress({ profileId: P, attempts, sessions, redemptions: [], topics, settings: DEFAULT_SETTINGS, now: Date.parse(now) });
}

describe('postęp', () => {
  it('pusty profil', () => {
    const p = progress([], [], '2026-10-01T10:00:00');
    expect(p.xp).toBe(0);
    expect(p.level).toBe(1);
    expect(p.coins).toBe(0);
    expect(p.streak).toBe(0);
    expect(p.topics.get(noun.id)?.newCount).toBe(noun.exercises.length);
  });

  it('XP, monety, seria i pudełka powtórek', () => {
    const a = [
      att(noun, 0, true, '2026-10-01T10:00:00'),
      att(noun, 1, true, '2026-10-01T10:00:10'),
      att(noun, 2, true, '2026-10-01T10:00:20'),
      att(noun, 3, false, '2026-10-01T10:00:30'),
      att(noun, 3, true, '2026-10-01T10:00:40', 's1', true),
    ];
    const p = progress(a, [sess('s1', '2026-10-01T10:00:00')], '2026-10-01T12:00:00');
    // 3×10 + combo(3.) 2 + błąd 1 + poprawka 5
    expect(p.xp).toBe(38);
    // 3 monety za odpowiedzi + 5 za ukończoną sesję (wynik 3/4 < 80%)
    expect(p.coins).toBe(8);
    expect(p.streak).toBe(1);
    const st = p.items.get(itemKey(noun.id, noun.exercises[0].id))!;
    expect(st.box).toBe(1);
    // Poprawka w tej samej sesji nie podnosi pudełka
    expect(p.items.get(itemKey(noun.id, noun.exercises[3].id))!.box).toBe(0);
  });

  it('pudełko rośnie tylko, gdy zadanie było do powtórki', () => {
    const a = [att(noun, 0, true, '2026-10-01T10:00:00', 's1'), att(noun, 0, true, '2026-10-01T11:00:00', 's2'), att(noun, 0, true, '2026-10-02T09:00:00', 's3')];
    const p = progress(a, [], '2026-10-02T12:00:00');
    expect(p.items.get(itemKey(noun.id, noun.exercises[0].id))!.box).toBe(2);
  });

  it('seria dni liczy się wstecz od wczoraj, jeśli dziś jeszcze nie było nauki', () => {
    const s = [sess('a', '2026-09-28T10:00:00'), sess('b', '2026-09-29T10:00:00'), sess('c', '2026-09-30T10:00:00')];
    expect(progress([], s, '2026-10-01T08:00:00').streak).toBe(3);
    expect(progress([], s, '2026-10-02T08:00:00').streak).toBe(0);
    expect(progress([], s, '2026-10-02T08:00:00').bestStreak).toBe(3);
  });

  it('wydane monety i odrzucone prośby', () => {
    const a = Array.from({ length: 10 }, (_, i) => att(noun, i, true, `2026-10-01T10:00:${10 + i}`));
    const base = { profileId: P, attempts: a, sessions: [sess('s1', '2026-10-01T10:00:00')], topics, settings: DEFAULT_SETTINGS, now: Date.parse('2026-10-01T12:00:00') };
    const earned = computeProgress({ ...base, redemptions: [] }).coins;
    const p = computeProgress({
      ...base,
      redemptions: [
        { id: 'r1', profileId: P, rewardId: 'x', title: 'x', cost: 5, status: 'pending', real: true, at: '2026-10-01T12:00:00' },
        { id: 'r2', profileId: P, rewardId: 'y', title: 'y', cost: 7, status: 'rejected', real: true, at: '2026-10-01T12:00:00' },
      ],
    });
    expect(p.coins).toBe(earned - 5);
    expect(p.pendingRewards).toBe(1);
  });

  it('„Zacznij od nowa” — liczymy tylko zdarzenia od chwili wyzerowania', () => {
    const a = [att(noun, 0, true, '2026-10-01T10:00:00'), att(noun, 1, true, '2026-10-02T10:00:00')];
    const full = progress(a, [], '2026-10-02T12:00:00');
    const reset = computeProgress({ profileId: P, attempts: a, sessions: [], redemptions: [], topics, settings: DEFAULT_SETTINGS, now: Date.parse('2026-10-02T12:00:00'), since: '2026-10-02T00:00:00' });
    expect(full.totalAnswered).toBe(2);
    expect(reset.totalAnswered).toBe(1);
    expect(reset.xp).toBe(10);
  });

  it('poziomy', () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(99)).toBe(1);
    expect(levelFromXp(100)).toBe(2);
    expect(levelFromXp(300)).toBe(3);
  });
});

describe('układanie sesji', () => {
  it('nowy temat: tyle zadań, ile ustawiono, bez powtórzeń', () => {
    const p = progress([], [], '2026-10-01T10:00:00');
    const q = buildTopicQueue(noun, p, 10, Date.parse('2026-10-01T10:00:00'));
    expect(q).toHaveLength(10);
    expect(new Set(q.map((x) => x.ex.id)).size).toBe(10);
  });

  it('najpierw zadania z błędami, potem nowe', () => {
    const a = [att(noun, 5, false, '2026-10-01T10:00:00')];
    const p = progress(a, [], '2026-10-01T10:05:00');
    const q = buildTopicQueue(noun, p, 3, Date.parse('2026-10-01T10:05:00'));
    expect(q.map((x) => x.ex.id)).toContain(noun.exercises[5].id);
  });

  it('powtórka zbiera zaległe zadania z różnych tematów', () => {
    const verb = topics.find((t) => t.id === 'b-czasownik')!;
    const a = [att(noun, 0, false, '2026-10-01T10:00:00'), att(verb, 0, true, '2026-09-20T10:00:00')];
    const p = progress(a, [], '2026-10-01T12:00:00');
    const q = buildReviewQueue(topics, p, 10, Date.parse('2026-10-01T12:00:00'));
    expect(q.map((x) => x.topicId).sort()).toEqual(['b-czasownik', 'b-rzeczownik']);
  });

  it('polecany temat: najpierw pierwszy nowy', () => {
    const p = progress([], [], '2026-10-01T10:00:00');
    expect(suggestTopic(topics, p)?.id).toBe('b-rzeczownik');
  });
});

describe('seria z zamrożeniem', () => {
  const freeze = (at: string) => ({ id: `f${n++}`, profileId: P, rewardId: 'freeze', title: 'Zamrożenie', cost: 50, status: 'approved' as const, real: false, at });

  it('zamrożenie ratuje dzień bez nauki', () => {
    const s = [sess('a', '2026-09-28T10:00:00'), sess('b', '2026-09-29T10:00:00'), sess('c', '2026-10-01T10:00:00')];
    const p = computeProgress({ profileId: P, attempts: [], sessions: s, redemptions: [freeze('2026-09-29T15:00:00')], topics, settings: DEFAULT_SETTINGS, now: Date.parse('2026-10-01T18:00:00') });
    expect(p.streak).toBe(3);
    expect(p.freezes).toBe(0);
    expect([...p.frozenDays]).toEqual(['2026-09-30']);
  });

  it('zamrożenie kupione po opuszczonym dniu go nie ratuje, ale zostaje w zapasie', () => {
    const s = [sess('a', '2026-09-28T10:00:00'), sess('c', '2026-09-30T10:00:00')];
    const p = computeProgress({ profileId: P, attempts: [], sessions: s, redemptions: [freeze('2026-09-30T15:00:00')], topics, settings: DEFAULT_SETTINGS, now: Date.parse('2026-10-01T09:00:00') });
    expect(p.streak).toBe(1);
    expect(p.freezes).toBe(1);
    expect(p.streakAtRisk).toBe(true);
  });

  it('premia za kamień milowy serii (3 dni)', () => {
    const s3 = [sess('a', '2026-09-28T10:00:00'), sess('b', '2026-09-29T10:00:00'), sess('c', '2026-09-30T10:00:00')];
    const p2 = progress([], s3.slice(0, 2), '2026-09-29T18:00:00');
    const p3 = progress([], s3, '2026-09-30T18:00:00');
    expect(p3.coins - p2.coins).toBe(5 + 10);
  });
});

describe('poziomy tematów i test na start', () => {
  const diag = (id: string, at: string, end: string): Session => ({ ...sess(id, at), mode: 'diagnostic', endedAt: end, topicIds: [noun.id] });

  it('3 z 3 w teście na start → temat od razu „Biegły”', () => {
    const a = [0, 1, 2].map((i) => att(noun, i, true, `2026-10-01T10:00:0${i}`, 'd1'));
    const p = progress(a, [diag('d1', '2026-10-01T10:00:00', '2026-10-01T10:05:00')], '2026-10-01T12:00:00');
    const t = p.topics.get(noun.id)!;
    expect(t.level).toBe(3);
    expect(t.placed).toBe(true);
    expect(t.seen).toBe(3);
    expect(t.newCount).toBe(0);
    expect(t.dueCount).toBe(0);
    expect(p.exams[0]).toMatchObject({ mode: 'diagnostic', correct: 3, total: 3, grade: 6 });
  });

  it('2 z 3 — bez zaliczenia', () => {
    const a = [att(noun, 0, true, '2026-10-01T10:00:00', 'd1'), att(noun, 1, true, '2026-10-01T10:00:01', 'd1'), att(noun, 2, false, '2026-10-01T10:00:02', 'd1')];
    const p = progress(a, [diag('d1', '2026-10-01T10:00:00', '2026-10-01T10:05:00')], '2026-10-01T12:00:00');
    expect(p.topics.get(noun.id)!.level).toBe(1);
    expect(p.topics.get(noun.id)!.placed).toBe(false);
  });

  it('poziom spada po błędach', () => {
    const ok = noun.exercises.map((_, i) => att(noun, i, true, `2026-10-01T10:00:${String(10 + i).padStart(2, '0')}`));
    expect(progress(ok, [], '2026-10-01T12:00:00').topics.get(noun.id)!.level).toBe(2);
    const bad = [0, 1, 2].map((i) => att(noun, i, false, `2026-10-01T11:00:0${i}`, 's2'));
    expect(progress([...ok, ...bad], [], '2026-10-01T12:00:00').topics.get(noun.id)!.level).toBe(1);
  });

  it('cel tygodnia: 4 dni nauki i 2 tematy na wyższym poziomie', () => {
    const verb = topics.find((t) => t.id === 'b-czasownik')!;
    const a = [...noun.exercises.map((_, i) => att(noun, i, true, `2026-09-28T10:${String(i).padStart(2, '0')}:00`)), ...verb.exercises.map((_, i) => att(verb, i, true, `2026-09-28T11:${String(i).padStart(2, '0')}:00`))];
    const s = ['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01'].map((d, i) => sess(`w${i}`, `${d}T10:00:00`));
    const p = progress(a, s, '2026-10-01T18:00:00');
    expect(p.week).toMatchObject({ start: '2026-09-28', days: 4, levelUps: 2, done: true });
    expect(p.weeksDone).toBe(1);
    expect(p.badges.find((b) => b.id === 'week')?.earned).toBe(true);
  });
});

describe('oceny, Błyskawica, cel rodziny, kolejki', () => {
  it('skala ocen', async () => {
    const { schoolGrade } = await import('../src/engine');
    expect([15, 14, 13, 11, 8, 5, 4].map((c) => schoolGrade(c, 15))).toEqual([6, 5, 5, 4, 3, 2, 1]);
  });

  it('Błyskawica: monety za ukończenie 3 razy dziennie, premia za rekord', () => {
    const s = [6, 8, 7, 9].map((c, i): Session => ({ ...sess(`sp${i}`, `2026-10-01T10:0${i}:00`), mode: 'sprint', genId: 'mul', correct: c, answered: c }));
    const p = progress([], s, '2026-10-01T12:00:00');
    expect(p.coins).toBe(3 * 5 + 3 * 10);
    expect(p.sprintBest.get('mul')).toBe(9);
  });

  it('cel rodziny liczy dobre odpowiedzi rodzeństwa (bez poprawek i Błyskawicy)', async () => {
    const { familyGoalProgress } = await import('../src/engine');
    const goal = { id: 'g', title: 'Kino', target: 3, startAt: '2026-10-01T00:00:00' };
    const a: Attempt[] = [
      { ...att(noun, 0, true, '2026-10-01T10:00:00'), profileId: 'a' },
      { ...att(noun, 1, true, '2026-10-01T10:00:01'), profileId: 'b' },
      { ...att(noun, 2, true, '2026-10-01T10:00:02', 's1', true), profileId: 'b' },
      { ...att(noun, 3, true, '2026-09-30T10:00:00'), profileId: 'a' },
      { ...att(noun, 4, true, '2026-10-01T10:00:03', 'spr'), profileId: 'a' },
    ];
    const r = familyGoalProgress(goal, a, [{ ...sess('spr', '2026-10-01T10:00:00'), mode: 'sprint' }], ['a', 'b']);
    expect(r.total).toBe(2);
    expect(r.per.get('a')).toBe(1);
    expect(r.done).toBe(false);
  });

  it('sprawdzian bierze zadania po równo z tematów; test na start po 3 z nieruszonych', async () => {
    const { buildExamQueue, buildDiagnosticQueue } = await import('../src/engine');
    const verb = topics.find((t) => t.id === 'b-czasownik')!;
    const q = buildExamQueue([noun, verb], 10);
    expect(q).toHaveLength(10);
    expect(q.filter((x) => x.topicId === noun.id)).toHaveLength(5);
    const p = progress([att(noun, 0, true, '2026-10-01T10:00:00')], [], '2026-10-01T12:00:00');
    const pl = topics.filter((t) => t.subject === 'pl' && t.grades?.includes(3));
    const d = buildDiagnosticQueue(pl, p);
    expect(d.some((x) => x.topicId === noun.id)).toBe(false);
    expect(new Set(d.map((x) => x.topicId)).size * 3).toBe(d.length);
  });
});
