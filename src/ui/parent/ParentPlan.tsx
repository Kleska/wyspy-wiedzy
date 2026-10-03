import { useState } from 'react';
import { nowIso, store } from '../../data/store';
import { dateKey, GRADE_NAMES, planActive, planExamCount, planStatus } from '../../engine';
import type { Profile } from '../../types';
import { useProgress, useStoreVersion } from '../hooks';
import { Icon } from '../icons';
import { ParentQuiz } from './ParentQuiz';
import { PlanFromPhoto } from './PlanFromPhoto';
import { TopicChecklist } from './TopicChecklist';

export function ParentPlan({ pin }: { pin: string }) {
  useStoreVersion();
  const profiles = store.profiles();
  const [pid, setPid] = useState(profiles[0]?.id ?? null);
  // Po zapisaniu planu ze zdjęcia odświeżamy edytor planu (pokazuje nowe tematy i termin).
  const [ver, setVer] = useState(0);
  const p = pid ? store.get('profile', pid) : undefined;
  if (!p) return <p>Brak profilu ucznia.</p>;
  return (
    <>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <h1 style={{ flex: 1 }}>Plan i sprawdziany</h1>
        {profiles.length > 1 && (
          <select className="select" style={{ width: 'auto' }} value={p.id} onChange={(e) => setPid(e.target.value)} aria-label="Uczeń">
            {profiles.map((x) => (
              <option key={x.id} value={x.id}>
                {x.avatar} {x.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <p className="muted">
        Wszystko tutaj dotyczy jednej osoby (gdy dzieci jest kilka, wybierasz ją u góry). Plan: przypnij tematy, które dziecko ma teraz ćwiczyć (np. przed sprawdzianem w szkole) — zobaczy je na górze ekranu
        startowego, a aplikacja będzie je polecać w pierwszej kolejności. Kartkówka: krótki sprawdzian z wybranych tematów, pisany raz.
      </p>
      <ParentQuiz key={`quiz-${p.id}`} p={p} />
      <PlanEditor key={`${p.id}:${ver}`} p={p} />
      <PlanFromPhoto key={`photo-${p.id}`} p={p} pin={pin} onPlanSaved={() => setVer((v) => v + 1)} />
      <ExamHistory profileId={p.id} />
    </>
  );
}

function PlanEditor({ p }: { p: Profile }) {
  const progress = useProgress(p.id);
  const topics = store.topicsFor(p.id);
  const [sel, setSel] = useState<string[]>(p.plan?.topicIds ?? []);
  const [until, setUntil] = useState(p.plan?.until ?? '');
  const [title, setTitle] = useState(p.plan?.title ?? '');
  const [msg, setMsg] = useState('');
  const active = planActive(p.plan, Date.now());
  const planIds = (p.plan?.topicIds ?? []).filter((id) => topics.some((t) => t.id === id));
  const status = p.plan && progress && planIds.length ? planStatus(p.plan, planIds, progress) : null;

  const save = async () => {
    const plan = sel.length
      ? {
          topicIds: sel,
          until: until || undefined,
          title: title.trim() || undefined,
          setAt: nowIso(),
        }
      : null;
    await store.put('profile', { ...p, plan, planAt: nowIso(), updatedAt: nowIso() });
    setMsg(plan ? `Zapisano plan: ${p.name}.` : 'Plan usunięty.');
    setTimeout(() => setMsg(''), 2500);
  };
  const clear = async () => {
    setSel([]);
    setUntil('');
    setTitle('');
    await store.put('profile', { ...p, plan: null, planAt: nowIso(), updatedAt: nowIso() });
    setMsg('Plan usunięty.');
    setTimeout(() => setMsg(''), 2500);
  };

  return (
    <section className="card col" style={{ gap: 14 }}>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <h2 className="card-title" style={{ margin: 0, flex: 1 }}>
          Plan: {p.name}
        </h2>
        {p.plan && (
          <span className={`pill ${active ? 'good' : ''}`}>
            {active ? 'aktywny' : `minął termin ${p.plan.until ? new Date(p.plan.until + 'T12:00:00').toLocaleDateString('pl-PL') : ''}`}
          </span>
        )}
      </div>
      {msg && (
        <div className="note" role="status">
          {msg}
        </div>
      )}
      {status && (
        <div className={`note ${status.confirmed ? 'good' : ''}`}>
          <b>{status.confirmed ? 'Materiał opanowany — potwierdził to sprawdzian próbny.' : 'Opanowanie materiału jeszcze niepotwierdzone.'}</b> Tematy na poziomie „Biegły”:{' '}
          {status.fluent} z {status.total}.{' '}
          {status.lastExam
            ? `Ostatni sprawdzian próbny (${new Date(status.lastExam.at).toLocaleDateString('pl-PL')}): ${status.lastExam.grade} — ${GRADE_NAMES[status.lastExam.grade]}, ${status.lastExam.correct}/${status.lastExam.total}.`
            : `Sprawdzianu próbnego jeszcze nie było (${planExamCount(status.total)} pytań bez podpowiedzi, dziecko uruchamia go z karty planu).`}{' '}
          {!status.confirmed && 'Potwierdzeniem jest ocena 5 lub 6.'}
        </div>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
        }}
      >
        <label className="field">
          <span>Nazwa (opcjonalnie)</span>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={50} placeholder="np. Sprawdzian z ułamków" />
        </label>
        <label className="field">
          <span>Termin (opcjonalnie)</span>
          <input className="input" type="date" value={until} min={dateKey(Date.now())} onChange={(e) => setUntil(e.target.value)} />
        </label>
      </div>
      <TopicChecklist topics={topics} sel={sel} setSel={setSel} progress={progress} />
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={save} disabled={!sel.length && !p.plan}>
          <Icon name="pin" size={18} /> {sel.length ? `Zapisz plan (${sel.length})` : 'Zapisz'}
        </button>
        {p.plan && (
          <button className="btn btn-danger" onClick={clear}>
            <Icon name="trash" size={18} /> Usuń plan
          </button>
        )}
      </div>
    </section>
  );
}

function ExamHistory({ profileId }: { profileId: string }) {
  const progress = useProgress(profileId);
  const all = store.allTopics();
  const exams = [...(progress?.exams ?? [])].sort((a, b) => b.at - a.at).slice(0, 20);
  return (
    <section className="card">
      <h2 className="card-title">Sprawdziany i testy na start</h2>
      {exams.length === 0 ? (
        <p className="muted">Jeszcze nie było sprawdzianu. Dziecko uruchamia go na ekranie przedmiotu („Wyzwania”) albo z planu („Sprawdzian próbny”).</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Kiedy</th>
                <th>Rodzaj</th>
                <th>Tematy</th>
                <th>Wynik</th>
                <th>Ocena</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((e) => (
                <tr key={e.sessionId}>
                  <td>
                    {new Date(e.at).toLocaleString('pl-PL', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td>{e.quizId ? 'Kartkówka' : e.mode === 'test' ? 'Sprawdzian' : 'Test na start'}</td>
                  <td style={{ maxWidth: 320 }}>{e.topicIds.map((id) => all.find((t) => t.id === id)?.title ?? '?').join(', ')}</td>
                  <td>
                    {e.correct}/{e.total} ({Math.round((e.correct / e.total) * 100)}%)
                  </td>
                  <td>
                    {e.mode === 'test' ? (
                      <span className={`pill ${e.grade >= 4 ? 'good' : e.grade <= 2 ? 'bad' : ''}`}>
                        {e.grade} — {GRADE_NAMES[e.grade]}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
