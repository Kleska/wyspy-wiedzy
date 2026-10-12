import { AvatarPortrait, AvatarCredit } from './AvatarPortrait';
import { AVATARS, ownedAvatars } from '../avatars';
import { unlockAvatar } from '../avatarPurchase';
import { store, nowIso } from '../data/store';
import { THEME_ORDER, THEMES } from '../themes';
import { useApp } from './hooks';
import { Modal } from './bits';
import { Icon } from './icons';
import { ThemePreview } from './ThemePreview';

/** „Wygląd”: dziecko samo zmienia bohatera (z tych, które ma) i motyw. */
export function ThemePicker({ onClose }: { onClose: () => void }) {
  const { profile, go, toast } = useApp();
  const owned = ownedAvatars(profile.id, profile.avatar, store.list('redemption'));
  const heroes = AVATARS.filter((a) => owned.has(a.emoji)).sort((a, b) => Number(!!b.art) - Number(!!a.art));
  const more = AVATARS.length - heroes.length;
  return (
    <Modal title="Wygląd i bohater" onClose={onClose} wide>
      <section className="look-section">
        <h3 className="look-title">Twój bohater</h3><p className="muted">Podstawowa kolekcja jest bezpłatna. Gwiazdy sportu, filmu i komiksu odblokujesz w Nagrodach.</p>
        <div className="hero-pick portrait-pick" role="group" aria-label="Twój bohater">
          {heroes.filter((a) => !!a.art).map((a) => (
            <button
              key={a.emoji}
              type="button"
              aria-pressed={profile.avatar === a.emoji}
              aria-label={`Bohater: ${a.name}`}
              title={a.name}
              onClick={() => void unlockAvatar(profile.id, a.emoji).catch((error) => toast(error instanceof Error ? error.message : 'Nie udało się zmienić bohatera.'))}
            >
              <AvatarPortrait value={a.emoji} variant="card" /><small>{a.name}</small>
            </button>
          ))}
        </div>
        <details className="clear-details"><summary>Klasyczne ikony</summary><div className="hero-pick portrait-pick" role="group" aria-label="Klasyczne ikony">          {heroes.filter((a) => !a.art).map((a) => (
            <button
              key={a.emoji}
              type="button"
              aria-pressed={profile.avatar === a.emoji}
              aria-label={`Bohater: ${a.name}`}
              title={a.name}
              onClick={() => void unlockAvatar(profile.id, a.emoji).catch((error) => toast(error instanceof Error ? error.message : 'Nie udało się zmienić bohatera.'))}
            >
              <AvatarPortrait value={a.emoji} variant="card" /><small>{a.name}</small>
            </button>
          ))}</div></details>
        <details className="clear-details"><summary>Źródła fotografii</summary><div className="col">{AVATARS.filter((a) => a.credit).map((a) => <div key={a.emoji}><b>{a.name}</b><AvatarCredit value={a.emoji} /></div>)}</div></details>
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
