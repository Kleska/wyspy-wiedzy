import { useState } from 'react';
import { nowIso, store, uid } from '../data/store';
import { THEME_ORDER, THEMES } from '../themes';
import type { Profile, ThemeId } from '../types';

export const FREE_AVATARS = ['🦊', '🐼', '🐸', '🦉', '🐢', '🐙', '🐶', '🐱'];
export const GRADES = [1, 2, 3, 4, 5, 6, 7, 8];

export function Onboarding({ onDone, onCancel, first = true }: { onDone: (id: string) => void; onCancel?: () => void; first?: boolean }) {
  const taken = new Set(store.list('profile').map((p) => p.avatar));
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<number | null>(null);
  const [avatar, setAvatar] = useState(FREE_AVATARS.find((a) => !taken.has(a)) ?? FREE_AVATARS[0]);
  const [theme, setTheme] = useState<ThemeId>('wyspy');
  const [err, setErr] = useState('');
  const create = async () => {
    if (!name.trim()) return setErr('Wpisz imię.');
    if (!grade) return setErr('Wybierz klasę.');
    const p: Profile = { id: uid(), name: name.trim(), avatar, theme, grade, createdAt: nowIso(), updatedAt: nowIso() };
    await store.put('profile', p);
    onDone(p.id);
  };
  return (
    <div className="center-screen">
      <div className="card col onboarding" style={{ maxWidth: 680, width: '100%', gap: 22 }}>
        <h1 style={{ fontSize: 34 }}>{first ? 'Witaj w Wyspach Wiedzy!' : 'Nowa osoba'}</h1>
        <label className="field">
          <span>Imię</span>
          <input id="ob-name" className="input input-lg" value={name} onChange={(e) => setName(e.target.value)} maxLength={20} autoComplete="off" placeholder="Imię" />
        </label>
        <div className="field">
          <span>Klasa</span>
          <div className="grade-grid" role="group" aria-label="Klasa">
            {GRADES.map((g) => (
              <button key={g} type="button" aria-pressed={grade === g} onClick={() => setGrade(g)}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <span>Bohater</span>
          <div className="emoji-grid">
            {FREE_AVATARS.map((a) => (
              <button key={a} aria-pressed={a === avatar} onClick={() => setAvatar(a)} aria-label={`Awatar ${a}`}>
                {a}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <span>Wygląd (można zmienić w każdej chwili)</span>
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
        {err && (
          <p className="error" role="alert">
            {err}
          </p>
        )}
        <div className="row" style={{ flexWrap: 'wrap' }}>
          {onCancel && (
            <button className="btn btn-lg" onClick={onCancel}>
              Anuluj
            </button>
          )}
          <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={create}>
            {first ? 'Zaczynamy!' : 'Dodaj'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProfilePicker({ profiles, onPick, onCancel }: { profiles: Profile[]; onPick: (id: string) => void; onCancel?: () => void }) {
  const [adding, setAdding] = useState(false);
  if (adding) return <Onboarding first={false} onDone={onPick} onCancel={() => setAdding(false)} />;
  return (
    <div className="center-screen">
      <div className="col" style={{ maxWidth: 760, width: '100%', gap: 22 }}>
        <h1 style={{ fontSize: 36, textAlign: 'center' }}>Kto się dziś uczy?</h1>
        <div className="people">
          {profiles.map((p) => (
            <button key={p.id} className="person" onClick={() => onPick(p.id)}>
              <span className="avatar avatar-xl">{p.avatar}</span>
              <span className="person-name">{p.name}</span>
              <span className="person-grade">klasa {p.grade ?? 3}</span>
            </button>
          ))}
          <button className="person person-add" onClick={() => setAdding(true)}>
            <span className="avatar avatar-xl" aria-hidden="true">
              +
            </span>
            <span className="person-name">Dodaj osobę</span>
          </button>
        </div>
        {onCancel && (
          <button className="btn" style={{ alignSelf: 'center' }} onClick={onCancel}>
            Wróć
          </button>
        )}
      </div>
    </div>
  );
}
