import { useState } from 'react';
import { store } from '../../data/store';
import { useStoreVersion } from '../hooks';
import { Icon, type IconName } from '../icons';
import { ParentAdd } from './ParentAdd';
import { ParentPlan } from './ParentPlan';
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

  const openEditor = (seed: EditorSeed) => {
    setEditor(seed);
    window.scrollTo(0, 0);
  };

  return (
    <div className="parent">
      <div className="parent-layout">
        <nav className="parent-nav" aria-label="Panel rodzica">
          <h2>Panel rodzica</h2>
          {TABS.map(([id, label, icon]) => (
            <button
              key={id}
              aria-current={tab === id && !editor ? 'page' : undefined}
              onClick={() => {
                setEditor(null);
                setTab(id);
              }}
            >
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
        </nav>
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
