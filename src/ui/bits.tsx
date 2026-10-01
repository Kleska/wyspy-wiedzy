import { useEffect } from 'react';
import { passageParagraphs } from '../dsl';
import { LEVEL_NAMES, type TopicLevel } from '../engine';
import type { Passage } from '../types';
import { speak } from '../speech';
import { withFractions } from './exercises/Exercises';
import { Icon } from './icons';

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

/** Poziom tematu jako kolorowa plakietka. */
export function LevelChip({ level, small }: { level: TopicLevel; small?: boolean }) {
  return (
    <span className={`level-chip lv-${level} ${small ? 'small' : ''}`} title="Poziom tematu">
      {LEVEL_NAMES[level]}
    </span>
  );
}

/** Pasek z 4 kreskami: Próbowany → Znany → Biegły → Opanowany. */
export function LevelSteps({ level }: { level: TopicLevel }) {
  return (
    <span className="level-steps" aria-label={`Poziom: ${LEVEL_NAMES[level]}`}>
      {[1, 2, 3, 4].map((l) => (
        <span key={l} className={l <= level ? 'on' : ''} />
      ))}
    </span>
  );
}

/** Ściąga: każda linia osobno, „Przykład:” i „Sposób:” wyróżnione. */
export function GuideText({ text }: { text: string }) {
  return (
    <div className="guide">
      {text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l, i) => {
          const m = l.match(/^(Przykład|Sposób|Uwaga|Wyjątki?|Sztuczka)\s*:\s*(.*)$/);
          return (
            <p key={i} className={m ? 'guide-ex' : ''}>
              {m ? (
                <>
                  <b>{m[1]}:</b> {withFractions(m[2])}
                </>
              ) : (
                withFractions(l)
              )}
            </p>
          );
        })}
    </div>
  );
}

export function GuideCard({ title, description, guide }: { title?: string; description?: string; guide?: string }) {
  const text = guide || description;
  if (!text) return null;
  return (
    <div className="guide-card">
      <div className="guide-head">
        <Icon name="book" />
        <b>{title ?? 'Ściąga'}</b>
        <span className="spacer" />
        <button className="btn icon-btn btn-sm" onClick={() => speak(text.replace(/\n/g, '. '))} aria-label="Przeczytaj ściągę na głos">
          <Icon name="volume" size={20} />
        </button>
      </div>
      <GuideText text={text} />
    </div>
  );
}

/** Tekst do czytania ze zrozumieniem — nad pytaniem, z czytaniem na głos. */
export function PassageCard({ passage, defaultOpen }: { passage: Passage; defaultOpen: boolean }) {
  const paras = passageParagraphs(passage);
  return (
    <details className="passage" open={defaultOpen}>
      <summary>
        <Icon name="book" size={20} /> <span className="passage-title">{passage.title}</span>
        <span className="passage-toggle muted">{defaultOpen ? '' : '(pokaż tekst)'}</span>
      </summary>
      <div className="passage-body">
        {paras.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <button type="button" className="btn btn-sm" onClick={() => speak(`${passage.title}. ${paras.join(' ')}`)}>
          <Icon name="volume" size={18} /> Posłuchaj tekstu
        </button>
      </div>
    </details>
  );
}

export function GuideModal({ topicTitle, description, guide, onClose }: { topicTitle: string; description?: string; guide?: string; onClose: () => void }) {
  return (
    <Modal title={`Ściąga: ${topicTitle}`} onClose={onClose}>
      <GuideCard description={description} guide={guide} title="Przypomnij sobie" />
      <button className="btn btn-primary btn-lg btn-block" onClick={onClose}>
        Wracam do zadania
      </button>
    </Modal>
  );
}
