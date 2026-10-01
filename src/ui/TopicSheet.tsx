import { useEffect } from 'react';
import { subjectOf } from '../content/seed';
import { store } from '../data/store';
import { speak } from '../speech';
import { plural } from '../themes';
import { useApp, useProgress } from './hooks';
import { Icon, Stars } from './icons';

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="btn icon-btn" onClick={onClose} aria-label="Zamknij">
            <Icon name="x" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function TopicSheet({ topicId, onClose }: { topicId: string; onClose: () => void }) {
  const { profile, theme, go } = useApp();
  const progress = useProgress(profile.id)!;
  const topic = store.topicsFor(profile.id).find((t) => t.id === topicId);
  if (!topic) return null;
  const s = progress.topics.get(topic.id);
  const n = Math.min(store.settings.sessionLength, topic.exercises.length);
  return (
    <Modal title={topic.title} onClose={onClose}>
      <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <span className="label">{subjectOf(topic.subject).name}</span>
        <Stars n={s?.stars ?? 0} size={26} />
      </div>
      {topic.description && (
        <div className="hint-box">
          <Icon name="book" />
          <span style={{ flex: 1 }}>{topic.description}</span>
          <button className="btn icon-btn btn-sm" onClick={() => speak(topic.description!)} aria-label="Przeczytaj zasadę na głos">
            <Icon name="volume" size={20} />
          </button>
        </div>
      )}
      <div className="stat-tiles">
        <div className="stat-tile">
          <b>{Math.round((s?.mastery ?? 0) * 100)}%</b>
          <small>opanowane</small>
        </div>
        <div className="stat-tile">
          <b>{s?.newCount ?? topic.exercises.length}</b>
          <small>{plural(s?.newCount ?? topic.exercises.length, ['nowe', 'nowe', 'nowych'])}</small>
        </div>
        <div className="stat-tile">
          <b>{s?.dueCount ?? 0}</b>
          <small>do powtórki</small>
        </div>
      </div>
      <p className="muted" style={{ fontWeight: 700, fontSize: 14 }}>
        Gwiazdki rosną, gdy odpowiadasz dobrze kilka dni z rzędu — tak mózg zapamiętuje najlepiej.
      </p>
      <button className="btn btn-primary btn-lg btn-block" onClick={() => go({ name: 'practice', topicId: topic.id, nonce: Date.now() })}>
        {theme.start} ({n} {plural(n, ['zadanie', 'zadania', 'zadań'])})
      </button>
    </Modal>
  );
}
