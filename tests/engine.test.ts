import { describe, expect, it } from 'vitest';
import { BUILTIN_TOPICS } from '../src/content/seed';
import { DEFAULT_SETTINGS } from '../src/data/store';
import { parseDsl } from '../src/dsl';
import { buildReviewQueue, buildTopicQueue, computeProgress, itemKey, levelFromXp, suggestTopic } from '../src/engine';
import { addReport, decideReports, isGeneratedTopic, isReported, openReports, withoutDisabled } from '../src/engine';
import type { Attempt, ExerciseReport, ParsedTopic, Session } from '../src/types';

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

  it('Pary na czas: rekord to najkrótszy czas, monety jak w Błyskawicy', () => {
    const s = [30000, 25000, 28000].map((ms, i): Session => ({ ...sess(`pa${i}`, `2026-10-01T10:0${i}:00`), mode: 'pairs', genId: 'pairs:mul', durationMs: ms, correct: 6, answered: 6 }));
    const p = progress([], s, '2026-10-01T12:00:00');
    expect(p.coins).toBe(3 * 5 + 2 * 10);
    expect(p.pairsBest.get('pairs:mul')).toBe(25000);
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

describe('moje błędy, tabliczka mnożenia, czytanie', () => {
  it('moje błędy: znikają po dobrej odpowiedzi w późniejszej sesji', async () => {
    const { mistakesToFix } = await import('../src/engine');
    const a = [
      att(noun, 0, false, '2026-10-01T10:00:00', 's1'),
      att(noun, 0, true, '2026-10-01T10:00:05', 's1', true), // poprawka w tej samej sesji się nie liczy
      att(noun, 1, false, '2026-10-01T10:00:10', 's1'),
      att(noun, 1, true, '2026-10-01T11:00:00', 's2'),
      att(noun, 2, false, '2026-09-01T10:00:00', 's0'), // za stare
    ];
    const m = mistakesToFix({ profileId: P, attempts: a, topics, now: Date.parse('2026-10-01T12:00:00') });
    expect(m.map((x) => x.exerciseId)).toEqual([noun.exercises[0].id]);
  });

  it('tabliczka: działanie zielone po dwóch szybkich dobrych odpowiedziach, 6·7 = 7·6', async () => {
    const { multiplicationMap, factKey, weakestFacts } = await import('../src/engine');
    const { allMulExercises } = await import('../src/content/generators');
    const sources = allMulExercises();
    const ex = (a: number, b: number) => sources.find((s) => s.ex.parts[0] === `${a} · ${b} = `)!.ex;
    const mk = (a: number, b: number, ok: boolean, at: string, ms = 3000): Attempt => ({
      id: `m${n++}`, profileId: P, sessionId: 'g', topicId: 'gen:mul', exerciseId: ex(a, b).id, correct: ok, retry: false, hint: false, ms, at,
    });
    const attempts = [mk(6, 7, true, '2026-10-01T10:00:00'), mk(7, 6, true, '2026-10-01T10:00:10'), mk(8, 9, true, '2026-10-01T10:00:20'), mk(8, 9, false, '2026-10-01T10:00:30'), mk(4, 5, true, '2026-10-01T10:00:40', 9000), mk(4, 5, true, '2026-10-01T10:00:50', 9000)];
    const map = multiplicationMap({ profileId: P, attempts, sources });
    expect(map.size).toBe(55);
    expect(map.get(factKey(7, 6))!.status).toBe('known');
    expect(map.get(factKey(8, 9))!.status).toBe('weak');
    expect(map.get(factKey(4, 5))!.status).toBe('learning'); // dobrze, ale za wolno
    expect(map.get(factKey(2, 3))!.status).toBe('none');
    const w = weakestFacts(map, 3);
    expect(w).toHaveLength(3);
    expect(factKey(w[0][0], w[0][1])).toBe(factKey(8, 9));
    expect(w.every(([a, b]) => a > 1 && b > 1)).toBe(true);
  });

  it('czytanie: lekcja to całe teksty z pytaniami w kolejności z tekstu', async () => {
    const { buildTopicQueue } = await import('../src/engine');
    const reading = topics.find((t) => t.id === 'b-czytanie-3')!;
    const p = progress([], [], '2026-10-01T10:00:00');
    const q = buildTopicQueue(reading, p, 5, Date.parse('2026-10-01T10:00:00'));
    const titles = q.map((x) => x.ex.passage?.title);
    expect(new Set(titles).size).toBe(1);
    expect(q.map((x) => x.ex.id)).toEqual(reading.exercises.filter((e) => e.passage?.title === titles[0]).map((e) => e.id));
  });
});

describe('plan: sprawdzian próbny potwierdza opanowanie materiału', () => {
  it('liczba pytań rośnie z liczbą tematów; opanowanie = ostatni sprawdzian z całego planu na 5 lub 6', async () => {
    const { planExamCount, planStatus } = await import('../src/engine');
    expect(planExamCount(2)).toBe(15);
    expect(planExamCount(9)).toBe(27);
    expect(planExamCount(20)).toBe(30);

    const verb = topics.find((t) => t.id === 'b-czasownik')!;
    const ids = [noun.id, verb.id];
    const plan = { topicIds: ids, setAt: '2026-10-01T08:00:00' };
    const exam = (id: string, at: string, good: number, topicIds = ids): { a: Attempt[]; s: Session } => ({
      a: Array.from({ length: 10 }, (_, i) => att(i % 2 ? verb : noun, Math.floor(i / 2), i < good, at, id)),
      s: { id, profileId: P, topicId: null, mode: 'test', topicIds, startedAt: at, endedAt: at, activeSeconds: 200, answered: 10, correct: good, completed: true },
    });

    const none = planStatus(plan, ids, progress([], [], '2026-10-02T10:00:00'));
    expect(none).toMatchObject({ total: 2, fluent: 0, lastExam: null, confirmed: false });

    const weak = exam('e1', '2026-10-02T10:00:00', 7);
    const p1 = progress(weak.a, [weak.s], '2026-10-02T11:00:00');
    expect(planStatus(plan, ids, p1)).toMatchObject({ confirmed: false, lastExam: { grade: 4, correct: 7, total: 10 } });

    const good = exam('e2', '2026-10-03T10:00:00', 9);
    const p2 = progress([...weak.a, ...good.a], [weak.s, good.s], '2026-10-03T11:00:00');
    expect(planStatus(plan, ids, p2)).toMatchObject({ confirmed: true, lastExam: { sessionId: 'e2', grade: 5 } });

    // Sprawdzian tylko z jednego tematu albo sprzed ustawienia planu nie potwierdza całego planu.
    const partial = exam('e3', '2026-10-03T12:00:00', 10, [noun.id]);
    const p3 = progress(partial.a, [partial.s], '2026-10-03T13:00:00');
    expect(planStatus(plan, ids, p3).lastExam).toBeNull();
    const old = exam('e4', '2026-09-30T12:00:00', 10);
    expect(planStatus(plan, ids, progress(old.a, [old.s], '2026-10-03T13:00:00')).lastExam).toBeNull();
  });
});

describe('rozdziały i kartkówki od rodzica', () => {
  it('tematy grupują się w rozdziały w kolejności pojawiania się; angielski ma Unit 0', async () => {
    const { groupByUnit, unitLabel } = await import('../src/engine');
    const g = groupByUnit([{ unit: 'Unit 0', id: 1 }, { unit: 'Unit 1', id: 2 }, { id: 3 }, { unit: ' Unit 0 ', id: 4 }]);
    expect(g.map((x) => [x.unit, x.topics.map((t) => t.id)])).toEqual([
      ['Unit 0', [1, 4]],
      ['Unit 1', [2]],
      ['', [3]],
    ]);
    expect(unitLabel('')).toBe('Pozostałe');
    const english = topics.filter((t) => t.subject === 'ang');
    expect(groupByUnit(english).map((x) => x.unit)).toEqual(['Unit 0']);
    // Każdy temat wbudowany ma dział; na planszy działy stoją w kolejności swoich pierwszych tematów.
    for (const t of topics) expect(t.unit, t.id).toBeTruthy();
    const board = (subject: string, grade: number) =>
      groupByUnit(topics.filter((t) => t.subject === subject && t.grades?.includes(grade)).sort((a, b) => a.order - b.order)).map((x) => [x.unit, x.topics.length]);
    expect(board('mat', 5)).toEqual([
      ['Działania pisemne', 2],
      ['Ułamki zwykłe', 2],
      ['Ułamki dziesiętne', 1],
      ['Geometria', 1],
      ['Liczby i działania', 2],
    ]);
    expect(board('mat', 3)).toEqual([
      ['Dodawanie i odejmowanie', 1],
      ['Mnożenie i dzielenie', 3],
      ['Zadania z treścią', 1],
    ]);
    expect(board('pl', 3)).toEqual([
      ['Części mowy', 6],
      ['Ortografia', 1],
      ['Czytanie', 1],
    ]);
    expect(board('pl', 5)).toEqual([
      ['Gramatyka', 4],
      ['Ortografia', 3],
      ['Czytanie', 1],
    ]);
  });
});

describe('stan tematu u dziecka: teraz / biblioteka / skończony', () => {
  const NOW = '2026-10-05T10:00:00.000Z';
  const now = Date.parse(NOW);

  it('plan ma pierwszeństwo przed „skończonym”, a plan po terminie nie liczy się jako „teraz”', async () => {
    const { topicState, doneTopicIds, planTopicIds, splitDone, planExpired } = await import('../src/engine');
    const p = { plan: { topicIds: ['a', 'b'], until: '2026-10-06', setAt: NOW }, done: ['b', 'c'] };
    expect(planTopicIds(p, now)).toEqual(['a', 'b']);
    expect([...doneTopicIds(p, now)]).toEqual(['c']);
    expect(['a', 'b', 'c', 'd'].map((id) => topicState(p, id, now))).toEqual(['now', 'now', 'done', 'library']);
    expect(splitDone([{ id: 'a' }, { id: 'c' }, { id: 'd' }], p, now)).toEqual({ active: [{ id: 'a' }, { id: 'd' }], done: [{ id: 'c' }] });
    const late = { ...p, plan: { ...p.plan, until: '2026-10-04' } };
    expect(planExpired(late.plan, now)).toBe(true);
    expect(planExpired(p.plan, now)).toBe(false);
    expect(planExpired(null, now)).toBe(false);
    expect(planTopicIds(late, now)).toEqual([]);
    expect(['a', 'b', 'c'].map((id) => topicState(late, id, now))).toEqual(['library', 'done', 'done']);
    expect(topicState(undefined, 'a', now)).toBe('library');
  });

  it('zmiana stanu: „teraz” dopisuje do planu, „skończony” wyjmuje z planu, pusty plan znika', async () => {
    const { setTopicState } = await import('../src/engine');
    // Bez planu: „teraz” zakłada plan bez terminu.
    const a = setTopicState({ done: ['x'] }, ['x', 'y'], 'now', NOW);
    expect(a.plan).toEqual({ topicIds: ['x', 'y'], setAt: NOW });
    expect(a.planAt).toBe(NOW);
    expect(a.done).toEqual([]);
    // Aktualny plan: temat dopisany, nazwa i termin zostają.
    const plan = { topicIds: ['x'], until: '2026-10-09', title: 'Kartkówka', setAt: '2026-10-01T08:00:00.000Z' };
    const b = setTopicState({ plan, planAt: plan.setAt }, ['y'], 'now', NOW);
    expect(b.plan).toEqual({ ...plan, topicIds: ['x', 'y'] });
    expect(b.planAt).toBe(NOW);
    // Nic się nie zmienia, gdy temat już jest w planie.
    expect(setTopicState({ plan, planAt: plan.setAt }, ['x'], 'now', NOW).planAt).toBe(plan.setAt);
    // Plan po terminie jest zastępowany nowym.
    const c = setTopicState({ plan: { ...plan, until: '2026-10-02' } }, ['z'], 'now', NOW);
    expect(c.plan).toEqual({ topicIds: ['z'], setAt: NOW });
    // „Skończony” wyjmuje z planu; ostatni temat = plan znika.
    const d = setTopicState({ plan: { ...plan, topicIds: ['x', 'y'] }, planAt: plan.setAt, done: ['q'] }, ['x'], 'done', NOW);
    expect(d.plan?.topicIds).toEqual(['y']);
    expect(d.done).toEqual(['q', 'x']);
    const e = setTopicState({ plan, planAt: plan.setAt }, ['x'], 'done', NOW);
    expect(e.plan).toBeNull();
    expect(e.planAt).toBe(NOW);
    // „Biblioteka” przywraca temat na planszę i nie rusza planu, w którym go nie było.
    const f = setTopicState({ plan, planAt: plan.setAt, done: ['q', 'r'] }, ['q'], 'library', NOW);
    expect(f.done).toEqual(['r']);
    expect(f.plan).toEqual(plan);
    expect(f.planAt).toBe(plan.setAt);
    // Znacznik zmiany listy „skończonych” rusza się tylko wtedy, gdy lista naprawdę się zmieniła.
    expect(f.doneAt).toBe(NOW);
    expect(setTopicState({ done: ['q'], doneAt: 'dawno' }, ['x'], 'library', NOW).doneAt).toBe('dawno');
    expect(d.doneAt).toBe(NOW);
    const { doneWithoutPlan } = await import('../src/engine');
    expect(doneWithoutPlan({ done: ['a', 'b'], doneAt: 'dawno' }, ['b'], NOW)).toEqual({ done: ['a'], doneAt: NOW });
    expect(doneWithoutPlan({ done: ['a'], doneAt: 'dawno' }, ['b'], NOW)).toEqual({ done: ['a'], doneAt: 'dawno' });
    expect(doneWithoutPlan({}, ['b'], NOW)).toEqual({ done: undefined, doneAt: undefined });
  });

  it('skończony temat nie jest polecany, ale zostaje w powtórce', async () => {
    const { splitDone, reviewCount } = await import('../src/engine');
    const mat5 = topics.filter((t) => t.subject === 'mat' && t.grades?.includes(5)).sort((a, b) => a.order - b.order);
    const profile = { done: [mat5[0].id] };
    const p0 = progress([], [], '2026-10-01T10:00:00');
    const { active, done } = splitDone(mat5, profile, now);
    expect(done.map((t) => t.id)).toEqual([mat5[0].id]);
    expect(suggestTopic(mat5, p0)!.id).toBe(mat5[0].id);
    expect(suggestTopic(active, p0)!.id).toBe(mat5[1].id);
    // Odpowiedzi z skończonego tematu nadal wracają w powtórce (liczymy po wszystkich tematach osoby).
    const t0 = mat5[0];
    const p1 = progress([att(t0, 0, true, '2026-10-01T10:00:00'), att(t0, 1, true, '2026-10-01T10:01:00')], [], '2026-10-03T10:00:00');
    expect(reviewCount(mat5, p1)).toBe(2);
    expect(reviewCount(active, p1)).toBe(0);
  });

  it('„ostatnio ćwiczone”: ostatnia sesja z 3 dni — także trening z nowymi liczbami wskazuje swój temat', async () => {
    const { recentTopicId } = await import('../src/engine');
    const { trainerTopicIds, TOPIC_TRAINERS, GENERATORS, trainersFor } = await import('../src/content/generators');
    const s = (id: string, startedAt: string, mode: Session['mode'], topicId: string | null, genId?: string): Session => ({
      id,
      profileId: P,
      topicId,
      mode,
      genId,
      startedAt,
      endedAt: startedAt,
      activeSeconds: 120,
      answered: 5,
      correct: 4,
      completed: true,
    });
    const base = { profileId: P, now, trainerTopics: trainerTopicIds, allowed: () => true };
    const sessions = [
      s('1', '2026-10-03T08:00:00.000Z', 'topic', 'b-m5-ulamki'),
      s('2', '2026-10-04T18:00:00.000Z', 'gen', 'gen:dzp1r', 'dzp1r'),
      s('3', '2026-10-04T19:00:00.000Z', 'sprint', null, 'mul'),
      s('4', '2026-09-20T08:00:00.000Z', 'topic', 'b-m5-dziesietne'),
    ];
    expect(recentTopicId({ ...base, sessions })).toBe('b-m5-dzp-reszta');
    // Temat spoza planszy (np. skończony) pomijamy i bierzemy wcześniejszą sesję.
    expect(recentTopicId({ ...base, sessions, allowed: (id) => id !== 'b-m5-dzp-reszta' })).toBe('b-m5-ulamki');
    // Starsze niż 3 dni się nie liczą; cudze sesje też nie.
    expect(recentTopicId({ ...base, sessions: [sessions[3]] })).toBeNull();
    expect(recentTopicId({ ...base, profileId: 'ktoś', sessions })).toBeNull();
    expect(recentTopicId({ ...base, sessions, since: '2026-10-04T20:00:00.000Z' })).toBeNull();

    // Treningi przypięte do tematów: temat i generator istnieją, a klasy się pokrywają.
    for (const [topicId, gens] of Object.entries(TOPIC_TRAINERS)) {
      const t = topics.find((x) => x.id === topicId);
      expect(t, topicId).toBeTruthy();
      for (const g of gens) {
        const gen = GENERATORS.find((x) => x.id === g);
        expect(gen, g).toBeTruthy();
        expect(t!.grades!.some((gr) => gen!.grades.includes(gr)), `${topicId} → ${g}`).toBe(true);
      }
    }
    expect(trainersFor('b-m5-dzp-bez', 5).map((g) => g.id)).toEqual(['dzp1', 'dzp2', 'mnp']);
    expect(trainersFor('b-m5-dzp-bez', 5).filter((g) => g.aux).map((g) => g.id)).toEqual(['mnp']);
    expect(trainersFor('b-m5-dzp-bez', 3)).toEqual([]);
    expect(trainersFor('b-rzeczownik', 3)).toEqual([]);
  });
});

describe('zgłoszenia błędów w zadaniach', () => {
  const rep = (id: string, exerciseId: string, at: string): ExerciseReport => ({ id, topicId: 'b-rzeczownik', exerciseId, reason: 'mine', topic: 'Rzeczownik', question: 'Pytanie', correct: 'Odpowiedź', at });

  it('to samo zadanie czekające na decyzję nie jest zgłaszane drugi raz; po decyzji można zgłosić ponownie', () => {
    let p: { reports?: ExerciseReport[] } = {};
    p = addReport(p, rep('r1', 'e1', '2026-10-03T08:00:00.000Z'));
    p = addReport(p, rep('r2', 'e1', '2026-10-03T08:05:00.000Z'));
    p = addReport(p, rep('r3', 'e2', '2026-10-03T08:10:00.000Z'));
    expect(p.reports?.map((r) => r.id)).toEqual(['r1', 'r3']);
    expect(isReported(p, 'b-rzeczownik', 'e1')).toBe(true);
    expect(isReported(p, 'b-rzeczownik', 'e9')).toBe(false);
    // Najnowsze zgłoszenie jest na górze listy rodzica.
    expect(openReports(p).map((r) => r.id)).toEqual(['r3', 'r1']);

    p = decideReports(p, { ids: ['r1'] }, 'ok', '2026-10-03T09:00:00.000Z')!;
    expect(openReports(p).map((r) => r.id)).toEqual(['r3']);
    expect(isReported(p, 'b-rzeczownik', 'e1')).toBe(false);
    p = addReport(p, rep('r4', 'e1', '2026-10-04T08:00:00.000Z'));
    expect(openReports(p).map((r) => r.id)).toEqual(['r4', 'r3']);
  });

  it('wyłączenie zadania zamyka wszystkie jego zgłoszenia, a włączenie zmienia decyzję na „dobre”', () => {
    const p = { reports: [rep('r1', 'e1', '2026-10-03T08:00:00.000Z'), rep('r2', 'e2', '2026-10-03T08:10:00.000Z')] };
    const off = decideReports(p, { exerciseId: 'e1' }, 'off', '2026-10-03T09:00:00.000Z')!;
    expect(off.reports?.map((r) => r.decision)).toEqual(['off', undefined]);
    // Nic do zmiany = brak zapisu (nie robimy pustych zmian w profilu).
    expect(decideReports(off, { exerciseId: 'e1' }, 'off', '2026-10-03T09:30:00.000Z')).toBeNull();
    expect(decideReports(off, { exerciseId: 'e2', from: 'off' }, 'ok', '2026-10-03T09:30:00.000Z')).toBeNull();
    const on = decideReports(off, { exerciseId: 'e1', from: 'off' }, 'ok', '2026-10-03T10:00:00.000Z')!;
    expect(on.reports?.map((r) => [r.decision, r.decidedAt])).toEqual([
      ['ok', '2026-10-03T10:00:00.000Z'],
      [undefined, undefined],
    ]);
  });

  it('wyłączone zadania znikają z tematów, a temat bez wyłączonych zadań zostaje tym samym obiektem', () => {
    const [a, b] = topics;
    const id = a.exercises[0].id;
    const out = withoutDisabled(topics, [id]);
    expect(out.find((t) => t.id === a.id)!.exercises.map((e) => e.id)).not.toContain(id);
    expect(out.find((t) => t.id === a.id)!.exercises.length).toBe(a.exercises.filter((e) => e.id !== id).length);
    if (!b.exercises.some((e) => e.id === id)) expect(out.find((t) => t.id === b.id)).toBe(b);
    expect(withoutDisabled(topics, [])).toBe(topics);
    expect(withoutDisabled(topics, undefined)).toBe(topics);
  });

  it('zadań losowanych (trening bez końca) nie da się wyłączyć', () => {
    expect(isGeneratedTopic('gen:dzp1')).toBe(true);
    expect(isGeneratedTopic('b-m5-dzp-bez')).toBe(false);
  });
});

describe('kartkówki od rodzica', () => {

  it('wynik kartkówki to pierwsze ukończone podejście z jej identyfikatorem', async () => {
    const { quizStates } = await import('../src/engine');
    const quiz = { id: 'q1', title: 'Rzeczownik', topicIds: [noun.id], count: 5, createdAt: '2026-10-01T08:00:00' };
    const run = (id: string, at: string, good: number, quizId?: string, completed = true): { a: Attempt[]; s: Session } => ({
      a: Array.from({ length: 5 }, (_, i) => att(noun, i, i < good, at, id)),
      s: { id, profileId: P, topicId: null, mode: 'test', topicIds: [noun.id], ...(quizId ? { quizId } : {}), startedAt: at, endedAt: at, activeSeconds: 100, answered: 5, correct: good, completed },
    });
    expect(quizStates([quiz], progress([], [], '2026-10-02T10:00:00'))[0].result).toBeNull();
    expect(quizStates(undefined, progress([], [], '2026-10-02T10:00:00'))).toEqual([]);

    // Zwykły sprawdzian z tego samego tematu i przerwana kartkówka nie liczą się jako wynik.
    const other = run('s1', '2026-10-02T10:00:00', 5);
    const aborted = run('s2', '2026-10-02T11:00:00', 2, 'q1', false);
    expect(quizStates([quiz], progress([...other.a, ...aborted.a], [other.s, aborted.s], '2026-10-02T12:00:00'))[0].result).toBeNull();

    const done = run('s3', '2026-10-02T13:00:00', 4, 'q1');
    const later = run('s4', '2026-10-03T13:00:00', 5, 'q1');
    const st = quizStates([quiz], progress([...done.a, ...later.a], [done.s, later.s], '2026-10-03T14:00:00'))[0];
    expect(st.result).toMatchObject({ sessionId: 's3', correct: 4, total: 5, grade: 4, quizId: 'q1' });
  });
});

describe('błędy z jednej sesji', () => {
  it('liczy się pierwsza odpowiedź w sesji; poprawka po błędzie i inne sesje nie zmieniają listy', async () => {
    const { sessionMistakes } = await import('../src/engine');
    const wrong = (i: number, at: string, answer: string, sessionId = 'q', retry = false): Attempt => ({ ...att(noun, i, false, at, sessionId, retry), answer });
    const attempts: Attempt[] = [
      att(noun, 0, true, '2026-10-02T10:00:00', 'q'),
      wrong(2, '2026-10-02T10:02:00', 'biega'),
      wrong(1, '2026-10-02T10:01:00', 'skacze'),
      // Druga próba tego samego zadania (dobra) nie usuwa błędu z listy — to nadal pytanie, w którym była pomyłka.
      att(noun, 1, true, '2026-10-02T10:03:00', 'q', true),
      // Dobra pierwsza odpowiedź, a potem zła powtórka w tej samej sesji — to nie błąd sprawdzianu.
      att(noun, 3, true, '2026-10-02T10:04:00', 'q'),
      wrong(3, '2026-10-02T10:05:00', 'x', 'q', true),
      // Inna sesja.
      wrong(4, '2026-10-02T11:00:00', 'y', 'inna'),
    ];
    expect(sessionMistakes('q', attempts)).toEqual([
      { topicId: noun.id, exerciseId: noun.exercises[1].id, answer: 'skacze' },
      { topicId: noun.id, exerciseId: noun.exercises[2].id, answer: 'biega' },
    ]);
    expect(sessionMistakes('inna', attempts)).toHaveLength(1);
    expect(sessionMistakes('brak', attempts)).toEqual([]);
  });
});

describe('tryb nauki w postępach', () => {
  it('pierwsze przejście lekcji daje monety i dzień nauki; powtórka lekcji już nie', async () => {
    const { LESSON_COINS } = await import('../src/engine');
    const learn = (id: string, at: string, topicId: string, completed = true): Session => ({ id, profileId: P, topicId, mode: 'learn', startedAt: at, endedAt: at, activeSeconds: 120, answered: 0, correct: 0, completed });
    const none = progress([], [learn('l0', '2026-10-01T10:00:00', noun.id, false)], '2026-10-01T12:00:00');
    expect(none.lessonsDone.size).toBe(0);
    expect(none.coins).toBe(0);

    const p = progress([], [learn('l1', '2026-10-01T10:00:00', noun.id), learn('l2', '2026-10-01T11:00:00', noun.id), learn('l3', '2026-10-02T10:00:00', noun.id)], '2026-10-02T12:00:00');
    expect([...p.lessonsDone]).toEqual([noun.id]);
    expect(p.coins).toBe(LESSON_COINS);
    // Czas czytania liczy się do czasu nauki, ale lekcja nie jest „ukończonym ćwiczeniem”.
    expect(p.totalSeconds).toBe(360);
    expect(p.sessionsCompleted).toBe(0);
    // Dzień pierwszej lekcji jest dniem nauki; samo ponowne czytanie następnego dnia serii nie przedłuża.
    expect(p.activeDays.has('2026-10-01')).toBe(true);
    expect(p.activeDays.has('2026-10-02')).toBe(false);
  });
});

