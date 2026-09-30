import { useState } from 'react';
import { nowIso, store, uid } from '../../data/store';
import type { Reward } from '../../types';
import { useProgress } from '../hooks';
import { Icon } from '../icons';

function Balance({ profileId }: { profileId: string }) {
  const p = useProgress(profileId);
  return <>{p?.coins ?? 0}</>;
}

export function ParentRewards() {
  const settings = store.settings;
  const profiles = store.list('profile');
  const name = (id: string) => profiles.find((p) => p.id === id)?.name ?? '?';
  const all = store.list('redemption').sort((a, b) => b.at.localeCompare(a.at));
  const pending = all.filter((r) => r.status === 'pending');
  const history = all.filter((r) => r.status !== 'pending' && r.real).slice(0, 30);
  const [draft, setDraft] = useState<Reward[]>(settings.rewards);
  const [saved, setSaved] = useState(false);

  const decide = (id: string, status: 'approved' | 'rejected') => {
    const r = store.get('redemption', id);
    if (r) void store.put('redemption', { ...r, status, decidedAt: nowIso() });
  };

  const saveRewards = async () => {
    const clean = draft.filter((r) => r.title.trim()).map((r) => ({ ...r, title: r.title.trim(), cost: Math.max(1, Math.round(r.cost) || 1) }));
    await store.saveSettings({ rewards: clean });
    setDraft(clean);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <h1>Nagrody</h1>
      <section className="card">
        <h2 className="card-title">Prośby do zatwierdzenia</h2>
        {pending.length === 0 ? (
          <p className="muted">Brak nowych próśb.</p>
        ) : (
          <div className="col">
            {pending.map((r) => (
              <div key={r.id} className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
                <div>
                  <b>{r.title}</b> — {r.cost} pkt
                  <div className="muted" style={{ fontSize: 13 }}>
                    {name(r.profileId)} · {new Date(r.at).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
                <div className="row">
                  <button className="btn btn-primary btn-sm" onClick={() => decide(r.id, 'approved')}>
                    <Icon name="check" size={16} /> Zatwierdź
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => decide(r.id, 'rejected')}>
                    <Icon name="x" size={16} /> Odrzuć (zwrot)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card col" style={{ gap: 12 }}>
        <h2 className="card-title" style={{ margin: 0 }}>
          Prawdziwe nagrody do wyboru
        </h2>
        <p className="muted" style={{ fontSize: 14 }}>
          Dziecko zdobywa około 20–40 punktów za jedno ćwiczenie i do 20 za komplet zadań dnia. Aktualne saldo:{' '}
          {profiles.map((p, i) => (
            <span key={p.id}>
              {i > 0 && ', '}
              {p.name}: <b>
                <Balance profileId={p.id} />
              </b>
            </span>
          ))}
          .
        </p>
        {draft.map((r, i) => (
          <div key={r.id} className="row" style={{ flexWrap: 'wrap' }}>
            <input className="input" style={{ flex: '1 1 220px' }} value={r.title} onChange={(e) => setDraft(draft.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} aria-label="Nazwa nagrody" />
            <input
              className="input"
              style={{ width: 110 }}
              type="number"
              min={1}
              value={r.cost}
              onChange={(e) => setDraft(draft.map((x, j) => (j === i ? { ...x, cost: Number(e.target.value) } : x)))}
              aria-label="Koszt w punktach"
            />
            <button className="btn btn-sm btn-danger" onClick={() => setDraft(draft.filter((_, j) => j !== i))} aria-label="Usuń nagrodę">
              <Icon name="trash" size={16} />
            </button>
          </div>
        ))}
        <div className="row">
          <button className="btn btn-sm" onClick={() => setDraft([...draft, { id: `r-${uid().slice(0, 8)}`, title: '', cost: 100 }])}>
            <Icon name="plus" size={16} /> Dodaj nagrodę
          </button>
          <button className="btn btn-primary btn-sm" onClick={saveRewards}>
            {saved ? 'Zapisano' : 'Zapisz nagrody'}
          </button>
        </div>
      </section>

      <section className="card">
        <h2 className="card-title">Historia</h2>
        {history.length === 0 ? (
          <p className="muted">Pusto.</p>
        ) : (
          <table className="table">
            <tbody>
              {history.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.at).toLocaleDateString('pl-PL')}</td>
                  <td>{name(r.profileId)}</td>
                  <td>{r.title}</td>
                  <td>{r.cost}</td>
                  <td>{r.status === 'approved' ? <span className="pill good">zatwierdzona</span> : <span className="pill bad">odrzucona</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
