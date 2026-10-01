import { useRef, useState } from 'react';
import { askConfirm, askText } from '../dialogs';
import { aiMode, getLocalApiKey, setLocalApiKey } from '../../ai';
import { nowIso, store, uid } from '../../data/store';
import { THEMES } from '../../themes';
import { useStoreVersion } from '../hooks';
import { Icon } from '../icons';
import { FREE_AVATARS, GRADES } from '../Onboarding';
import { hashPin } from './ParentGate';

declare const __BUILD_TIME__: string;

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ParentSettings() {
  useStoreVersion();
  const s = store.settings;
  const st = store.state;
  const [key, setKey] = useState(getLocalApiKey());
  const [keySaved, setKeySaved] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const profiles = store.list('profile').sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 2500);
  };

  const syncColor = { local: '#8a94a0', idle: '#1e7a4c', syncing: '#1f5fd6', offline: '#b8860b', error: '#b4441a' }[st.sync.status];
  const syncText = {
    local: 'Tylko to urządzenie (chmura niewłączona)',
    idle: 'Zsynchronizowano',
    syncing: 'Synchronizuję…',
    offline: 'Brak internetu — zapiszę później',
    error: 'Błąd synchronizacji',
  }[st.sync.status];

  return (
    <>
      <h1>Ustawienia</h1>
      {msg && <div className="note" role="status">{msg}</div>}

      <section className="card col" style={{ gap: 14 }}>
        <h2 className="card-title" style={{ margin: 0 }}>
          Nauka
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <label className="field">
            <span>Cel dzienny dla wszystkich (minuty)</span>
            <input className="input" type="number" min={5} max={90} value={s.dailyGoalMinutes} onChange={(e) => void store.saveSettings({ dailyGoalMinutes: Math.min(90, Math.max(5, Number(e.target.value) || 15)) })} />
          </label>
          <label className="field">
            <span>Zadań w jednym ćwiczeniu</span>
            <input className="input" type="number" min={4} max={25} value={s.sessionLength} onChange={(e) => void store.saveSettings({ sessionLength: Math.min(25, Math.max(4, Number(e.target.value) || 10)) })} />
          </label>
        </div>
        <label className="row">
          <input type="checkbox" checked={s.autoRead} onChange={(e) => void store.saveSettings({ autoRead: e.target.checked })} /> Czytaj polecenia na głos automatycznie
        </label>
        <label className="row">
          <input type="checkbox" checked={s.sounds} onChange={(e) => void store.saveSettings({ sounds: e.target.checked })} /> Dźwięki po odpowiedzi
        </label>
      </section>

      <section className="card col" style={{ gap: 12 }}>
        <h2 className="card-title" style={{ margin: 0 }}>
          Uczniowie
        </h2>
        {profiles.map((p) => (
          <div key={p.id} className="row" style={{ flexWrap: 'wrap', borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
            <span style={{ fontSize: 28 }}>{p.avatar}</span>
            <input
              className="input"
              style={{ flex: '1 1 180px' }}
              defaultValue={p.name}
              onBlur={(e) => e.target.value.trim() && e.target.value !== p.name && void store.put('profile', { ...p, name: e.target.value.trim(), updatedAt: nowIso() })}
              aria-label={`Imię: ${p.name}`}
            />
            <label className="row" style={{ gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Klasa</span>
              <select
                className="select"
                style={{ width: 80 }}
                value={p.grade ?? 3}
                onChange={(e) => void store.put('profile', { ...p, grade: Number(e.target.value), updatedAt: nowIso() })}
                aria-label={`Klasa: ${p.name}`}
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
            <label className="row" style={{ gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Cel dzienny</span>
              <select
                className="select"
                style={{ width: 120 }}
                value={p.dailyGoalMinutes ?? 0}
                onChange={(e) => void store.put('profile', { ...p, dailyGoalMinutes: Number(e.target.value) || undefined, updatedAt: nowIso() })}
                aria-label={`Cel dzienny: ${p.name}`}
              >
                <option value={0}>jak wyżej</option>
                {[10, 15, 20, 25, 30, 40, 45, 60].map((m) => (
                  <option key={m} value={m}>
                    {m} min
                  </option>
                ))}
              </select>
            </label>
            <span className="muted" style={{ fontSize: 13 }}>
              wygląd: {THEMES[p.theme].name}
            </span>
          </div>
        ))}
        <div>
          <button
            className="btn btn-sm"
            onClick={async () => {
              const name = await askText('Imię nowego ucznia (klasę ustawisz obok imienia)', { ok: 'Dodaj' });
              if (name?.trim())
                void store.put('profile', { id: uid(), name: name.trim(), avatar: FREE_AVATARS[profiles.length % FREE_AVATARS.length], theme: 'wyspy', grade: 3, createdAt: nowIso(), updatedAt: nowIso() });
            }}
          >
            <Icon name="users" size={16} /> Dodaj ucznia
          </button>
        </div>
      </section>

      <section className="card col" style={{ gap: 12 }}>
        <h2 className="card-title" style={{ margin: 0 }}>
          Synchronizacja
        </h2>
        <div className="row">
          <span className="sync-dot" style={{ background: syncColor }} />
          <b>{syncText}</b>
        </div>
        {st.cloud ? (
          <>
            <p className="muted" style={{ fontSize: 14 }}>
              Konto: {st.auth.email ?? '—'} · ostatnio: {st.sync.lastSync ? new Date(st.sync.lastSync).toLocaleTimeString('pl-PL') : '—'} · czeka na wysłanie:{' '}
              {st.sync.pending}
              {st.sync.error ? ` · ${st.sync.error}` : ''}
            </p>
            <div className="row" style={{ flexWrap: 'wrap' }}>
              <button className="btn btn-sm" onClick={() => void store.sync()}>
                <Icon name="cloud" size={16} /> Synchronizuj teraz
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={async () => (await askConfirm('Wylogować to urządzenie z konta rodziny?', { ok: 'Wyloguj', danger: true })) && void store.signOut()}
              >
                <Icon name="logout" size={16} /> Wyloguj urządzenie
              </button>
            </div>
          </>
        ) : (
          <div className="note">
            Postępy są zapisane tylko na tym urządzeniu. Żeby mieć wspólne postępy na iPadzie, telefonie i komputerze, włącz chmurę — instrukcja w pliku README
            (krok „Supabase”). Po włączeniu dane z tego urządzenia zostaną wysłane do chmury.
          </div>
        )}
        {!st.persistent && (
          <p className="error" style={{ fontSize: 14 }}>
            Ta przeglądarka nie pozwala trwale zapisywać danych (np. tryb prywatny). Postępy znikną po zamknięciu karty, jeśli nie włączysz chmury.
          </p>
        )}
      </section>

      <section className="card col" style={{ gap: 12 }}>
        <h2 className="card-title" style={{ margin: 0 }}>
          AI (generowanie zadań)
        </h2>
        <p style={{ fontSize: 14 }}>
          Tryb: <b>{aiMode() === 'cloud' ? 'przez chmurę (zalecany)' : aiMode() === 'direct' ? 'klucz na tym urządzeniu' : 'wyłączone'}</b>
        </p>
        <label className="field">
          <span>Klucz API Anthropic tylko dla tego urządzenia (opcjonalnie)</span>
          <input className="input" type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="sk-ant-…" autoComplete="off" />
        </label>
        <p className="muted" style={{ fontSize: 13 }}>
          Klucz zostaje w pamięci tej przeglądarki i jest wysyłany bezpośrednio do Anthropic. Wpisuj go tylko na własnym urządzeniu — nie na tablecie dziecka.
          Bezpieczniej: funkcja w chmurze (klucz na serwerze, chroniony PIN-em).
        </p>
        <div className="row">
          <button
            className="btn btn-sm"
            onClick={() => {
              setLocalApiKey(key.trim());
              setKeySaved(true);
              setTimeout(() => setKeySaved(false), 2000);
            }}
          >
            {keySaved ? 'Zapisano' : 'Zapisz klucz'}
          </button>
          {key && (
            <button
              className="btn btn-sm btn-danger"
              onClick={() => {
                setLocalApiKey('');
                setKey('');
              }}
            >
              Usuń klucz
            </button>
          )}
        </div>
      </section>

      <section className="card col" style={{ gap: 12 }}>
        <h2 className="card-title" style={{ margin: 0 }}>
          PIN rodzica
        </h2>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <input className="input" style={{ width: 160 }} inputMode="numeric" maxLength={6} value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))} placeholder="nowy PIN" aria-label="Nowy PIN" />
          <button
            className="btn btn-sm"
            disabled={newPin.length < 4}
            onClick={async () => {
              const salt = Math.random().toString(36).slice(2);
              await store.saveSettings({ parentPinHash: await hashPin(newPin, salt), pinSalt: salt });
              setNewPin('');
              flash('PIN zmieniony. Jeśli używasz AI w chmurze, zmień też sekret PARENT_PIN w Supabase.');
            }}
          >
            Zmień PIN
          </button>
        </div>
      </section>

      <section className="card col" style={{ gap: 12 }}>
        <h2 className="card-title" style={{ margin: 0 }}>
          Kopia zapasowa
        </h2>
        <p className="muted" style={{ fontSize: 14 }}>
          Pełna kopia: uczniowie, tematy, odpowiedzi, sesje, nagrody i ustawienia (plik JSON).
        </p>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-sm" onClick={() => download(`wyspy-wiedzy-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(store.exportAll(), null, 1))}>
            <Icon name="download" size={16} /> Pobierz kopię
          </button>
          <button className="btn btn-sm" onClick={() => fileRef.current?.click()}>
            <Icon name="upload" size={16} /> Wczytaj kopię
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                const n = await store.importAll(JSON.parse(await f.text()));
                flash(`Wczytano ${n} elementów.`);
              } catch (ex) {
                flash(ex instanceof Error ? ex.message : String(ex));
              }
              e.target.value = '';
            }}
          />
        </div>
      </section>

      <p className="muted" style={{ fontSize: 12 }}>
        Wersja z {new Date(__BUILD_TIME__).toLocaleString('pl-PL')}
      </p>
    </>
  );
}
