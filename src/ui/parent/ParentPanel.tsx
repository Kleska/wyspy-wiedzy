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
