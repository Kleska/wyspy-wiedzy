import { plural } from './themes';
import type { Attempt, Exercise, ExerciseType, FamilyGoal, ParsedTopic, Redemption, Session, SessionMode, Settings } from './types';

/*
 * Cały postęp (XP, monety, poziom, seria dni, poziomy tematów, odznaki, cele tygodnia) jest
 * WYLICZANY z dziennika odpowiedzi, sesji i zakupów. Dzięki temu synchronizacja między
 * urządzeniami nie ma konfliktów — urządzenia tylko dopisują zdarzenia.
 */

export const BOX_DAYS = [0, 1, 2, 4, 7, 14];
export const MASTER_BOX = 4;
/** Pudełko po dobrej odpowiedzi na NOWE zadanie w sprawdzianie / teście na start (zamiast 1). */
export const EXAM_BOX = 2;

/** Zamrożenie serii (jak w Duolingo): ratuje serię w dzień bez nauki. */
export const FREEZE_ID = 'freeze';
export const FREEZE_COST = 50;
export const FREEZE_MAX = 2;

/** Kamienie milowe serii: [dni, premia w monetach]. */
export const STREAK_MILESTONES: [number, number][] = [
  [3, 10],
  [7, 25],
  [14, 40],
  [30, 75],
  [50, 100],
  [100, 200],
];

/** Cel tygodnia: dni nauki + tematy na wyższym poziomie. */
export const WEEK_DAYS_TARGET = 4;
export const WEEK_LEVELUPS_TARGET = 2;
export const WEEK_BONUS = 50;

/** Błyskawica: 60 sekund; monety za ukończenie tylko 3 razy dziennie, premia za rekord. */
export const SPRINT_SECONDS = 60;
export const SPRINT_PAID_PER_DAY = 3;
export const SPRINT_RECORD_BONUS = 10;

/** Poziomy tematu (jak w Khan Academy) — mogą też spaść, gdy dziecko zapomina. */
export const LEVEL_NAMES = ['Nowy', 'Próbowany', 'Znany', 'Biegły', 'Opanowany'] as const;
export type TopicLevel = 0 | 1 | 2 | 3 | 4;

export function levelFromMastery(mastery: number, touched: boolean): TopicLevel {
  if (mastery >= 0.85) return 4;
  if (mastery >= 0.5) return 3;
  if (mastery >= 0.25) return 2;
  return touched ? 1 : 0;
}

export interface ItemState {
  box: number;
  due: number;
  seen: number;
  right: number;
  wrong: number;
  last: number;
  /** Zadanie „zaliczone” testem (dziecko go nie widziało, ale dobrze poszedł mu cały temat). */
  virtual?: boolean;
}

export interface TopicStats {
  topicId: string;
  total: number;
  seen: number;
  mastered: number;
  mastery: number;
  level: TopicLevel;
  stars: 0 | 1 | 2 | 3;
  /** Temat zaliczony testem na start lub sprawdzianem. */
  placed: boolean;
  answered: number;
  correct: number;
  accuracy: number | null;
  lastAt: number | null;
  dueCount: number;
  newCount: number;
  weak: { exerciseId: string; wrong: number; right: number }[];
}

export interface DayStats {
  date: string;
  seconds: number;
  answered: number;
  correct: number;
  sessionsCompleted: number;
  goodSession: boolean;
}

export interface Quest {
  id: 'answers' | 'minutes' | 'good';
  title: string;
  progress: number;
  target: number;
  done: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  progress: number;
}

export interface LevelUp {
  at: number;
  topicId: string;
  to: TopicLevel;
}

export interface WeekGoal {
  /** Poniedziałek tygodnia (RRRR-MM-DD). */
  start: string;
  days: number;
  daysTarget: number;
  levelUps: number;
  levelUpsTarget: number;
  done: boolean;
}

export interface ExamResult {
  sessionId: string;
  mode: 'test' | 'diagnostic';
  at: number;
  topicIds: string[];
  correct: number;
  total: number;
  grade: number;
}

export interface Progress {
  xp: number;
  level: number;
  levelFloor: number;
  levelNext: number;
  coinsEarned: number;
  coinsSpent: number;
  coins: number;
  streak: number;
  bestStreak: number;
  /** Zamrożenia serii w zapasie. */
  freezes: number;
  /** Dni uratowane zamrożeniem. */
  frozenDays: Set<string>;
  /** Dni z nauką (liczą się do serii). */
  activeDays: Set<string>;
  activeToday: boolean;
  /** Seria trwa, ale dziś jeszcze nie było nauki. */
  streakAtRisk: boolean;
  totalAnswered: number;
  totalCorrect: number;
  totalSeconds: number;
  sessionsCompleted: number;
  items: Map<string, ItemState>;
  topics: Map<string, TopicStats>;
  days: Map<string, DayStats>;
  today: DayStats;
  quests: Quest[];
  chestOpen: boolean;
  week: WeekGoal;
  weeksDone: number;
  levelUps: LevelUp[];
  exams: ExamResult[];
  sprintBest: Map<string, number>;
  /** Pary na czas: najlepszy (najkrótszy) czas w ms. */
  pairsBest: Map<string, number>;
  badges: Badge[];
  pendingRewards: number;
}

export const itemKey = (topicId: string, exerciseId: string) => `${topicId}|${exerciseId}`;

export function dateKey(t: number | string | Date): string {
  const d = new Date(t);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${d.getFullYear()}-${m < 10 ? '0' : ''}${m}-${day < 10 ? '0' : ''}${day}`;
}

export function startOfDay(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function addDays(t: number, days: number): number {
  const d = new Date(t);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

/** Poniedziałek tygodnia, w którym jest chwila t (północ czasu lokalnego). */
export function weekStart(t: number): number {
  const d = new Date(startOfDay(t));
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
}

const noonOf = (dk: string) => Date.parse(dk + 'T12:00:00');
const weekOf = (dk: string) => dateKey(weekStart(noonOf(dk)));

export function xpForLevel(level: number): number {
  return 50 * level * (level - 1);
}

export function levelFromXp(xp: number): number {
  let l = 1;
  while (xpForLevel(l + 1) <= xp) l++;
  return l;
}

function emptyDay(date: string): DayStats {
  return { date, seconds: 0, answered: 0, correct: 0, sessionsCompleted: 0, goodSession: false };
}

export function questsFor(day: DayStats, goalMinutes: number): Quest[] {
  return [
    { id: 'answers', title: 'Odpowiedz na 20 pytań', progress: Math.min(day.answered, 20), target: 20, done: day.answered >= 20 },
    {
      id: 'minutes',
      title: `Ćwicz ${goalMinutes} ${plural(goalMinutes, ['minutę', 'minuty', 'minut'])}`,
      progress: Math.min(Math.floor(day.seconds / 60), goalMinutes),
      target: goalMinutes,
      done: day.seconds >= goalMinutes * 60,
    },
    { id: 'good', title: 'Skończ ćwiczenie z wynikiem 80%', progress: day.goodSession ? 1 : 0, target: 1, done: day.goodSession },
  ];
}

// ─── Oceny szkolne ───────────────────────────────────────────────────────────

/** Skala procentowa używana w wielu szkołach podstawowych. */
export function schoolGrade(correct: number, total: number): number {
  if (!total) return 1;
  const p = (correct / total) * 100;
  return p >= 96 ? 6 : p >= 85 ? 5 : p >= 70 ? 4 : p >= 50 ? 3 : p >= 30 ? 2 : 1;
}

export const GRADE_NAMES: Record<number, string> = {
  1: 'niedostateczny',
  2: 'dopuszczający',
  3: 'dostateczny',
  4: 'dobry',
  5: 'bardzo dobry',
  6: 'celujący',
};

export const GRADE_SCALE = '96% — 6 · 85% — 5 · 70% — 4 · 50% — 3 · 30% — 2';

// ─── Główne wyliczenie ───────────────────────────────────────────────────────

export interface ProgressInput {
  profileId: string;
  attempts: Attempt[];
  sessions: Session[];
  redemptions: Redemption[];
  topics: ParsedTopic[];
  settings: Settings;
  now: number;
  /** Liczyć tylko zdarzenia od tej chwili (wyzerowanie postępów). */
  since?: string;
}

const byAt = (a: { at: string }, b: { at: string }) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0);
const isExamMode = (m: SessionMode | undefined): m is 'test' | 'diagnostic' => m === 'test' || m === 'diagnostic';

/** Temat zaliczony testem: co najmniej 3 odpowiedzi z tego tematu i 80% dobrych. */
export const PLACE_MIN = 3;
export const PLACE_RATIO = 0.8;

export function computeProgress(input: ProgressInput): Progress {
  const { profileId, settings, now } = input;
  const since = input.since ?? '';
  const attempts = input.attempts.filter((a) => a.profileId === profileId && a.at >= since).sort(byAt);
  const sessions = input.sessions
    .filter((s) => s.profileId === profileId && s.startedAt >= since)
    .sort((a, b) => (a.startedAt < b.startedAt ? -1 : a.startedAt > b.startedAt ? 1 : 0));
  const redemptions = input.redemptions.filter((r) => r.profileId === profileId && r.at >= since);
  const modeOf = new Map(sessions.map((s) => [s.id, s.mode]));

  // Aktualne zadania tematów (po edycji tematu stare zadania przestają się liczyć do poziomu).
  const topicOf = new Map<string, string>();
  const totals = new Map<string, number>();
  for (const tp of input.topics) {
    totals.set(tp.id, tp.exercises.length);
    for (const ex of tp.exercises) topicOf.set(itemKey(tp.id, ex.id), tp.id);
  }

  const items = new Map<string, ItemState>();
  const days = new Map<string, DayStats>();
  const day = (k: string) => {
    let d = days.get(k);
    if (!d) days.set(k, (d = emptyDay(k)));
    return d;
  };

  // Poziomy tematów liczone na bieżąco — żeby wiedzieć, KIEDY temat wszedł na wyższy poziom.
  const tsum = new Map<string, number>();
  const maxLevel = new Map<string, TopicLevel>();
  const levelUps: LevelUp[] = [];
  const contrib = (box: number | undefined) => (box === undefined ? 0 : Math.min(box, MASTER_BOX) / MASTER_BOX);
  const track = (key: string, oldBox: number | undefined, newBox: number, t: number) => {
    const tid = topicOf.get(key);
    if (!tid) return;
    const sum = (tsum.get(tid) ?? 0) - contrib(oldBox) + contrib(newBox);
    tsum.set(tid, sum);
    const total = totals.get(tid) ?? 0;
    const lvl = levelFromMastery(total ? sum / total + 1e-9 : 0, true);
    if (lvl > (maxLevel.get(tid) ?? 0)) {
      maxLevel.set(tid, lvl);
      if (lvl >= 2) levelUps.push({ at: t, topicId: tid, to: lvl });
    }
  };

  let xp = 0;
  let coinsEarned = 0;
  let totalAnswered = 0;
  let totalCorrect = 0;
  const combo = new Map<string, number>();
  const perSession = new Map<string, { first: number; firstCorrect: number }>();
  const perSessionTopic = new Map<string, { n: number; ok: number }>();
  const placedTopics = new Set<string>();

  // Zaliczenie tematów po zakończonym sprawdzianie / teście na start.
  const placements = sessions
    .filter((s) => isExamMode(s.mode) && s.completed && s.endedAt)
    .map((s) => ({ s, t: Date.parse(s.endedAt!) }))
    .sort((a, b) => a.t - b.t);
  let pi = 0;
  const place = (s: Session, t: number) => {
    for (const tp of input.topics) {
      const c = perSessionTopic.get(`${s.id}|${tp.id}`);
      if (!c || c.n < PLACE_MIN || c.ok / c.n < PLACE_RATIO) continue;
      placedTopics.add(tp.id);
      for (const ex of tp.exercises) {
        const key = itemKey(tp.id, ex.id);
        if (items.has(key)) continue;
        items.set(key, { box: EXAM_BOX, due: Infinity, seen: 0, right: 0, wrong: 0, last: t, virtual: true });
        track(key, undefined, EXAM_BOX, t);
      }
    }
  };

  for (const a of attempts) {
    const t = Date.parse(a.at);
    while (pi < placements.length && placements[pi].t <= t) {
      place(placements[pi].s, placements[pi].t);
      pi++;
    }
    const mode = modeOf.get(a.sessionId);
    const exam = isExamMode(mode);
    const dk = dateKey(t);
    const d = day(dk);
    d.answered++;
    totalAnswered++;
    if (a.correct) {
      d.correct++;
      totalCorrect++;
    }

    // XP i monety
    if (mode === 'sprint') {
      if (a.correct) xp += 5;
    } else {
      const c = combo.get(a.sessionId) ?? 0;
      if (a.correct && !a.retry) {
        const nc = c + 1;
        combo.set(a.sessionId, nc);
        xp += a.hint ? 5 : 10;
        if (nc >= 3) xp += 2;
        coinsEarned += 1;
      } else if (a.correct) {
        xp += 5;
      } else {
        combo.set(a.sessionId, 0);
        xp += 1;
      }
    }

    if (!a.retry) {
      const ps = perSession.get(a.sessionId) ?? { first: 0, firstCorrect: 0 };
      ps.first++;
      if (a.correct) ps.firstCorrect++;
      perSession.set(a.sessionId, ps);
      if (exam) {
        const k = `${a.sessionId}|${a.topicId}`;
        const c = perSessionTopic.get(k) ?? { n: 0, ok: 0 };
        c.n++;
        if (a.correct) c.ok++;
        perSessionTopic.set(k, c);
      }
    }

    // Powtórki rozłożone w czasie (system pudełek Leitnera)
    if (a.retry || a.topicId.startsWith('gen:')) continue;
    const key = itemKey(a.topicId, a.exerciseId);
    const old = items.get(key);
    const st: ItemState = old ? { ...old, virtual: false } : { box: 0, due: 0, seen: 0, right: 0, wrong: 0, last: 0 };
    if (old?.virtual) st.due = 0;
    st.seen++;
    st.last = t;
    if (a.correct) {
      st.right++;
      if (exam && !old) {
        st.box = EXAM_BOX;
        st.due = addDays(startOfDay(t), BOX_DAYS[EXAM_BOX]);
      } else if (t >= st.due) {
        st.box = Math.min(BOX_DAYS.length - 1, st.box + 1);
        st.due = addDays(startOfDay(t), BOX_DAYS[st.box]);
      }
    } else {
      st.wrong++;
      st.box = st.box >= 3 ? 1 : 0;
      st.due = t;
    }
    items.set(key, st);
    track(key, old?.box, st.box, t);
  }
  while (pi < placements.length) {
    place(placements[pi].s, placements[pi].t);
    pi++;
  }

  // Sesje: czas, ukończenia, Błyskawica, sprawdziany
  let totalSeconds = 0;
  let sessionsCompleted = 0;
  const activeDays = new Set<string>();
  const sprintPaid = new Map<string, number>();
  const sprintBest = new Map<string, number>();
  const pairsBest = new Map<string, number>();
  const exams: ExamResult[] = [];
  for (const s of sessions) {
    const t = Date.parse(s.startedAt);
    const dk = dateKey(t);
    const d = day(dk);
    d.seconds += s.activeSeconds;
    totalSeconds += s.activeSeconds;
    if (!s.completed) continue;
    d.sessionsCompleted++;
    sessionsCompleted++;
    if (s.mode === 'sprint' || s.mode === 'pairs') {
      // Minigry: monety za ukończenie tylko kilka razy dziennie (osobno dla każdej gry), premia za rekord.
      const pk = `${s.mode}|${dk}`;
      const n = sprintPaid.get(pk) ?? 0;
      if (n < SPRINT_PAID_PER_DAY) {
        coinsEarned += 5;
        sprintPaid.set(pk, n + 1);
      }
      const key = s.genId ?? s.mode;
      if (s.mode === 'sprint' && s.correct > (sprintBest.get(key) ?? 0)) {
        if (s.correct >= 5) coinsEarned += SPRINT_RECORD_BONUS;
        sprintBest.set(key, s.correct);
      }
      if (s.mode === 'pairs' && s.durationMs && s.durationMs < (pairsBest.get(key) ?? Infinity)) {
        coinsEarned += SPRINT_RECORD_BONUS;
        pairsBest.set(key, s.durationMs);
      }
      continue;
    }
    coinsEarned += 5;
    activeDays.add(dk);
    const ps = perSession.get(s.id);
    if (ps && ps.first >= 5 && ps.firstCorrect / ps.first >= 0.8) {
      d.goodSession = true;
      coinsEarned += 5;
    }
    if (isExamMode(s.mode) && ps && ps.first > 0) {
      exams.push({
        sessionId: s.id,
        mode: s.mode,
        at: Date.parse(s.endedAt ?? s.startedAt),
        topicIds: s.topicIds ?? (s.topicId ? [s.topicId] : []),
        correct: ps.firstCorrect,
        total: ps.first,
        grade: schoolGrade(ps.firstCorrect, ps.first),
      });
    }
  }
  for (const d of days.values()) {
    if (d.answered >= 10) activeDays.add(d.date);
    if (questsFor(d, settings.dailyGoalMinutes).every((q) => q.done)) coinsEarned += 20;
  }

  // Seria dni z zamrożeniami: zamrożenie ratuje dzień bez nauki (dzień nie dolicza się do serii).
  const todayKey = dateKey(now);
  const freezeBuys = redemptions
    .filter((r) => r.rewardId === FREEZE_ID && r.status !== 'rejected')
    .map((r) => dateKey(Date.parse(r.at)))
    .sort();
  const frozenDays = new Set<string>();
  let freezes = 0;
  let run = 0;
  let bestStreak = 0;
  const first = [...activeDays, ...freezeBuys].sort()[0];
  if (first && first <= todayKey) {
    let bi = 0;
    for (let c = noonOf(first); ; c = addDays(c, 1)) {
      const dk = dateKey(c);
      while (bi < freezeBuys.length && freezeBuys[bi] <= dk) {
        freezes = Math.min(FREEZE_MAX, freezes + 1);
        bi++;
      }
      if (activeDays.has(dk)) {
        run++;
        bestStreak = Math.max(bestStreak, run);
      } else if (dk === todayKey) {
        // dzień jeszcze trwa
      } else if (run > 0 && freezes > 0) {
        freezes--;
        frozenDays.add(dk);
      } else {
        run = 0;
      }
      if (dk >= todayKey) break;
    }
  }
  const streak = run;
  const activeToday = activeDays.has(todayKey);
  for (const [n, bonus] of STREAK_MILESTONES) if (bestStreak >= n) coinsEarned += bonus;

  // Cel tygodnia
  const weeks = new Map<string, { days: number; levelUps: number }>();
  const wk = (k: string) => {
    let w = weeks.get(k);
    if (!w) weeks.set(k, (w = { days: 0, levelUps: 0 }));
    return w;
  };
  for (const dk of activeDays) wk(weekOf(dk)).days++;
  for (const lu of levelUps) wk(weekOf(dateKey(lu.at))).levelUps++;
  let weeksDone = 0;
  for (const w of weeks.values()) {
    if (w.days >= WEEK_DAYS_TARGET && w.levelUps >= WEEK_LEVELUPS_TARGET) {
      weeksDone++;
      coinsEarned += WEEK_BONUS;
    }
  }
  const thisWeekKey = weekOf(todayKey);
  const tw = weeks.get(thisWeekKey) ?? { days: 0, levelUps: 0 };
  const week: WeekGoal = {
    start: thisWeekKey,
    days: tw.days,
    daysTarget: WEEK_DAYS_TARGET,
    levelUps: tw.levelUps,
    levelUpsTarget: WEEK_LEVELUPS_TARGET,
    done: tw.days >= WEEK_DAYS_TARGET && tw.levelUps >= WEEK_LEVELUPS_TARGET,
  };

  const level = levelFromXp(xp);
  coinsEarned += 10 * (level - 1);
  const coinsSpent = redemptions.filter((r) => r.status !== 'rejected').reduce((s, r) => s + r.cost, 0);

  // Tematy
  const topics = new Map<string, TopicStats>();
  for (const tp of input.topics) {
    let masterySum = 0;
    let seen = 0;
    let withState = 0;
    let mastered = 0;
    let dueCount = 0;
    let answered = 0;
    let correct = 0;
    let lastAt: number | null = null;
    let placed = placedTopics.has(tp.id);
    const weak: TopicStats['weak'] = [];
    for (const ex of tp.exercises) {
      const st = items.get(itemKey(tp.id, ex.id));
      if (!st) continue;
      withState++;
      masterySum += contrib(st.box);
      if (st.box >= MASTER_BOX) mastered++;
      if (st.virtual) {
        placed = true;
        continue;
      }
      seen++;
      if (st.due <= now) dueCount++;
      answered += st.right + st.wrong;
      correct += st.right;
      lastAt = Math.max(lastAt ?? 0, st.last);
      if (st.wrong > 0) weak.push({ exerciseId: ex.id, wrong: st.wrong, right: st.right });
    }
    const total = tp.exercises.length;
    const mastery = total ? masterySum / total : 0;
    const lvl = levelFromMastery(mastery + 1e-9, withState > 0);
    weak.sort((a, b) => b.wrong - a.wrong || a.right - b.right);
    topics.set(tp.id, {
      topicId: tp.id,
      total,
      seen,
      mastered,
      mastery,
      level: lvl,
      stars: Math.max(0, lvl - 1) as TopicStats['stars'],
      placed,
      answered,
      correct,
      accuracy: answered ? correct / answered : null,
      lastAt,
      dueCount,
      newCount: total - withState,
      weak: weak.slice(0, 8),
    });
  }

  const today = days.get(todayKey) ?? emptyDay(todayKey);
  const quests = questsFor(today, settings.dailyGoalMinutes);

  const badges = computeBadges({
    level,
    bestStreak,
    totalCorrect,
    totalSeconds,
    sessionsCompleted,
    topics,
    perSession,
    exams,
    weeksDone,
    sprintBest,
  });

  return {
    xp,
    level,
    levelFloor: xpForLevel(level),
    levelNext: xpForLevel(level + 1),
    coinsEarned,
    coinsSpent,
    coins: coinsEarned - coinsSpent,
    streak,
    bestStreak,
    freezes,
    frozenDays,
    activeDays,
    activeToday,
    streakAtRisk: !activeToday && streak > 0,
    totalAnswered,
    totalCorrect,
    totalSeconds,
    sessionsCompleted,
    items,
    topics,
    days,
    today,
    quests,
    chestOpen: quests.every((q) => q.done),
    week,
    weeksDone,
    levelUps,
    exams,
    sprintBest,
    pairsBest,
    badges,
    pendingRewards: redemptions.filter((r) => r.status === 'pending').length,
  };
}

interface BadgeBase {
  level: number;
  bestStreak: number;
  totalCorrect: number;
  totalSeconds: number;
  sessionsCompleted: number;
  topics: Map<string, TopicStats>;
  perSession: Map<string, { first: number; firstCorrect: number }>;
  exams: ExamResult[];
  weeksDone: number;
  sprintBest: Map<string, number>;
}

function computeBadges(b: BadgeBase): Badge[] {
  const ratio = (v: number, t: number) => Math.min(1, v / t);
  const perfect = [...b.perSession.values()].some((s) => s.first >= 8 && s.firstCorrect === s.first);
  const stars = [...b.topics.values()].map((t) => t.stars);
  const maxStars = stars.length ? Math.max(...stars) : 0;
  const threeStar = stars.filter((s) => s >= 3).length;
  const topicsWithStar = stars.filter((s) => s >= 1).length;
  const bestGrade = Math.max(0, ...b.exams.filter((e) => e.mode === 'test' && e.total >= 8).map((e) => e.grade));
  const bestSprint = Math.max(0, ...b.sprintBest.values());
  const list: [string, string, string, number][] = [
    ['first', 'Pierwsza wyprawa', 'Skończ pierwsze ćwiczenie', ratio(b.sessionsCompleted, 1)],
    ['streak3', 'Trzy dni z rzędu', 'Ćwicz 3 dni pod rząd', ratio(b.bestStreak, 3)],
    ['streak7', 'Tydzień bez przerwy', 'Ćwicz 7 dni pod rząd', ratio(b.bestStreak, 7)],
    ['streak30', 'Miesiąc mocy', 'Ćwicz 30 dni pod rząd', ratio(b.bestStreak, 30)],
    ['perfect', 'Bez błędu', 'Skończ ćwiczenie bez żadnego błędu', perfect ? 1 : 0],
    ['correct100', 'Setka', '100 dobrych odpowiedzi', ratio(b.totalCorrect, 100)],
    ['correct500', 'Pięćset', '500 dobrych odpowiedzi', ratio(b.totalCorrect, 500)],
    ['correct1000', 'Tysiąc', '1000 dobrych odpowiedzi', ratio(b.totalCorrect, 1000)],
    ['hour', 'Pierwsza godzina', 'Ćwicz łącznie 60 minut', ratio(b.totalSeconds, 3600)],
    ['hours10', 'Dziesięć godzin', 'Ćwicz łącznie 10 godzin', ratio(b.totalSeconds, 36000)],
    ['master', 'Mistrz tematu', 'Zdobądź 3 gwiazdki w dowolnym temacie', maxStars >= 3 ? 1 : ratio(maxStars, 3)],
    ['master3', 'Potrójny mistrz', 'Zdobądź 3 gwiazdki w trzech tematach', ratio(threeStar, 3)],
    ['explorer', 'Odkrywca', 'Zdobądź gwiazdkę w 5 tematach', ratio(topicsWithStar, 5)],
    ['week', 'Cel tygodnia', 'Wykonaj cel tygodnia', ratio(b.weeksDone, 1)],
    ['week4', 'Cztery tygodnie', 'Wykonaj cel tygodnia 4 razy', ratio(b.weeksDone, 4)],
    ['test5', 'Prymus', 'Zdobądź piątkę lub szóstkę ze sprawdzianu', bestGrade >= 5 ? 1 : ratio(bestGrade, 5)],
    ['test6', 'Celujący', 'Zdobądź szóstkę ze sprawdzianu', bestGrade >= 6 ? 1 : ratio(bestGrade, 6)],
    ['sprint20', 'Błyskawica', '20 dobrych odpowiedzi w jednej Błyskawicy', ratio(bestSprint, 20)],
    ['level5', 'Poziom 5', 'Osiągnij poziom 5', ratio(b.level, 5)],
    ['level10', 'Poziom 10', 'Osiągnij poziom 10', ratio(b.level, 10)],
  ];
  return list.map(([id, title, description, progress]) => ({ id, title, description, progress, earned: progress >= 1 }));
}

// ─── Wspólny cel rodziny ─────────────────────────────────────────────────────

export function familyGoalProgress(goal: FamilyGoal, attempts: Attempt[], sessions: Session[], profileIds: string[]) {
  const ids = new Set(profileIds);
  const sprint = new Set(sessions.filter((s) => s.mode === 'sprint' || s.mode === 'pairs').map((s) => s.id));
  const per = new Map<string, number>(profileIds.map((id) => [id, 0]));
  let total = 0;
  for (const a of attempts) {
    if (!a.correct || a.retry || a.at < goal.startAt || !ids.has(a.profileId) || sprint.has(a.sessionId)) continue;
    per.set(a.profileId, (per.get(a.profileId) ?? 0) + 1);
    total++;
  }
  return { total, per, done: total >= goal.target };
}

// ─── Układanie sesji ─────────────────────────────────────────────────────────

export interface QueueItem {
  topicId: string;
  ex: Exercise;
}

export function shuffle<T>(arr: T[], rnd: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildTopicQueue(topic: ParsedTopic, progress: Progress, n: number, now: number, rnd: () => number = Math.random): QueueItem[] {
  if (topic.exercises.some((e) => e.passage)) return buildReadingQueue(topic, progress, n, now);
  const due: { ex: Exercise; st: ItemState }[] = [];
  const fresh: Exercise[] = [];
  const rest: { ex: Exercise; st: ItemState }[] = [];
  for (const ex of topic.exercises) {
    const st = progress.items.get(itemKey(topic.id, ex.id));
    if (!st || st.virtual) fresh.push(ex);
    else if (st.due <= now) due.push({ ex, st });
    else rest.push({ ex, st });
  }
  due.sort((a, b) => a.st.box - b.st.box || a.st.due - b.st.due);
  rest.sort((a, b) => a.st.last - b.st.last);

  const picked: Exercise[] = [];
  const dueQuota = fresh.length ? Math.ceil(n * 0.6) : n;
  picked.push(...due.slice(0, dueQuota).map((d) => d.ex));
  picked.push(...fresh.slice(0, n - picked.length));
  if (picked.length < n) picked.push(...due.slice(dueQuota, dueQuota + (n - picked.length)).map((d) => d.ex));
  if (picked.length < n) picked.push(...rest.slice(0, n - picked.length).map((d) => d.ex));
  return shuffle(picked, rnd).map((ex) => ({ topicId: topic.id, ex }));
}

/**
 * Czytanie ze zrozumieniem: całe teksty z ich pytaniami (w kolejności z tekstu). Najpierw teksty
 * z nowymi albo zaległymi pytaniami. Drugi tekst dokładamy tylko, gdy pierwszy ma mało pytań.
 */
export function buildReadingQueue(topic: ParsedTopic, progress: Progress, n: number, now: number): QueueItem[] {
  const groups: { key: string; exs: Exercise[]; score: number; last: number }[] = [];
  for (const ex of topic.exercises) {
    const key = ex.passage?.title ?? '';
    let g = groups.find((x) => x.key === key);
    if (!g) groups.push((g = { key, exs: [], score: 0, last: 0 }));
    g.exs.push(ex);
    const st = progress.items.get(itemKey(topic.id, ex.id));
    if (!st || st.virtual) g.score += 2;
    else if (st.due <= now) g.score += 1;
    else g.last = Math.max(g.last, st.last);
  }
  const order = groups.map((g, i) => ({ g, i })).sort((a, b) => b.g.score - a.g.score || a.g.last - b.g.last || a.i - b.i);
  const out: QueueItem[] = [];
  for (const { g } of order) {
    // Kolejny tekst tylko wtedy, gdy poprzedni miał mało pytań (lekcja nie może być za długa).
    if (out.length >= Math.ceil(n * 0.6)) break;
    out.push(...g.exs.map((ex) => ({ topicId: topic.id, ex })));
  }
  return out;
}

export function buildReviewQueue(topics: ParsedTopic[], progress: Progress, n: number, now: number, rnd: () => number = Math.random): QueueItem[] {
  const due: { item: QueueItem; st: ItemState }[] = [];
  for (const tp of topics) {
    for (const ex of tp.exercises) {
      const st = progress.items.get(itemKey(tp.id, ex.id));
      if (st && !st.virtual && st.due <= now) due.push({ item: { topicId: tp.id, ex }, st });
    }
  }
  due.sort((a, b) => a.st.box - b.st.box || a.st.due - b.st.due);
  return shuffle(due.slice(0, n).map((d) => d.item), rnd);
}

/** Sprawdzian: zadania po równo z wybranych tematów, w losowej kolejności. */
export function buildExamQueue(topics: ParsedTopic[], n: number, rnd: () => number = Math.random): QueueItem[] {
  const pools = topics.filter((t) => t.exercises.length).map((t) => shuffle(t.exercises, rnd).map((ex) => ({ topicId: t.id, ex })));
  const out: QueueItem[] = [];
  for (let round = 0; out.length < n && pools.some((p) => p.length > round); round++) {
    for (const p of pools) if (p[round] && out.length < n) out.push(p[round]);
  }
  return shuffle(out, rnd);
}

/** Do testu na start najlepiej nadają się zadania z jedną odpowiedzią. */
const QUICK_TYPES: ExerciseType[] = ['choice', 'fill', 'tap', 'dictation'];

/**
 * Test na start: po kilka zadań z każdego jeszcze nieruszonego tematu (jak test
 * diagnostyczny w IXL). Dobrze rozwiązane tematy dostają poziom „Biegły” bez ćwiczenia.
 */
export function buildDiagnosticQueue(topics: ParsedTopic[], progress: Progress, perTopic = 3, maxTopics = 8, rnd: () => number = Math.random): QueueItem[] {
  const usable = topics.filter((t) => t.exercises.length >= perTopic);
  const untouched = usable.filter((t) => (progress.topics.get(t.id)?.level ?? 0) === 0);
  const chosen = (untouched.length >= 2 ? untouched : usable).slice(0, maxTopics);
  const out: QueueItem[] = [];
  for (const t of chosen) {
    const exs = shuffle(t.exercises, rnd);
    const quick = exs.filter((e) => QUICK_TYPES.includes(e.type));
    const pick = [...quick, ...exs.filter((e) => !QUICK_TYPES.includes(e.type))].slice(0, perTopic);
    out.push(...shuffle(pick, rnd).map((ex) => ({ topicId: t.id, ex })));
  }
  return out;
}

export function untouchedTopics(topics: ParsedTopic[], progress: Progress): ParsedTopic[] {
  return topics.filter((t) => (progress.topics.get(t.id)?.level ?? 0) === 0);
}

export function reviewCount(topics: ParsedTopic[], progress: Progress): number {
  let n = 0;
  for (const tp of topics) n += progress.topics.get(tp.id)?.dueCount ?? 0;
  return n;
}

/** Który temat polecić. Najpierw tematy z planu rodzica, które nie są jeszcze na poziomie „Biegły”. */
export function suggestTopic(topics: ParsedTopic[], progress: Progress, preferIds: string[] = []): ParsedTopic | null {
  const usable = topics.filter((t) => t.exercises.length > 0);
  const stats = (t: ParsedTopic) => progress.topics.get(t.id);
  const lvl = (t: ParsedTopic) => stats(t)?.level ?? 0;
  const mastery = (t: ParsedTopic) => stats(t)?.mastery ?? 0;
  const planned = usable.filter((t) => preferIds.includes(t.id) && lvl(t) < 3);
  if (planned.length) return planned.sort((a, b) => mastery(a) - mastery(b))[0];
  const started = usable.filter((t) => lvl(t) > 0 && (stats(t)?.seen ?? 0) > 0);
  const withDue = started.filter((t) => (stats(t)?.dueCount ?? 0) > 0 && lvl(t) < 4);
  if (withDue.length) return withDue.sort((a, b) => mastery(a) - mastery(b))[0];
  const inProgress = started.filter((t) => (stats(t)?.newCount ?? 0) > 0);
  if (inProgress.length) return inProgress[0];
  const fresh = usable.filter((t) => lvl(t) === 0);
  if (fresh.length) return fresh[0];
  return usable.sort((a, b) => mastery(a) - mastery(b))[0] ?? null;
}

/** Czy plan rodzica jest aktualny (termin jeszcze nie minął). */
export function planActive(plan: { until?: string } | null | undefined, now: number): boolean {
  return !!plan && (!plan.until || plan.until >= dateKey(now));
}

/** Ile dni do terminu (0 = dziś). */
export function daysUntil(dk: string, now: number): number {
  return Math.round((noonOf(dk) - noonOf(dateKey(now))) / 86_400_000);
}

// ─── Moje błędy ──────────────────────────────────────────────────────────────

export interface MistakeItem {
  topicId: string;
  exerciseId: string;
  at: number;
}

/**
 * Zadania z błędną odpowiedzią z ostatnich dni, których dziecko jeszcze nie poprawiło
 * (poprawione = dobra odpowiedź w późniejszej sesji). Najnowsze najpierw.
 */
export function mistakesToFix(input: { profileId: string; attempts: Attempt[]; topics: ParsedTopic[]; now: number; since?: string; days?: number }): MistakeItem[] {
  const from = new Date(input.now - (input.days ?? 14) * 86_400_000).toISOString();
  const cutoff = input.since && input.since > from ? input.since : from;
  const valid = new Set<string>();
  for (const t of input.topics) for (const ex of t.exercises) valid.add(itemKey(t.id, ex.id));
  const state = new Map<string, { at: number; session: string; fixed: boolean; topicId: string; exerciseId: string }>();
  const list = input.attempts.filter((a) => a.profileId === input.profileId && a.at >= cutoff && !a.retry).sort(byAt);
  for (const a of list) {
    const key = itemKey(a.topicId, a.exerciseId);
    if (!valid.has(key)) continue;
    if (!a.correct) state.set(key, { at: Date.parse(a.at), session: a.sessionId, fixed: false, topicId: a.topicId, exerciseId: a.exerciseId });
    else {
      const s = state.get(key);
      if (s && s.session !== a.sessionId) s.fixed = true;
    }
  }
  return [...state.values()]
    .filter((s) => !s.fixed)
    .sort((a, b) => b.at - a.at)
    .map(({ topicId, exerciseId, at }) => ({ topicId, exerciseId, at }));
}

// ─── Tabliczka mnożenia ──────────────────────────────────────────────────────

export type FactStatus = 'none' | 'weak' | 'learning' | 'known';

export interface FactState {
  a: number;
  b: number;
  right: number;
  wrong: number;
  status: FactStatus;
}

/** Odpowiedź „umiem” = dobra i szybka (tabliczkę trzeba znać na pamięć, nie liczyć). */
export const FACT_FAST_MS = 6000;

/** Zadanie „a · b = [wynik]” z tabliczki mnożenia (a, b od 1 do 10) → [a, b]. */
export function factOf(ex: Exercise): [number, number] | null {
  if (ex.type !== 'fill') return null;
  if (ex.parts.filter((p) => Array.isArray(p)).length !== 1 || !Array.isArray(ex.parts[ex.parts.length - 1])) return null;
  const text = ex.parts.filter((p): p is string => typeof p === 'string').join('');
  const m = text.match(/^\s*(\d+)\s*·\s*(\d+)\s*=\s*$/);
  if (!m) return null;
  const a = Number(m[1]);
  const b = Number(m[2]);
  return a >= 1 && a <= 10 && b >= 1 && b <= 10 ? [a, b] : null;
}

export const factKey = (a: number, b: number) => `${Math.min(a, b)}x${Math.max(a, b)}`;

/**
 * Stan każdego działania z tabliczki (6 · 7 i 7 · 6 to to samo działanie) — z odpowiedzi
 * w tematach, treningu bez końca i Błyskawicy. `sources` to zadania, które mogą zawierać
 * działania z tabliczki (tematy + zadania generatora „mul”).
 */
export function multiplicationMap(input: { profileId: string; attempts: Attempt[]; sources: { topicId: string; ex: Exercise }[]; since?: string }): Map<string, FactState> {
  const byId = new Map<string, [number, number]>();
  for (const { topicId, ex } of input.sources) {
    const f = factOf(ex);
    if (f) byId.set(itemKey(topicId, ex.id), f);
  }
  const since = input.since ?? '';
  const hist = new Map<string, { a: number; b: number; right: number; wrong: number; recent: { ok: boolean; ms: number }[] }>();
  for (const a of input.attempts.filter((x) => x.profileId === input.profileId && x.at >= since).sort(byAt)) {
    const f = byId.get(itemKey(a.topicId, a.exerciseId));
    if (!f) continue;
    const key = factKey(f[0], f[1]);
    const h = hist.get(key) ?? { a: Math.min(...f), b: Math.max(...f), right: 0, wrong: 0, recent: [] };
    if (a.correct) h.right++;
    else h.wrong++;
    h.recent = [...h.recent, { ok: a.correct, ms: a.ms }].slice(-3);
    hist.set(key, h);
  }
  const out = new Map<string, FactState>();
  for (let a = 1; a <= 10; a++) {
    for (let b = a; b <= 10; b++) {
      const h = hist.get(factKey(a, b));
      let status: FactStatus = 'none';
      if (h) {
        const last = h.recent[h.recent.length - 1];
        const last2 = h.recent.slice(-2);
        if (!last.ok || h.wrong > h.right) status = 'weak';
        else if (last2.length === 2 && last2.every((r) => r.ok && r.ms <= FACT_FAST_MS)) status = 'known';
        else status = 'learning';
      }
      out.set(factKey(a, b), { a, b, right: h?.right ?? 0, wrong: h?.wrong ?? 0, status });
    }
  }
  return out;
}

/** Działania do ćwiczenia: najpierw błędne, potem w trakcie nauki, potem nowe (bez mnożenia przez 1). */
export function weakestFacts(map: Map<string, FactState>, n: number, rnd: () => number = Math.random): [number, number][] {
  const rank: Record<FactStatus, number> = { weak: 0, learning: 1, none: 2, known: 3 };
  const list = shuffle(
    [...map.values()].filter((f) => f.a > 1),
    rnd,
  ).sort((x, y) => rank[x.status] - rank[y.status]);
  return list.slice(0, n).map((f) => (rnd() < 0.5 ? [f.a, f.b] : [f.b, f.a]));
}

export function factsSummary(map: Map<string, FactState>) {
  const vals = [...map.values()];
  return {
    total: vals.length,
    known: vals.filter((f) => f.status === 'known').length,
    learning: vals.filter((f) => f.status === 'learning').length,
    weak: vals.filter((f) => f.status === 'weak').length,
    label: (n: number) => pluralFacts(n),
  };
}

function pluralFacts(n: number): string {
  return `${n} ${plural(n, ['działanie', 'działania', 'działań'])}`;
}
