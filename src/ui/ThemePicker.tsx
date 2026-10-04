import { AVATARS, ownedAvatars } from '../avatars';
import { store, nowIso } from '../data/store';
import { THEME_ORDER, THEMES } from '../themes';
import { useApp } from './hooks';
import { Modal } from './bits';
import { Icon } from './icons';
import { ThemePreview } from './ThemePreview';

/** „Wygląd”: dziecko samo zmienia bohatera (z tych, które ma) i motyw. */
export function ThemePicker({ onClose }: { onClose: () => void }) {
  const { profile, go } = useApp();
  const owned = ownedAvatars(profile.id, profile.avatar, store.list('redemption'));
  const heroes = AVATARS.filter((a) => owned.has(a.emoji));
  const more = AVATARS.length - heroes.length;
  return (
    <Modal title="Wygląd i bohater" onClose={onClose} wide>
      <section className="look-section">
        <h3 className="look-title">Twój bohater</h3>
        <div className="hero-pick" role="group" aria-label="Twój bohater">
          {heroes.map((a) => (
            <button
              key={a.emoji}
              type="button"
              aria-pressed={profile.avatar === a.emoji}
              aria-label={`Bohater: ${a.name}`}
              title={a.name}
              onClick={() => void store.put('profile', { ...profile, avatar: a.emoji, updatedAt: nowIso() })}
            >
              {a.emoji}
            </button>
          ))}
        </div>
        {more > 0 && (
          <button
            className="btn btn-sm look-more"
            onClick={() => {
              onClose();
              go({ name: 'rewards' });
            }}
          >
            <Icon name="gift" size={18} />
            Więcej bohaterów w sklepie
          </button>
        )}
      </section>
      <section className="look-section">
        <h3 className="look-title">Wygląd aplikacji</h3>
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
                <ThemePreview id={id} />
                <span className="theme-name">
                  {t.name}
                  {profile.theme === id && <span className="pill good">Twój wygląd</span>}
                </span>
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
      </section>
    </Modal>
  );
}
