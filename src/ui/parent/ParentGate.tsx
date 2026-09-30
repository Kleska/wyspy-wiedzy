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

function PinPad({ title, sub, onDone, error }: { title: string; sub?: string; onDone: (pin: string) => void; error?: string }) {
  const [pin, setPin] = useState('');
  const press = (d: string) => setPin((cur) => (cur + d).slice(0, 6));
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') setPin((cur) => cur.slice(0, -1));
      else if (e.key === 'Enter') {
        setPin((cur) => {
          if (cur.length >= 4) setTimeout(() => onDone(cur), 0);
          return cur.length >= 4 ? '' : cur;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDone]);
  return (
    <div className="col" style={{ gap: 18, alignItems: 'center' }}>
      <h1 style={{ fontSize: 26, textAlign: 'center' }}>{title}</h1>
      {sub && (
        <p className="muted" style={{ fontWeight: 600, textAlign: 'center', maxWidth: 360 }}>
          {sub}
        </p>
      )}
      <div className="pin-dots" aria-label={`Wpisano ${pin.length} cyfr`}>
        {Array.from({ length: Math.max(4, pin.length) }, (_, i) => (
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
            if (pin.length >= 4) {
              onDone(pin);
              setPin('');
            }
          }}
          aria-label="Zatwierdź"
          disabled={pin.length < 4}
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

  if (pin) return <ParentPanel pin={pin} onExit={onExit} />;

  const hasPin = !!s.parentPinHash;
  return (
    <div className="parent">
      <div className="center-screen">
        <div className="card col" style={{ maxWidth: 440, width: '100%', gap: 16 }}>
          <button className="btn btn-sm" style={{ alignSelf: 'flex-start' }} onClick={onExit}>
            <Icon name="chevronLeft" size={18} /> Wróć
          </button>
          {hasPin ? (
            <PinPad
              title="Panel rodzica"
              sub="Wpisz PIN rodzica."
              error={err}
              onDone={async (p) => {
                const h = await hashPin(p, s.pinSalt ?? '');
                if (h === s.parentPinHash) setPin(p);
                else setErr('Zły PIN.');
              }}
            />
          ) : first === null ? (
            <PinPad
              title="Ustaw PIN rodzica"
              sub="4–6 cyfr. PIN chroni panel rodzica i generowanie zadań przez AI. Użyj tego samego PIN-u w ustawieniach chmury (PARENT_PIN)."
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
                await store.saveSettings({ parentPinHash: await hashPin(p, salt), pinSalt: salt });
                setPin(p);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
