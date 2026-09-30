import { useEffect, useRef, useState } from 'react';

/*
 * Własne okna potwierdzenia i wpisywania tekstu zamiast window.confirm/prompt
 * (te na iPadzie w trybie aplikacji wyglądają obco, a w niektórych osadzeniach w ogóle nie działają).
 */

interface Req {
  kind: 'confirm' | 'text';
  message: string;
  ok: string;
  cancel: string;
  danger?: boolean;
  resolve: (v: unknown) => void;
}

let push: ((r: Req) => void) | null = null;

export function askConfirm(message: string, opts: { ok?: string; cancel?: string; danger?: boolean } = {}): Promise<boolean> {
  return new Promise((resolve) => {
    if (!push) return resolve(false);
    push({ kind: 'confirm', message, ok: opts.ok ?? 'Tak', cancel: opts.cancel ?? 'Anuluj', danger: opts.danger, resolve: resolve as (v: unknown) => void });
  });
}

export function askText(message: string, opts: { ok?: string } = {}): Promise<string | null> {
  return new Promise((resolve) => {
    if (!push) return resolve(null);
    push({ kind: 'text', message, ok: opts.ok ?? 'OK', cancel: 'Anuluj', resolve: resolve as (v: unknown) => void });
  });
}

export function DialogHost() {
  const [req, setReq] = useState<Req | null>(null);
  const [text, setText] = useState('');
  const okRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    push = (r) => {
      setText('');
      setReq(r);
    };
    return () => {
      push = null;
    };
  }, []);

  useEffect(() => {
    if (!req) return;
    (req.kind === 'text' ? inputRef.current : okRef.current)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(req.kind === 'text' ? null : false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [req]);

  if (!req) return null;
  function close(v: unknown) {
    req!.resolve(v);
    setReq(null);
  }
  return (
    <div className="modal-backdrop" style={{ zIndex: 95 }}>
      <form
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-label={req.message}
        style={{ maxWidth: 440 }}
        onSubmit={(e) => {
          e.preventDefault();
          close(req.kind === 'text' ? text.trim() || null : true);
        }}
      >
        <p style={{ fontWeight: 800, fontSize: 19, lineHeight: 1.35 }}>{req.message}</p>
        {req.kind === 'text' && <input ref={inputRef} id="dialog-text" className="input" value={text} onChange={(e) => setText(e.target.value)} maxLength={40} aria-label={req.message} />}
        <div className="row" style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button type="button" className="btn" onClick={() => close(req.kind === 'text' ? null : false)}>
            {req.cancel}
          </button>
          <button ref={okRef} type="submit" className={`btn ${req.danger ? 'btn-danger' : 'btn-primary'}`}>
            {req.ok}
          </button>
        </div>
      </form>
    </div>
  );
}
