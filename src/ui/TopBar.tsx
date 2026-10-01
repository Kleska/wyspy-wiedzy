import { plural } from '../themes';
import { useApp, useProgress } from './hooks';
import { Icon } from './icons';

export function TopBar({ back }: { back?: () => void }) {
  const { profile, theme, go, openThemes, switchProfile } = useApp();
  const progress = useProgress(profile.id);
  const pending = progress?.pendingRewards ?? 0;
  return (
    <header className="topbar">
      {back ? (
        <button className="btn tb-btn" onClick={back} aria-label="Wróć">
          <Icon name="chevronLeft" />
          <span className="tb-label">Wróć</span>
        </button>
      ) : (
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <Icon name={theme.id === 'piloci' ? 'plane' : theme.id === 'pixel' ? 'zap' : 'flag'} size={22} />
          </span>
          <span className="hide-md">{theme.appName}</span>
        </div>
      )}
      <button className="person-btn" onClick={switchProfile} aria-label={`${profile.name} — zmień osobę`}>
        <span className="avatar">{profile.avatar}</span>
        <span className="person-btn-text">
          <b>{profile.name}</b>
          <small>zmień osobę</small>
        </span>
      </button>
      <div className="chips">
        {progress && (
          <>
            <span className="chip" title="Dni nauki z rzędu">
              <Icon name="flame" size={20} className="ic-flame" />
              {progress.streak}
              <span className="hide-sm">{plural(progress.streak, ['dzień', 'dni', 'dni'])}</span>
            </span>
            <span className="chip" title={theme.coin[2]}>
              <Icon name="coin" size={20} className="ic-coin" />
              {progress.coins}
            </span>
          </>
        )}
        <button className="btn tb-btn" onClick={() => go({ name: 'rewards' })} aria-label={pending ? `Nagrody (${pending} czeka)` : 'Nagrody'}>
          <Icon name="gift" />
          <span className="tb-label">Nagrody</span>
        </button>
        <button className="btn tb-btn" onClick={openThemes} aria-label="Wygląd">
          <Icon name="palette" />
          <span className="tb-label">Wygląd</span>
        </button>
        <button className="btn tb-btn" onClick={() => go({ name: 'parent' })} aria-label="Panel rodzica">
          <Icon name="lock" />
          <span className="tb-label">Rodzic</span>
        </button>
      </div>
    </header>
  );
}
