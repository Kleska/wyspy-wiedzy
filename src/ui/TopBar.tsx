import { AvatarPortrait } from './AvatarPortrait';
import { useApp } from './hooks';
import { Icon } from './icons';

export function TopBar({ back }: { back?: () => void }) {
  const { profile, theme, go, openThemes, switchProfile } = useApp();
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
            <Icon name={theme.icon} size={22} />
          </span>
          <span className="hide-md">{theme.appName}</span>
        </div>
      )}
      <button className="person-btn" onClick={switchProfile} aria-label={`${profile.name} — zmień osobę`}>
        <span className="avatar"><AvatarPortrait value={profile.avatar} /></span>
        <span className="person-btn-text">
          <b>{profile.name}</b>
          <small>zmień osobę</small>
        </span>
      </button>
      <div className="chips">
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
