import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { store } from '../data/store';
import { computeProgress, type Progress, type TopicLevel } from '../engine';
import type { ThemeDef } from '../themes';
import type { Profile } from '../types';

export function useStoreVersion() {
  return useSyncExternalStore(store.subscribe, store.getVersion, store.getVersion);
}

export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function useProgress(profileId: string | null): Progress | null {
  const v = useStoreVersion();
  const now = useNow();
  const minute = Math.floor(now / 60_000);
  return useMemo(() => {
    if (!profileId) return null;
    return computeProgress({
      profileId,
      attempts: store.list('attempt'),
      sessions: store.list('session'),
      redemptions: store.list('redemption'),
      topics: store.allTopics(),
      settings: store.settingsFor(profileId),
      since: store.get('profile', profileId)?.resetAt,
      now: Date.now(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v, profileId, minute]);
}

/** Co ćwiczymy: temat, powtórkę, sprawdzian, test na start, trening z generatora albo poprawę błędów. */
export type Run =
  | { kind: 'topic'; topicId: string }
  | { kind: 'review' }
  | { kind: 'test'; topicIds: string[]; title: string; subjectId: string; count: number; quizId?: string; /** Kartkówka z konkretnych zadań (np. z błędów). */ items?: { topicId: string; exerciseId: string }[] }
  | { kind: 'diagnostic'; subjectId: string }
  | { kind: 'gen'; genId: string; facts?: [number, number][]; /** Trening zaczęty z ekranu startowego (karta „Teraz”) — po nim wracamy na start, nie do przedmiotu. */ home?: boolean }
  | { kind: 'fix'; items: { topicId: string; exerciseId: string }[]; subjectId: string | null };

/** Błyskawica: 60 sekund z generatora (matematyka) albo szybkie pytania z tematów przedmiotu. */
export type SprintGame = { kind: 'gen'; genId: string } | { kind: 'quiz'; subjectId: string };

export type Screen =
  | { name: 'home' }
  | { name: 'subject'; subjectId: string; /** Dział, który ma być otwarty na planszy (domyślnie dział polecanego tematu). */ unit?: string }
  | { name: 'practice'; run: Run; nonce: number }
  | { name: 'sprint'; game: SprintGame; nonce: number }
  | { name: 'pairs'; game: SprintGame; nonce: number }
  | { name: 'times' }
  /** Tryb nauki: karty lekcji jednego tematu. `then` — dokąd wrócić po lekcji. */
  | { name: 'learn'; topicId: string; nonce: number; from?: 'home' | 'subject' }
  /** Powtórka przed sprawdzianem: najważniejsze rzeczy z kilku tematów na jednej stronie. */
  | { name: 'sheet'; topicIds: string[]; title: string; from: 'home' | 'subject'; subjectId?: string }
  | { name: 'summary'; result: SessionResult }
  | { name: 'rewards' }
  | { name: 'parent' };

export const practice = (run: Run): Screen => ({ name: 'practice', run, nonce: Date.now() });
export const isExamRun = (run: Run) => run.kind === 'test' || run.kind === 'diagnostic';

/** Dokąd wrócić po ćwiczeniu. */
export function backScreen(run: Run, subjectId: string | null): Screen {
  if (run.kind === 'gen' && run.facts?.length) return { name: 'times' };
  if (run.kind === 'gen' && run.home) return { name: 'home' };
  return subjectId ? { name: 'subject', subjectId } : { name: 'home' };
}

export interface ExamMistake {
  topicId: string;
  exerciseId: string;
  prompt: string;
  given: string;
  correct: string;
}

export interface SessionResult {
  run: Run;
  title: string;
  /** Dokąd wrócić po podsumowaniu. */
  subjectId: string | null;
  answered: number;
  firstCorrect: number;
  firstTotal: number;
  retryTotal: number;
  retryCorrect: number;
  seconds: number;
  xpGained: number;
  coinsGained: number;
  levelBefore: number;
  levelAfter: number;
  starsAfter: number;
  levelChanges: { topicId: string; title: string; from: TopicLevel; to: TopicLevel }[];
  newBadges: string[];
  streakAfter: number;
  /** Nowy kamień milowy serii (np. 7 dni) — świętujemy. */
  milestone: { days: number; bonus: number } | null;
  /** Cel tygodnia właśnie wykonany. */
  weekDone: boolean;
  exam?: {
    grade: number;
    perTopic: { topicId: string; title: string; correct: number; total: number; placed: boolean }[];
    mistakes: ExamMistake[];
  };
}

export interface AppCtx {
  profile: Profile;
  theme: ThemeDef;
  go: (s: Screen) => void;
  toast: (msg: string) => void;
  openThemes: () => void;
  openTopic: (topicId: string) => void;
  switchProfile: () => void;
}

export const AppContext = createContext<AppCtx | null>(null);

export function useApp(): AppCtx {
  const c = useContext(AppContext);
  if (!c) throw new Error('AppContext missing');
  return c;
}
