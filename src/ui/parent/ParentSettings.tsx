import { useRef, useState } from 'react';
import { askConfirm, askText } from '../dialogs';
import { aiMode, getLocalApiKey, setLocalApiKey } from '../../ai';
import { nowIso, store, uid } from '../../data/store';
import { plural, THEME_ORDER, THEMES } from '../../themes';
import { useStoreVersion } from '../hooks';
import { Icon } from '../icons';
import { FREE_AVATARS, GRADES } from '../Onboarding';
import { PAID_AVATARS } from '../Rewards';
import type { Profile, ThemeId } from '../../types';
import { hashPin, PIN_LENGTH } from './ParentGate';

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
  const profiles = store.profiles();

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 2500);
  };

  const signedOut = st.cloud && st.auth.status !== 'signedIn';
  const syncColor = signedOut ? '#b8860b' : { local: '#8a94a0', idle: '#1e7a4c', syncing: '#1f5fd6', offline: '#b8860b', error: '#b4441a' }[st.sync.status];
  const syncStateText = {
    local: 'Tylko to urządzenie (chmura niewłączona)',
    idle: 'Zsynchronizowano',
    syncing: 'Synchronizuję…',
    offline: 'Brak internetu — zapiszę później',
    error: 'Błąd synchronizacji',
  }[st.sync.status];
  const syncText = signedOut ? 'Niezalogowane — tylko to urządzenie' : syncStateText;

  return (
    <>
      <h1>Ustawienia</h1>
      {msg && <div className="note" role="status">{msg}</div>}

      <section className="card col" style={{ gap: 12 }}>
        <h2 className="card-title" style={{ margin: 0 }}>
          Osoby (dzieci)
        </h2>
        <p className="muted" style={{ fontSize: 14 }}>
          Zmiany zapisują się od razu. Imię zapisuje się po wyjściu z pola albo po naciśnięciu Enter. To samo dziecko jest na liście dwa razy (np. po połączeniu
          urządzeń)? Użyj „Połącz z…” — postępy z obu profili się zsumują.
        </p>
        {profiles.map((p) => (
          <ProfileEditor key={p.id} p={p} others={profiles.filter((o) => o.id !== p.id)} onMsg={flash} />
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
          Synchronizacja
        </h2>
        <div className="row">
          <span className="sync-dot" style={{ background: syncColor }} />
          <b>{syncText}</b>
        </div>
        {signedOut ? (
          <>
            <div className="note">
              To urządzenie nie jest zalogowane do konta rodziny, więc działa tylko lokalnie: rodzic nie widzi stąd postępów, a plan i tematy ustawione na innych
              urządzeniach tu nie docierają. Po zalogowaniu dane z tego urządzenia zostaną wysłane do chmury.
            </div>
            <div>
              <button className="btn btn-sm btn-primary" onClick={() => location.reload()}>
                <Icon name="cloud" size={16} /> Zaloguj konto rodziny
              </button>
            </div>
          </>
        ) : st.cloud ? (
          <>
            <p className="muted" style={{ fontSize: 14 }}>
              Konto: {st.auth.email ?? '—'} · ostatnio: {st.sync.lastSync ? new Date(st.sync.lastSync).toLocaleTimeString('pl-PL') : '—'} · czeka na wysłanie:{' '}
              {st.sync.pending}
              {st.sync.error ? ` · ${st.sync.error}` : ''}
            </p>
            <p className="muted" style={{ fontSize: 14 }}>
              Tryb na żywo: <b>{st.sync.live ? 'działa' : 'niepołączony'}</b>. Każde zalogowane urządzenie wysyła odpowiedzi od razu, a zmiany z innych urządzeń dostaje
              na żywo (w razie przerwy w połączeniu — przy otwarciu aplikacji i co minutę). Plan, tematy, nagrody i PIN ustawione tutaj trafią na urządzenia dzieci.
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
            Postępy są zapisane tylko na tym urządzeniu. Żeby widzieć postępy dzieci na swoim telefonie i ustawiać im plan albo tematy zdalnie, włącz konto rodziny
            (instrukcja w pliku README, krok „Supabase”). Po zalogowaniu dane z tego urządzenia zostaną wysłane do chmury.
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
          <input className="input" style={{ width: 200 }} inputMode="numeric" maxLength={PIN_LENGTH} value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))} placeholder="nowy PIN (6 cyfr)" aria-label="Nowy PIN" />
          <button
            className="btn btn-sm"
            disabled={newPin.length !== PIN_LENGTH}
            onClick={async () => {
              const salt = Math.random().toString(36).slice(2);
              await store.saveSettings({ parentPinHash: await hashPin(newPin, salt), pinSalt: salt, pinLength: PIN_LENGTH });
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

const ALL_AVATARS = [...FREE_AVATARS, ...PAID_AVATARS.map((a) => a.emoji)];

function ProfileEditor({ p, others, onMsg }: { p: Profile; others: Profile[]; onMsg: (m: string) => void }) {
  const save = (patch: Partial<Profile>) => void store.put('profile', { ...p, ...patch, updatedAt: nowIso() });
  return (
    <div className="profile-editor">
      <div className="row" style={{ flexWrap: 'wrap', gap: 12 }}>
        <label className="field" style={{ width: 90 }}>
          <span>Bohater</span>
          <select className="select" style={{ fontSize: 24, padding: '4px 8px' }} value={p.avatar} onChange={(e) => save({ avatar: e.target.value })} aria-label={`Bohater: ${p.name}`}>
            {ALL_AVATARS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className="field" style={{ flex: '1 1 180px' }}>
          <span>Imię</span>
          <input
            className="input"
            defaultValue={p.name}
            maxLength={20}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v && v !== p.name) {
                save({ name: v });
                onMsg(`Zapisano imię: ${v}`);
              }
            }}
            aria-label={`Imię: ${p.name}`}
          />
        </label>
        <label className="field" style={{ width: 90 }}>
          <span>Klasa</span>
          <select className="select" value={p.grade ?? 3} onChange={(e) => save({ grade: Number(e.target.value) })} aria-label={`Klasa: ${p.name}`}>
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <label className="field" style={{ width: 140 }}>
          <span>Cel dzienny</span>
          <select className="select" value={p.dailyGoalMinutes ?? 0} onChange={(e) => save({ dailyGoalMinutes: Number(e.target.value) || undefined })} aria-label={`Cel dzienny: ${p.name}`}>
            <option value={0}>jak dla wszystkich</option>
            {[10, 15, 20, 25, 30, 40, 45, 60].map((m) => (
              <option key={m} value={m}>
                {m} min
              </option>
            ))}
          </select>
        </label>
        <label className="field" style={{ width: 180 }}>
          <span>Wygląd</span>
          <select className="select" value={p.theme} onChange={(e) => save({ theme: e.target.value as ThemeId })} aria-label={`Wygląd: ${p.name}`}>
            {THEME_ORDER.map((t) => (
              <option key={t} value={t}>
                {THEMES[t].name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
        {p.resetAt && <span className="muted" style={{ fontSize: 13 }}>Postępy liczone od {new Date(p.resetAt).toLocaleDateString('pl-PL')}</span>}
        <span className="spacer" />
        {others.length > 0 && (
          <select
            className="select"
            style={{ width: 'auto', fontSize: 14, padding: '6px 10px' }}
            value=""
            aria-label={`Połącz z inną osobą: ${p.name}`}
            onChange={async (e) => {
              const to = others.find((o) => o.id === e.target.value);
              if (!to) return;
              const ok = await askConfirm(
                `Połączyć profile: „${p.name}” → „${to.name}”? Odpowiedzi, punkty i nagrody z profilu „${p.name}” przejdą do profilu „${to.name}”, a profil „${p.name}” zniknie z listy. Tego nie da się cofnąć. Zrób to, gdy dziecko akurat nie ćwiczy.`,
                { ok: 'Połącz', danger: true },
              );
              if (!ok) return;
              const n = await store.mergeProfiles(p.id, to.id);
              onMsg(`Połączono: „${p.name}” → „${to.name}” (przeniesiono ${n} ${plural(n, ['zapis', 'zapisy', 'zapisów'])}).`);
            }}
          >
            <option value="">Połącz z…</option>
            {others.map((o) => (
              <option key={o.id} value={o.id}>
                {o.avatar} {o.name} (klasa {o.grade ?? 3})
              </option>
            ))}
          </select>
        )}
        <button
          className="btn btn-sm"
          onClick={async () => {
            if (
              await askConfirm(`Wyzerować postępy: ${p.name}? Punkty, poziom, gwiazdki, seria i odznaki zaczną się od zera. Historii nie kasujemy — zostaje w kopii zapasowej.`, {
                ok: 'Wyzeruj',
                danger: true,
              })
            ) {
              save({ resetAt: nowIso() });
              onMsg(`Postępy osoby ${p.name} zaczynają się od nowa.`);
            }
          }}
        >
          <Icon name="repeat" size={16} /> Zacznij od nowa
        </button>
        <button
          className="btn btn-sm btn-danger"
          onClick={async () => {
            if (await askConfirm(`Usunąć osobę: ${p.name}? Zniknie z listy „Kto się dziś uczy?” na wszystkich urządzeniach.`, { ok: 'Usuń', danger: true })) {
              save({ deleted: true });
              onMsg(`Usunięto: ${p.name}`);
            }
          }}
        >
          <Icon name="trash" size={16} /> Usuń osobę
        </button>
      </div>
    </div>
  );
}
