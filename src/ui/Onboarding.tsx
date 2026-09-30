import { useState } from 'react';
import { nowIso, store, uid } from '../data/store';
import { THEME_ORDER, THEMES } from '../themes';
import type { Profile, ThemeId } from '../types';

export const FREE_AVATARS = ['🦊', '🐼', '🐸', '🦉', '🐢', '🐙', '🐶', '🐱'];

export function Onboarding({ onDone }: { onDone: (id: string) => void }) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(FREE_AVATARS[0]);
  const [theme, setTheme] = useState<ThemeId>('wyspy');
  const create = async () => {
    const p: Profile = { id: uid(), name: name.trim() || 'Odkrywca', avatar, theme, createdAt: nowIso(), updatedAt: nowIso() };
    await store.put('profile', p);
    onDone(p.id);
  };
  return (
    <div className="center-screen">
      <div className="card col" style={{ maxWidth: 620, width: '100%', gap: 18 }}>
        <h1 style={{ fontSize: 32 }}>Witaj w Wyspach Wiedzy!</h1>
        <label className="field">
          <span>Jak masz na imię?</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={20} autoComplete="off" placeholder="Imię" />
        </label>
        <div className="field">
          <span>Wybierz swojego bohatera</span>
          <div className="emoji-grid">
            {FREE_AVATARS.map((a) => (
              <button key={a} aria-pressed={a === avatar} onClick={() => setAvatar(a)} aria-label={`Awatar ${a}`}>
                {a}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <span>Wygląd (możesz zmienić w każdej chwili)</span>
          <div className="theme-cards">
            {THEME_ORDER.map((id) => (
              <button key={id} className="theme-card" aria-pressed={theme === id} onClick={() => setTheme(id)}>
                <span className="swatches">
                  {THEMES[id].swatch.map((c) => (
                    <span key={c} style={{ background: c }} />
                  ))}
                </span>
                <span className="theme-name">{THEMES[id].name}</span>
              </button>
            ))}
          </div>
        </div>
        <button className="btn btn-primary btn-lg" onClick={create}>
          Zaczynamy!
        </button>
      </div>
    </div>
  );
}

export function ProfilePicker({ profiles, onPick, onCancel }: { profiles: Profile[]; onPick: (id: string) => void; onCancel?: () => void }) {
  return (
    <div className="center-screen">
      <div className="card col" style={{ maxWidth: 560, width: '100%', gap: 18 }}>
        <h1 style={{ fontSize: 30 }}>Kto się dziś uczy?</h1>
        <div className="grid-cards">
          {profiles.map((p) => (
            <button key={p.id} className="theme-card" style={{ alignItems: 'center' }} onClick={() => onPick(p.id)}>
              <span className="avatar avatar-lg">{p.avatar}</span>
              <span className="theme-name">{p.name}</span>
            </button>
          ))}
        </div>
        {onCancel && (
          <button className="btn" onClick={onCancel}>
            Anuluj
          </button>
        )}
      </div>
    </div>
  );
}
