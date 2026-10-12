import { generatorById } from './content/generators';
import { subjectOf } from './content/seed';
import { addDays, dateKey, isQuizHidden, schoolGrade } from './engine';
import type { Attempt, ParsedTopic, Profile, Session, SessionMode } from './types';

export type HistoryKind = 'learning' | 'test' | 'quiz' | 'diagnostic' | 'games';
export type HistoryPeriod = '7' | '30' | 'all';

const LABELS: Record<SessionMode, string> = {
  topic: 'Ćwiczenie', review: 'Powtórka', test: 'Sprawdzian', diagnostic: 'Test na start',
  gen: 'Trening', fix: 'Poprawa błędów', sprint: 'Błyskawica', pairs: 'Pary na czas', learn: 'Lekcja',
};

export interface HistoryEntry {
  session: Session;
  title: string;
  label: string;
  kind: HistoryKind;
  topicIds: string[];
  subjectIds: string[];
  answered: number;
  correct: number;
  retries: number;
  grade: number | null;
  at: number;
}

function gameSubject(key: string): string {
  const stripped = key.replace(/^pairs:/, '');
  return stripped.startsWith('quiz:') ? stripped.slice(5) : 'mat';
}

/** Dziennik własnej osoby, od jej resetu. Schowanie przez dziecko dotyczy startu; decyzja rodzica obowiązuje też tu. */
export function childHistory(profile: Profile, sessions: Session[], attempts: Attempt[], topics: ParsedTopic[], audience: 'child' | 'parent' = 'child'): HistoryEntry[] {
  const since = profile.resetAt ?? '';
  const mine = attempts.filter((a) => a.profileId === profile.id && a.at >= since);
  const bySession = new Map<string, Attempt[]>();
  for (const attempt of mine) {
    const list = bySession.get(attempt.sessionId) ?? [];
    list.push(attempt);
    bySession.set(attempt.sessionId, list);
  }
  const topicMap = new Map(topics.map((t) => [t.id, t]));
  return sessions.filter((s) => s.profileId === profile.id && s.startedAt >= since && (s.completed || s.answered > 0 || s.activeSeconds > 0))
    .filter((s) => audience === 'parent' || !s.quizId || !isQuizHidden(profile, s.quizId, 'parent'))
    .map((session) => {
      const own = bySession.get(session.id) ?? [];
      const first = own.filter((a) => !a.retry);
      const answered = first.length || session.answered;
      const correct = first.length ? first.filter((a) => a.correct).length : session.correct;
      const topicIds = [...new Set([...(session.topicIds ?? []), ...(session.topicId ? [session.topicId] : []), ...own.map((a) => a.topicId)])];
      const subjectIds = [...new Set(topicIds.map((id) => topicMap.get(id)?.subject).filter((id): id is string => !!id))];
      if (!subjectIds.length && (session.genId || session.mode === 'gen')) subjectIds.push(gameSubject(session.genId ?? ''));
      const kind: HistoryKind = session.quizId ? 'quiz' : session.mode === 'test' ? 'test' : session.mode === 'diagnostic' ? 'diagnostic' : session.mode === 'sprint' || session.mode === 'pairs' ? 'games' : 'learning';
      const quiz = profile.quizzes?.find((q) => q.id === session.quizId);
      const topicNames = topicIds.map((id) => topicMap.get(id)?.title).filter(Boolean);
      const key = session.genId?.replace(/^pairs:/, '') ?? '';
      const game = key.startsWith('quiz:') ? subjectOf(key.slice(5)).name : generatorById(key)?.title;
      const title = session.title?.trim() || quiz?.title || (game && ['gen', 'sprint', 'pairs'].includes(session.mode) ? game : topicNames.length ? topicNames.join(' · ') : session.topicId ? 'Temat archiwalny' : LABELS[session.mode]);
      return {
        session, title, label: session.quizId ? 'Kartkówka' : LABELS[session.mode], kind, topicIds, subjectIds,
        answered, correct: Math.min(answered, Math.max(0, correct)), retries: own.filter((a) => a.retry).length,
        grade: session.completed && session.mode === 'test' && answered > 0 ? schoolGrade(Math.min(answered, Math.max(0, correct)), answered) : null,
        at: Date.parse(session.endedAt ?? session.startedAt),
      };
    }).sort((a, b) => b.at - a.at || b.session.id.localeCompare(a.session.id));
}

export function filterHistory(entries: HistoryEntry[], period: HistoryPeriod, kind: HistoryKind | 'all', subject: string, now: number): HistoryEntry[] {
  const cutoff = period === 'all' ? -Infinity : new Date(dateKey(addDays(now, -(Number(period) - 1))) + 'T00:00:00').getTime();
  return entries.filter((entry) => entry.at >= cutoff && (kind === 'all' || entry.kind === kind) && (!subject || entry.subjectIds.includes(subject)));
}

export function historyStats(entries: HistoryEntry[]) {
  // Gry na czas mają odrębne zasady. Trafność ćwiczeń nie miesza ich z nauką ani poprawkami.
  const learning = entries.filter((entry) => entry.kind !== 'games' && entry.session.mode !== 'learn');
  const answered = learning.reduce((sum, entry) => sum + entry.answered, 0);
  const correct = learning.reduce((sum, entry) => sum + entry.correct, 0);
  return {
    seconds: entries.reduce((sum, entry) => sum + entry.session.activeSeconds, 0),
    completed: entries.filter((entry) => entry.session.completed).length,
    lessons: entries.filter((entry) => entry.session.mode === 'learn' && entry.session.completed).length,
    assessments: entries.filter((entry) => (entry.kind === 'test' || entry.kind === 'quiz') && entry.grade !== null).length,
    answered, correct, accuracy: answered > 0 ? Math.round((correct / answered) * 100) : null,
  };
}
