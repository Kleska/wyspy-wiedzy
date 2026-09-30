import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { store } from '../data/store';
import { computeProgress, type Progress } from '../engine';
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
      settings: store.settings,
      now: Date.now(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v, profileId, minute]);
}

export type Screen =
  | { name: 'home' }
  | { name: 'practice'; topicId: string | null; nonce: number }
  | { name: 'summary'; result: SessionResult }
  | { name: 'rewards' }
  | { name: 'parent' };

export interface SessionResult {
  topicId: string | null;
  answered: number;
  firstCorrect: number;
  firstTotal: number;
  seconds: number;
  xpGained: number;
  coinsGained: number;
  levelBefore: number;
  levelAfter: number;
  starsBefore: number;
  starsAfter: number;
  newBadges: string[];
  completed: boolean;
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
