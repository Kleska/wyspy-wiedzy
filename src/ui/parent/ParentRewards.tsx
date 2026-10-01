import { useState } from 'react';
import { REWARD_IDEAS } from '../../content/rewardIdeas';
import { nowIso, store, uid } from '../../data/store';
import { familyGoalProgress } from '../../engine';
import type { Reward } from '../../types';
import { askConfirm } from '../dialogs';
import { useProgress, useStoreVersion } from '../hooks';
import { Icon } from '../icons';

function Balance({ profileId }: { profileId: string }) {
  const p = useProgress(profileId);
  return <>{p?.coins ?? 0}</>;
}

export function ParentRewards() {
  useStoreVersion();
  const settings = store.settings;
  const profiles = store.profiles();
  const everyone = store.list('profile');
  const name = (id: string) => everyone.find((p) => p.id === id)?.name ?? '?';
  const all = store.list('redemption').sort((a, b) => b.at.localeCompare(a.at));
  const pending = all.filter((r) => r.status === 'pending');
  const history = all.filter((r) => r.status !== 'pending' && r.real).slice(0, 30);
  const [draft, setDraft] = useState<Reward[]>(settings.rewards);
  const [saved, setSaved] = useState(false);

  const decide = (id: string, status: 'approved' | 'rejected') => {
    const r = store.get('redemption', id);
    if (r) void store.put('redemption', { ...r, status, decidedAt: nowIso() });
  };

  const addIdea = async (title: string, cost: number) => {
    const next = [...draft, { id: `r-${uid().slice(0, 8)}`, title, cost }];
    setDraft(next);
    await store.saveSettings({ rewards: next.filter((r) => r.title.trim()) });
  };
  const has = (title: string) => draft.some((r) => r.title.trim().toLowerCase() === title.toLowerCase());

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
          Dziecko zdobywa około 20–40 punktów za jedno ćwiczenie, 20 za komplet zadań dnia, 50 za cel tygodnia i premie za serię dni. Przy 15–20 minutach
          dziennie to mniej więcej 250–350 punktów tygodniowo. Aktualne saldo:{' '}
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

      <FamilyGoalEditor />

      <section className="card col" style={{ gap: 12 }}>
        <h2 className="card-title" style={{ margin: 0 }}>
          Pomysły na nagrody
        </h2>
        <p className="muted" style={{ fontSize: 14 }}>
          Kliknij „Dodaj”, a nagroda od razu pojawi się w sklepie dziecka. Cenę możesz potem zmienić wyżej.
        </p>
        {REWARD_IDEAS.map((g) => (
          <div key={g.group} className="idea-group">
            <div>
              <b>{g.group}</b> <span className="muted" style={{ fontSize: 14 }}>— {g.hint}</span>
            </div>
            <div className="idea-list">
              {g.items.map((it) => (
                <div key={it.title} className="idea">
                  <span style={{ flex: 1 }}>{it.title}</span>
                  <span className="muted" style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
                    {it.cost} pkt
                  </span>
                  <button className="btn btn-sm" disabled={has(it.title)} onClick={() => addIdea(it.title, it.cost)}>
                    {has(it.title) ? 'Dodano' : 'Dodaj'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
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

const GOAL_TARGETS = [200, 300, 500, 800, 1000];

function FamilyGoalEditor() {
  const goal = store.settings.familyGoal;
  const profiles = store.profiles();
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState(300);
  if (goal) {
    const fp = familyGoalProgress(goal, store.list('attempt'), store.list('session'), profiles.map((p) => p.id));
    return (
      <section className="card col" style={{ gap: 12 }}>
        <h2 className="card-title" style={{ margin: 0 }}>
          Wspólny cel rodziny
        </h2>
        <b style={{ fontSize: 20 }}>{goal.title}</b>
        <div className="bar" aria-label="Postęp wspólnego celu">
          <span style={{ width: `${Math.min(100, Math.round((fp.total / goal.target) * 100))}%` }} />
        </div>
        <p style={{ fontWeight: 700 }}>
          {Math.min(fp.total, goal.target)} / {goal.target} dobrych odpowiedzi od {new Date(goal.startAt).toLocaleDateString('pl-PL')}
          {' · '}
          {profiles.map((p) => `${p.name}: ${fp.per.get(p.id) ?? 0}`).join(', ')}
        </p>
        {fp.done && <div className="note">Cel osiągnięty! Czas na wspólną nagrodę. Potem zakończ ten cel i ustaw nowy.</div>}
        <div>
          <button
            className="btn btn-sm btn-danger"
            onClick={async () => (await askConfirm(`Zakończyć cel „${goal.title}”?`, { ok: 'Zakończ', danger: true })) && void store.saveSettings({ familyGoal: null })}
          >
            Zakończ cel
          </button>
        </div>
      </section>
    );
  }
  return (
    <section className="card col" style={{ gap: 12 }}>
      <h2 className="card-title" style={{ margin: 0 }}>
        Wspólny cel rodziny
      </h2>
      <p className="muted" style={{ fontSize: 14 }}>
        Rodzeństwo zbiera razem dobre odpowiedzi na jedną nagrodę — zamiast rywalizować, pomaga sobie nawzajem. Dwoje dzieci ćwiczących codziennie zbiera
        mniej więcej 150–250 dobrych odpowiedzi tygodniowo.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <label className="field">
          <span>Nagroda</span>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} placeholder="np. Wyjście do kina całą rodziną" />
        </label>
        <label className="field">
          <span>Ile dobrych odpowiedzi razem?</span>
          <select className="select" value={target} onChange={(e) => setTarget(Number(e.target.value))}>
            {GOAL_TARGETS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <button
          className="btn btn-primary btn-sm"
          disabled={!title.trim()}
          onClick={() => void store.saveSettings({ familyGoal: { id: uid(), title: title.trim(), target, startAt: nowIso() } })}
        >
          <Icon name="heart" size={16} /> Rozpocznij wspólny cel
        </button>
      </div>
    </section>
  );
}
