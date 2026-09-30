import { useState } from 'react';
import { subjectOf } from '../../content/seed';
import { store } from '../../data/store';
import { dateKey } from '../../engine';
import { TYPE_LABEL } from '../../dsl';
import { exerciseSummary } from '../exercises/logic';
import { useProgress } from '../hooks';
import { Stars } from '../icons';

const DAY_NAMES = ['nd', 'pn', 'wt', 'śr', 'cz', 'pt', 'sb'];

function fmtMin(sec: number) {
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

export function ParentStats() {
  const profiles = store.list('profile').sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const [pid, setPid] = useState(profiles[0]?.id ?? null);
  const progress = useProgress(pid);
  if (!pid || !progress) return <p>Brak profilu ucznia.</p>;
  const topics = store.allTopics();

  const days: { key: string; label: string; sec: number; answered: number; correct: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = dateKey(d);
    const ds = progress.days.get(k);
    days.push({ key: k, label: `${DAY_NAMES[d.getDay()]} ${d.getDate()}`, sec: ds?.seconds ?? 0, answered: ds?.answered ?? 0, correct: ds?.correct ?? 0 });
  }
  const last7 = days.slice(7);
  const week = last7.reduce((a, d) => a + d.sec, 0);
  const wAns = last7.reduce((a, d) => a + d.answered, 0);
  const wCor = last7.reduce((a, d) => a + d.correct, 0);
  const maxSec = Math.max(60 * store.settings.dailyGoalMinutes, ...days.map((d) => d.sec));

  const weak: { topic: string; exText: string; type: string; wrong: number; right: number }[] = [];
  for (const t of topics) {
    const s = progress.topics.get(t.id);
    for (const w of s?.weak ?? []) {
      const ex = t.exercises.find((e) => e.id === w.exerciseId);
      if (ex) weak.push({ topic: t.title, exText: `${ex.prompt} — ${exerciseSummary(ex)}`, type: TYPE_LABEL[ex.type], wrong: w.wrong, right: w.right });
    }
  }
  weak.sort((a, b) => b.wrong - a.wrong || a.right - b.right);

  const sessions = store
    .list('session')
    .filter((s) => s.profileId === pid && s.answered > 0)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, 15);

  const practiced = topics.filter((t) => (progress.topics.get(t.id)?.seen ?? 0) > 0);

  return (
    <>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <h1 style={{ flex: 1 }}>Postępy</h1>
        {profiles.length > 1 && (
          <select className="select" style={{ width: 'auto' }} value={pid} onChange={(e) => setPid(e.target.value)} aria-label="Uczeń">
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.avatar} {p.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="kpis">
        <div className="card kpi">
          <b>{fmtMin(progress.today.seconds)}</b>
          <span>dziś (cel {store.settings.dailyGoalMinutes} min)</span>
        </div>
        <div className="card kpi">
          <b>{fmtMin(week)}</b>
          <span>ostatnie 7 dni</span>
        </div>
        <div className="card kpi">
          <b>{wAns ? Math.round((wCor / wAns) * 100) : 0}%</b>
          <span>poprawnych (7 dni, {wAns} odp.)</span>
        </div>
        <div className="card kpi">
          <b>{progress.streak}</b>
          <span>dni z rzędu (rekord {progress.bestStreak})</span>
        </div>
        <div className="card kpi">
          <b>{fmtMin(progress.totalSeconds)}</b>
          <span>łącznie · poziom {progress.level}</span>
        </div>
      </div>

      <section className="card">
        <h2 className="card-title">Czas nauki — ostatnie 14 dni</h2>
        <div className="chart" role="img" aria-label="Minuty nauki dziennie przez ostatnie 14 dni">
          {days.map((d, i) => (
            <div key={d.key} className={`chart-col ${i === days.length - 1 ? 'show' : ''}`} title={`${d.label}: ${Math.round(d.sec / 60)} min, ${d.answered} odpowiedzi`}>
              <span className="chart-val" style={{ bottom: `calc(${(d.sec / maxSec) * 100}% + 4px)` }}>
                {Math.round(d.sec / 60)} min
              </span>
              <div className="chart-bar" style={{ height: `${(d.sec / maxSec) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="chart-days">
          {days.map((d) => (
            <span key={d.key}>{d.label}</span>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="card-title">Tematy</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Temat</th>
                <th>Opanowanie</th>
                <th>Odpowiedzi</th>
                <th>Poprawność</th>
                <th>Do powtórki</th>
                <th>Ostatnio</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((t) => {
                const s = progress.topics.get(t.id);
                return (
                  <tr key={t.id}>
                    <td>
                      <b>{t.title}</b>
                      <div className="muted" style={{ fontSize: 12 }}>
                        {subjectOf(t.subject).name}
                      </div>
                    </td>
                    <td>
                      <span style={{ color: '#b8860b' }}>
                        <Stars n={s?.stars ?? 0} size={14} />
                      </span>{' '}
                      {Math.round((s?.mastery ?? 0) * 100)}%
                    </td>
                    <td>{s?.answered ?? 0}</td>
                    <td>{s?.accuracy != null ? `${Math.round(s.accuracy * 100)}%` : '—'}</td>
                    <td>{s?.dueCount ?? 0}</td>
                    <td>{s?.lastAt ? new Date(s.lastAt).toLocaleDateString('pl-PL') : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {practiced.length === 0 && <p className="muted">Uczeń jeszcze nie ćwiczył.</p>}
      </section>

      <section className="card">
        <h2 className="card-title">Co sprawia kłopot</h2>
        {weak.length === 0 ? (
          <p className="muted">Na razie brak błędów do pokazania.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Zadanie</th>
                  <th>Temat</th>
                  <th>Błędy</th>
                  <th>Dobrze</th>
                </tr>
              </thead>
              <tbody>
                {weak.slice(0, 12).map((w, i) => (
                  <tr key={i}>
                    <td>
                      {w.exText}
                      <div className="muted" style={{ fontSize: 12 }}>
                        {w.type}
                      </div>
                    </td>
                    <td>{w.topic}</td>
                    <td>
                      <span className="pill bad">{w.wrong}</span>
                    </td>
                    <td>
                      <span className="pill good">{w.right}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="card-title">Ostatnie sesje</h2>
        {sessions.length === 0 ? (
          <p className="muted">Brak sesji.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Kiedy</th>
                  <th>Temat</th>
                  <th>Wynik</th>
                  <th>Czas</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id}>
                    <td>{new Date(s.startedAt).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td>{s.topicId ? topics.find((t) => t.id === s.topicId)?.title ?? '(usunięty temat)' : 'Powtórka'}</td>
                    <td>
                      {s.correct}/{s.answered}
                    </td>
                    <td>{fmtMin(s.activeSeconds)}</td>
                    <td>{s.completed ? <span className="pill good">ukończona</span> : <span className="pill">przerwana</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
