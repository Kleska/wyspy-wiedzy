import { useEffect, useState } from 'react';
import { store } from '../../data/store';
import { hashId } from '../../dsl';
import { Icon } from '../icons';
import { ParentPanel } from './ParentPanel';

export async function hashPin(pin: string, salt: string): Promise<string> {
  try {
    const data = new TextEncoder().encode(`${salt}:${pin}`);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return 'f' + hashId(`${salt}:${pin}`) + hashId(`${pin}:${salt}`);
  }
}

/** Nowy PIN ma zawsze tyle cyfr. Starsze, krótsze PIN-y nadal wpuszczają, ale od razu trzeba ustawić nowy. */
export const PIN_LENGTH = 6;
const OLD_PIN_MIN = 4;

/** `min` — ile cyfr trzeba wpisać, żeby zatwierdzić (nowy PIN: 6; stary mógł mieć 4–6). */
function PinPad({ title, sub, onDone, error, min = PIN_LENGTH }: { title: string; sub?: string; onDone: (pin: string) => void; error?: string; min?: number }) {
  const [pin, setPin] = useState('');
  const press = (d: string) => setPin((cur) => (cur + d).slice(0, PIN_LENGTH));
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') setPin((cur) => cur.slice(0, -1));
      else if (e.key === 'Enter') {
        setPin((cur) => {
          if (cur.length >= min) setTimeout(() => onDone(cur), 0);
          return cur.length >= min ? '' : cur;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDone, min]);
  return (
    <div className="col" style={{ gap: 18, alignItems: 'center' }}>
      <h1 style={{ fontSize: 26, textAlign: 'center' }}>{title}</h1>
      {sub && (
        <p className="muted" style={{ fontWeight: 600, textAlign: 'center', maxWidth: 360 }}>
          {sub}
        </p>
      )}
      <div className="pin-dots" aria-label={`Wpisano ${pin.length} cyfr`}>
        {Array.from({ length: Math.max(min, pin.length) }, (_, i) => (
          <span key={i} className={i < pin.length ? 'on' : ''} />
        ))}
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="pin-pad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} onClick={() => press(d)}>
            {d}
          </button>
        ))}
        <button onClick={() => setPin(pin.slice(0, -1))} aria-label="Usuń cyfrę">
          ⌫
        </button>
        <button onClick={() => press('0')}>0</button>
        <button
          onClick={() => {
            if (pin.length >= min) {
              onDone(pin);
              setPin('');
            }
          }}
          aria-label="Zatwierdź"
          disabled={pin.length < min}
          style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
        >
          OK
        </button>
      </div>
    </div>
  );
}

export function ParentGate({ onExit }: { onExit: () => void }) {
  const s = store.settings;
  const [pin, setPin] = useState<string | null>(null);
  const [first, setFirst] = useState<string | null>(null);
  const [err, setErr] = useState('');
  // Wpisano poprawny, ale stary (krótszy) PIN: zanim wpuścimy do panelu, trzeba ustawić nowy, 6-cyfrowy.
  const [upgrade, setUpgrade] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const st = store.state;
  const canReset = st.cloud && st.auth.status === 'signedIn';

  const resetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      if (await store.verifyPassword(password)) {
        // Hasło się zgadza: kasujemy stary PIN — ekran poprosi o ustawienie nowego.
        await store.saveSettings({ parentPinHash: undefined, pinSalt: undefined, pinLength: undefined });
        setForgot(false);
        setFirst(null);
      } else {
        setErr('Złe hasło.');
      }
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
    } finally {
      setPassword('');
      setBusy(false);
    }
  };

  if (pin) return <ParentPanel pin={pin} onExit={onExit} />;

  const hasPin = !!s.parentPinHash && !upgrade;
  return (
    <div className="parent">
      <div className="center-screen">
        <div className="card col" style={{ maxWidth: 440, width: '100%', gap: 16 }}>
          <button className="btn btn-sm" style={{ alignSelf: 'flex-start' }} onClick={onExit}>
            <Icon name="chevronLeft" size={18} /> Wróć
          </button>
          {hasPin && forgot ? (
            <form className="col" style={{ gap: 12 }} onSubmit={resetPin}>
              <h1 style={{ fontSize: 26 }}>Nowy PIN rodzica</h1>
              <p className="muted" style={{ fontWeight: 600 }}>
                Wpisz hasło konta rodziny ({st.auth.email}). Potem ustawisz nowy PIN — będzie obowiązywał na wszystkich urządzeniach.
              </p>
              <label className="field">
                <span>Hasło konta rodziny</span>
                <input className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
              </label>
              {err && (
                <p className="error" role="alert">
                  {err}
                </p>
              )}
              <div className="row" style={{ flexWrap: 'wrap' }}>
                <button className="btn btn-primary" disabled={busy || !password}>
                  {busy ? 'Sprawdzam…' : 'Dalej'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setForgot(false);
                    setErr('');
                  }}
                >
                  Anuluj
                </button>
              </div>
            </form>
          ) : hasPin ? (
            <>
              <PinPad
                title="Panel rodzica"
                sub="Wpisz PIN rodzica."
                error={err}
                min={s.pinLength === PIN_LENGTH ? PIN_LENGTH : OLD_PIN_MIN}
                onDone={async (p) => {
                  const h = await hashPin(p, s.pinSalt ?? '');
                  if (h !== s.parentPinHash) return setErr('Zły PIN.');
                  setErr('');
                  if (p.length < PIN_LENGTH) {
                    setFirst(null);
                    setUpgrade(true);
                  } else setPin(p);
                }}
              />
              {canReset ? (
                <button
                  className="btn btn-sm"
                  style={{ alignSelf: 'center' }}
                  onClick={() => {
                    setForgot(true);
                    setErr('');
                  }}
                >
                  Nie pamiętam PIN-u
                </button>
              ) : (
                <p className="muted" style={{ fontSize: 13, textAlign: 'center' }}>
                  PIN jest zapisany tylko na tym urządzeniu. Po włączeniu konta rodziny zapomniany PIN ustawisz od nowa hasłem konta.
                </p>
              )}
            </>
          ) : first === null ? (
            <PinPad
              title={upgrade ? 'Ustaw nowy PIN (6 cyfr)' : 'Ustaw PIN rodzica'}
              sub={
                upgrade
                  ? 'Dotychczasowy PIN był krótszy. Od teraz PIN rodzica ma 6 cyfr — ustaw nowy.'
                  : '6 cyfr. PIN chroni panel rodzica i generowanie zadań przez AI.'
              }
              error={err}
              onDone={(p) => {
                setFirst(p);
                setErr('');
              }}
            />
          ) : (
            <PinPad
              title="Powtórz PIN"
              error={err}
              onDone={async (p) => {
                if (p !== first) {
                  setErr('PIN-y się różnią. Zacznij od nowa.');
                  setFirst(null);
                  return;
                }
                const salt = Math.random().toString(36).slice(2);
                await store.saveSettings({ parentPinHash: await hashPin(p, salt), pinSalt: salt, pinLength: PIN_LENGTH });
                setUpgrade(false);
                setPin(p);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
