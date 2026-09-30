import { store, nowIso } from '../data/store';
import { THEME_ORDER, THEMES } from '../themes';
import { useApp } from './hooks';
import { Modal } from './TopicSheet';

export function ThemePicker({ onClose }: { onClose: () => void }) {
  const { profile } = useApp();
  return (
    <Modal title="Wybierz wygląd" onClose={onClose} wide>
      <div className="theme-cards">
        {THEME_ORDER.map((id) => {
          const t = THEMES[id];
          return (
            <button
              key={id}
              className="theme-card"
              aria-pressed={profile.theme === id}
              onClick={() => {
                void store.put('profile', { ...profile, theme: id, updatedAt: nowIso() });
                onClose();
              }}
            >
              <span className="swatches">
                {t.swatch.map((c) => (
                  <span key={c} style={{ background: c }} />
                ))}
              </span>
              <span className="theme-name">{t.name}</span>
              <span className="muted" style={{ fontSize: 14, fontWeight: 700 }}>
                {t.tagline}
              </span>
            </button>
          );
        })}
      </div>
      <p className="muted" style={{ fontSize: 14, fontWeight: 700 }}>
        Postępy, punkty i nagrody zostają te same — zmienia się tylko wygląd.
      </p>
    </Modal>
  );
}
