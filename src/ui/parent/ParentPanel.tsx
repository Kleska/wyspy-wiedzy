import { useEffect, useState } from 'react';
import { store } from '../../data/store';
import { useStoreVersion } from '../hooks';
import { Icon, type IconName } from '../icons';
import { ParentAdd } from './ParentAdd';
import { ExpiredPlanNotice, ParentPlan } from './ParentPlan';
import { ReportsNotice } from './ParentReports';
import { ParentRewards } from './ParentRewards';
import { ParentSettings } from './ParentSettings';
import { ParentStats } from './ParentStats';
import { ParentTopics, TopicEditor, type EditorSeed } from './ParentTopics';

type Tab = 'stats' | 'plan' | 'topics' | 'add' | 'rewards' | 'settings';

const TABS: [Tab, string, IconName][] = [
  ['stats', 'Postępy', 'chart'],
  ['plan', 'Plan i sprawdziany', 'pin'],
  ['topics', 'Tematy', 'book'],
  ['add', 'Dodaj z AI / zdjęcia', 'sparkles'],
  ['rewards', 'Nagrody', 'gift'],
  ['settings', 'Ustawienia', 'settings'],
];

export function ParentPanel({ pin, onExit }: { pin: string; onExit: () => void }) {
  useStoreVersion();
  const [tab, setTab] = useState<Tab>('stats');
  const [editor, setEditor] = useState<EditorSeed | null>(null);
  // Wąski ekran: pasek sekcji przewija się w bok, a „Menu” pokazuje wszystkie sekcje naraz, jedna pod drugą.
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu]);
  const pending = store.list('redemption').filter((r) => r.status === 'pending').length;
  const st = store.state;
  const sync = st.sync;
  const syncText =
    sync.status === 'syncing'
      ? 'Synchronizuję…'
      : sync.status === 'offline'
        ? 'Brak internetu — pokazuję dane zapisane na tym urządzeniu'
        : sync.status === 'error'
          ? `Błąd synchronizacji${sync.error ? `: ${sync.error}` : ''}`
          : `Dane ze wszystkich urządzeń · ${sync.live ? 'na żywo' : 'odświeżane co minutę'} · ostatnio pobrane ${sync.lastSync ? new Date(sync.lastSync).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}`;

  const openTab = (id: Tab) => {
    setEditor(null);
    setTab(id);
  };

  const openEditor = (seed: EditorSeed) => {
    setEditor(seed);
    window.scrollTo(0, 0);
  };

  return (
    <div className="parent">
      <div className="parent-layout">
        <nav className="parent-nav" aria-label="Panel rodzica">
          <h2>Panel rodzica</h2>
          <button className="parent-menu-btn" aria-haspopup="dialog" aria-expanded={menu} onClick={() => setMenu(true)}>
            <Icon name="menu" size={20} />
            Menu
          </button>
          <div className="parent-tabs">
            {TABS.map(([id, label, icon]) => (
              <button key={id} aria-current={tab === id && !editor ? 'page' : undefined} onClick={() => openTab(id)}>
                <Icon name={icon} size={20} />
                {label}
                {id === 'rewards' && pending > 0 && <span className="pill bad">{pending}</span>}
              </button>
            ))}
            <span className="spacer" />
            <button onClick={onExit}>
              <Icon name="logout" size={20} />
              Wyjdź
            </button>
          </div>
        </nav>
        {menu && (
          <div className="parent-menu-backdrop" onClick={(e) => e.target === e.currentTarget && setMenu(false)}>
            <div className="parent-menu" role="dialog" aria-modal="true" aria-label="Wszystkie sekcje">
              <div className="parent-menu-head">
                <b>Panel rodzica</b>
                <button onClick={() => setMenu(false)} aria-label="Zamknij menu">
                  <Icon name="x" size={20} />
                </button>
              </div>
              {TABS.map(([id, label, icon]) => (
                <button
                  key={id}
                  className="parent-menu-item"
                  aria-current={tab === id && !editor ? 'page' : undefined}
                  onClick={() => {
                    openTab(id);
                    setMenu(false);
                    window.scrollTo(0, 0);
                  }}
                >
                  <Icon name={icon} size={22} />
                  <span>{label}</span>
                  {id === 'rewards' && pending > 0 && <span className="pill bad">{pending}</span>}
                </button>
              ))}
              <button className="parent-menu-item parent-menu-exit" onClick={onExit}>
                <Icon name="logout" size={22} />
                <span>Wyjdź z panelu</span>
              </button>
            </div>
          </div>
        )}
        <main className="parent-main">
          {st.cloud && st.auth.status !== 'signedIn' && (
            <div className="sync-bar offline" role="status">
              <span className="sync-dot" />
              <span>To urządzenie nie jest zalogowane do konta rodziny — widzisz tylko dane zapisane tutaj.</span>
              <button className="btn btn-sm" onClick={() => location.reload()}>
                Zaloguj
              </button>
            </div>
          )}
          {st.cloud && st.auth.status === 'signedIn' && (
            <div className={`sync-bar ${sync.status}`} role="status">
              <span className="sync-dot" />
              <span>{syncText}</span>
              <button className="btn btn-sm" onClick={() => void store.sync()} disabled={sync.status === 'syncing'}>
                <Icon name="repeat" size={16} /> Odśwież
              </button>
            </div>
          )}
          {editor ? (
            <TopicEditor
              seed={editor}
              onClose={() => {
                setEditor(null);
                setTab('topics');
              }}
            />
          ) : (
            <>
              <ReportsNotice onEdit={openEditor} />
              {store.profiles().map((p) => (
                <ExpiredPlanNotice key={p.id} p={p} />
              ))}
              {tab === 'stats' && <ParentStats />}
              {tab === 'plan' && <ParentPlan pin={pin} />}
              {tab === 'topics' && <ParentTopics onEdit={openEditor} />}
              {tab === 'add' && <ParentAdd pin={pin} onResult={openEditor} />}
              {tab === 'rewards' && <ParentRewards />}
              {tab === 'settings' && <ParentSettings />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
