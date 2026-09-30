import { store } from '../data/store';
import { plural } from '../themes';
import { useApp, useProgress } from './hooks';
import { Icon } from './icons';

export function TopBar({ back }: { back?: () => void }) {
  const { profile, theme, go, openThemes, switchProfile } = useApp();
  const progress = useProgress(profile.id);
  const multi = store.list('profile').length > 1;
  const pending = progress?.pendingRewards ?? 0;
  return (
    <header className="topbar">
      {back ? (
        <button className="btn icon-btn" onClick={back} aria-label="Wróć">
          <Icon name="chevronLeft" />
        </button>
      ) : null}
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <Icon name={theme.id === 'piloci' ? 'plane' : theme.id === 'pixel' ? 'zap' : 'flag'} size={22} />
        </span>
        <span className="hide-sm">{theme.appName}</span>
      </div>
      <div className="chips">
        {progress && (
          <>
            <span className="chip" title="Dni nauki z rzędu">
              <Icon name="flame" size={18} className="ic-flame" />
              {progress.streak}
              <span className="hide-sm">{plural(progress.streak, ['dzień', 'dni', 'dni'])}</span>
            </span>
            <span className="chip" title={theme.coin[2]}>
              <Icon name="coin" size={18} className="ic-coin" />
              {progress.coins}
            </span>
          </>
        )}
        <button className="btn icon-btn" onClick={openThemes} aria-label="Zmień wygląd">
          <Icon name="palette" />
        </button>
        <button className="btn icon-btn" onClick={() => go({ name: 'rewards' })} aria-label={pending ? `Nagrody (${pending} czeka)` : 'Nagrody'} style={{ position: 'relative' }}>
          <Icon name="gift" />
        </button>
        <button className="btn icon-btn" onClick={() => go({ name: 'parent' })} aria-label="Panel rodzica">
          <Icon name="lock" />
        </button>
        {multi && (
          <button className="avatar" onClick={switchProfile} aria-label="Zmień profil" style={{ cursor: 'pointer' }}>
            {profile.avatar}
          </button>
        )}
      </div>
    </header>
  );
}
