import { useCallback, useEffect, useRef, useState } from 'react';
import type { Screen } from './hooks';

const home: Screen = { name: 'home' };

/** Pełny ekran w historii: Wstecz przywraca poprzedni widok, również wybrany dział. */
export function useNavigation() {
  const [screen, setScreen] = useState<Screen>(home);
  const currentRef = useRef<Screen>(home);
  const guardRef = useRef<(() => Promise<boolean>) | null>(null);
  const restoreRef = useRef<(() => void) | null>(null);
  const busyRef = useRef(false);
  const bypassRef = useRef(false);
  const registerBackGuard = useCallback((guard: () => Promise<boolean>) => {
    guardRef.current = guard;
    return () => {
      if (guardRef.current === guard) guardRef.current = null;
    };
  }, []);
  const show = useCallback((next: Screen) => {
    currentRef.current = next;
    setScreen(next);
    window.scrollTo(0, 0);
  }, []);
  const go = useCallback(
    (next: Screen) => {
      if (history.state?.wwOverlay || (currentRef.current.name === 'practice' && next.name === 'summary')) history.replaceState({ wwScreen: next }, '');
      else history.pushState({ wwScreen: next }, '');
      show(next);
    },
    [show],
  );
  const openOverlay = useCallback((kind: string) => {
    history.pushState({ wwScreen: currentRef.current, wwOverlay: kind }, '');
  }, []);
  const closeOverlay = useCallback(() => {
    if (history.state?.wwOverlay) history.back();
  }, []);
  const reset = useCallback(() => {
    history.replaceState({ wwScreen: home }, '');
    show(home);
  }, [show]);
  useEffect(() => {
    history.replaceState({ wwScreen: home }, '');
    const onPop = (event: PopStateEvent) => {
      if (restoreRef.current) {
        const resolve = restoreRef.current;
        restoreRef.current = null;
        resolve();
        return;
      }
      const next: Screen = event.state?.wwScreen ?? home;
      if (bypassRef.current) {
        bypassRef.current = false;
        show(next);
        return;
      }
      const guard = guardRef.current;
      if (!guard) {
        show(next);
        return;
      }
      if (busyRef.current) return;
      busyRef.current = true;
      // Najpierw przywróć bieżący wpis. Anulowanie potwierdzenia nie zużywa historii.
      const restored = new Promise<void>((resolve) => {
        restoreRef.current = resolve;
      });
      history.go(1);
      void restored.then(async () => {
        try {
          if (await guard()) {
            bypassRef.current = true;
            history.back();
          }
        } finally {
          busyRef.current = false;
        }
      });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [show]);
  return { screen, go, reset, openOverlay, closeOverlay, registerBackGuard };
}
