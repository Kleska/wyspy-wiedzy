import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DialogHost } from './ui/dialogs';
import { store } from './data/store';
import { loadThemeFonts, THEMES } from './themes';
import type { Profile } from './types';
import { Home, SubjectScreen } from './ui/Home';
import { AppContext, useStoreVersion, type AppCtx, type Screen } from './ui/hooks';
import { Login } from './ui/Login';
import { Onboarding, ProfilePicker } from './ui/Onboarding';
import { ParentGate } from './ui/parent/ParentGate';
import { Practice } from './ui/Practice';
import { Rewards } from './ui/Rewards';
import { Pairs } from './ui/Pairs';
import { Sprint } from './ui/Sprint';
import { TimesTable } from './ui/TimesTable';
import { Summary } from './ui/Summary';
import { ThemePicker } from './ui/ThemePicker';
import { TopicSheet } from './ui/TopicSheet';

const PROFILE_KEY = 'ww-profile';

function Splash({ text }: { text: string }) {
  return (
    <div className="center-screen" role="status">
      <div className="col" style={{ alignItems: 'center' }}>
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          Wyspy Wiedzy
        </div>
        <p className="muted" style={{ fontWeight: 700 }}>
          {text}
        </p>
      </div>
    </div>
  );
}

export function App() {
  useStoreVersion();
  const st = store.state;
  // Przy kilku osobach na jednym urządzeniu pytamy „Kto się dziś uczy?” przy każdym uruchomieniu.
  const [profileId, setProfileId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [themesOpen, setThemesOpen] = useState(false);
  const [topicOpen, setTopicOpen] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const profiles = store.profiles();
  const profile: Profile | undefined = profiles.find((p) => p.id === profileId) ?? (profiles.length === 1 ? profiles[0] : undefined);
  const theme = THEMES[profile?.theme ?? 'wyspy'];

  useEffect(() => {
    document.documentElement.dataset.theme = theme.id;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.themeColor);
    void loadThemeFonts(theme.id);
  }, [theme.id, theme.themeColor]);

  const choose = useCallback((id: string) => {
    setProfileId(id);
    try {
      localStorage.setItem(PROFILE_KEY, id);
    } catch {
      /* ignore */
    }
    setPicking(false);
    setScreen({ name: 'home' });
    window.scrollTo(0, 0);
  }, []);

  // Przycisk „wstecz” w Androidzie wraca do ekranu głównego zamiast zamykać aplikację.
  const go = useCallback((s: Screen) => {
    setScreen(s);
    setTopicOpen(null);
    window.scrollTo(0, 0);
    if (s.name !== 'home') history.pushState({ ww: s.name }, '');
  }, []);
  useEffect(() => {
    const onPop = () => setScreen((cur) => (cur.name === 'practice' || cur.name === 'sprint' || cur.name === 'pairs' ? cur : { name: 'home' }));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2800);
  }, []);

  const ctx: AppCtx | null = useMemo(
    () =>
      profile
        ? {
            profile,
            theme,
            go,
            toast,
            openThemes: () => setThemesOpen(true),
            openTopic: (id: string) => setTopicOpen(id),
            switchProfile: () => setPicking(true),
          }
        : null,
    [profile, theme, go, toast],
  );

  if (!st.ready) return <Splash text="Ładuję…" />;
  if (st.cloud && st.auth.status === 'checking') return <Splash text="Łączę z chmurą…" />;
  if (st.cloud && st.auth.status === 'signedOut') return <Login />;
  if (st.cloud && !st.sync.firstPullDone) return <Splash text="Pobieram postępy…" />;
  if (profiles.length === 0) return <Onboarding onDone={choose} />;
  if (!profile || picking) return <ProfilePicker profiles={profiles} onPick={choose} onCancel={profile ? () => setPicking(false) : undefined} />;

  return (
    <AppContext.Provider value={ctx}>
      <div className="app">
        {screen.name === 'home' && <Home />}
        {screen.name === 'subject' && <SubjectScreen subjectId={screen.subjectId} />}
        {screen.name === 'practice' && <Practice key={screen.nonce} run={screen.run} />}
        {screen.name === 'sprint' && <Sprint key={screen.nonce} game={screen.game} />}
        {screen.name === 'pairs' && <Pairs key={screen.nonce} game={screen.game} />}
        {screen.name === 'times' && <TimesTable />}
        {screen.name === 'summary' && <Summary result={screen.result} />}
        {screen.name === 'rewards' && <Rewards />}
        {screen.name === 'parent' && <ParentGate onExit={() => go({ name: 'home' })} />}
        {themesOpen && <ThemePicker onClose={() => setThemesOpen(false)} />}
        {topicOpen && <TopicSheet topicId={topicOpen} onClose={() => setTopicOpen(null)} />}
        <DialogHost />
        {toastMsg && (
          <div className="toast" role="status">
            {toastMsg}
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
}
