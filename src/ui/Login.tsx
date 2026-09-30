import { useState } from 'react';
import { store } from '../data/store';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(store.state.auth.error ?? '');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await store.signIn(email.trim(), password);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="center-screen">
      <form className="card col" style={{ maxWidth: 440, width: '100%', gap: 16 }} onSubmit={submit}>
        <h1 style={{ fontSize: 28 }}>Zaloguj konto rodziny</h1>
        <p className="muted" style={{ fontWeight: 700 }}>
          Robi to rodzic, raz na każdym urządzeniu. Dzięki temu postępy są wspólne na iPadzie, telefonie i komputerze.
        </p>
        <label className="field">
          <span>E-mail</span>
          <input className="input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="field">
          <span>Hasło</span>
          <input className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {err && (
          <p className="error" role="alert">
            {err}
          </p>
        )}
        <button className="btn btn-primary btn-lg" disabled={busy}>
          {busy ? 'Loguję…' : 'Zaloguj'}
        </button>
      </form>
    </div>
  );
}
