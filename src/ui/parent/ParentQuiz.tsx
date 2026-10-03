import { useState } from 'react';
import { nowIso, store, uid } from '../../data/store';
import { dateKey, GRADE_NAMES, quizStates } from '../../engine';
import { plural } from '../../themes';
import type { AssignedQuiz, Profile } from '../../types';
import { askConfirm } from '../dialogs';
import { useProgress } from '../hooks';
import { Icon } from '../icons';
import { TopicChecklist } from './TopicChecklist';

const COUNTS = [5, 10, 15, 20];

/**
 * Kartkówki od rodzica dla wybranej osoby: rodzic wybiera tematy, liczbę pytań i termin,
 * dziecko widzi kartkówkę na ekranie startowym i pisze ją raz, bez podpowiedzi. Wynik wraca tutaj.
 */
export function ParentQuiz({ p }: { p: Profile }) {
  const progress = useProgress(p.id);
  const topics = store.topicsFor(p.id);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [until, setUntil] = useState('');
  const [count, setCount] = useState(10);
  const [sel, setSel] = useState<string[]>([]);
  const [msg, setMsg] = useState('');
  const states = progress ? quizStates(p.quizzes, progress) : [];
  const available = topics.filter((t) => sel.includes(t.id)).reduce((a, t) => a + t.exercises.length, 0);
  const n = Math.min(count, available);

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 3000);
  };

  const assign = async () => {
    const first = topics.find((t) => sel.includes(t.id));
    const quiz: AssignedQuiz = {
      id: uid(),
      title: title.trim() || (sel.length === 1 && first ? first.title : 'Kartkówka'),
      topicIds: sel,
      count: n,
      until: until || undefined,
      createdAt: nowIso(),
    };
    await store.put('profile', { ...p, quizzes: [...(p.quizzes ?? []), quiz], updatedAt: nowIso() });
    setOpen(false);
    setTitle('');
    setUntil('');
    setSel([]);
    flash(`Zadano kartkówkę: ${p.name} zobaczy ją na ekranie startowym.`);
  };

  const remove = async (quiz: AssignedQuiz) => {
    if (!(await askConfirm(`Usunąć kartkówkę „${quiz.title}”? Wynik zostanie w historii sprawdzianów.`, { ok: 'Usuń', danger: true }))) return;
    await store.put('profile', { ...p, quizzes: (p.quizzes ?? []).filter((q) => q.id !== quiz.id), updatedAt: nowIso() });
  };

  return (
    <section className="card col" style={{ gap: 14 }}>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <h2 className="card-title" style={{ margin: 0, flex: 1 }}>
          Kartkówki: {p.name}
        </h2>
        {!open && (
          <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
            <Icon name="plus" size={16} /> Zadaj kartkówkę
          </button>
        )}
      </div>
      <p className="muted" style={{ fontSize: 14 }}>
        Krótki sprawdzian z wybranych tematów: bez podpowiedzi, pisany raz, z oceną 1–6. {p.name} zobaczy go na ekranie startowym, a wynik pojawi się tutaj.
      </p>
      {msg && (
        <div className="note" role="status">
          {msg}
        </div>
      )}

      {open && (
        <div className="col quiz-form" style={{ gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <label className="field">
              <span>Nazwa kartkówki (opcjonalnie)</span>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={50} placeholder="np. Have got i can" />
            </label>
            <label className="field">
              <span>Termin kartkówki (opcjonalnie)</span>
              <input className="input" type="date" value={until} min={dateKey(Date.now())} onChange={(e) => setUntil(e.target.value)} />
            </label>
          </div>
          <div className="field">
            <span>Liczba pytań</span>
            <div className="row" role="group" aria-label="Liczba pytań w kartkówce" style={{ flexWrap: 'wrap' }}>
              {COUNTS.map((c) => (
                <button key={c} type="button" className={`btn btn-sm ${count === c ? 'btn-primary' : ''}`} aria-pressed={count === c} onClick={() => setCount(c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <TopicChecklist topics={topics} sel={sel} setSel={setSel} progress={progress} />
          {sel.length > 0 && n < count && (
            <p className="muted" style={{ fontSize: 14 }}>
              W wybranych tematach jest tylko {available} {plural(available, ['zadanie', 'zadania', 'zadań'])} — kartkówka będzie miała {n} {plural(n, ['pytanie', 'pytania', 'pytań'])}.
            </p>
          )}
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={assign} disabled={!sel.length}>
              <Icon name="test" size={18} /> {sel.length ? `Zadaj kartkówkę (${n} ${plural(n, ['pytanie', 'pytania', 'pytań'])})` : 'Zaznacz tematy'}
            </button>
            <button className="btn" onClick={() => setOpen(false)}>
              Anuluj
            </button>
          </div>
        </div>
      )}

      {states.length === 0 ? (
        !open && <p className="muted">Nie ma zadanych kartkówek.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Kartkówka</th>
                <th>Tematy</th>
                <th>Termin</th>
                <th>Wynik</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {[...states].reverse().map(({ quiz, result }) => (
                <tr key={quiz.id}>
                  <td>
                    <b>{quiz.title}</b>
                    <div className="muted" style={{ fontSize: 12 }}>
                      {quiz.count} {plural(quiz.count, ['pytanie', 'pytania', 'pytań'])} · zadana {new Date(quiz.createdAt).toLocaleDateString('pl-PL')}
                    </div>
                  </td>
                  <td style={{ maxWidth: 280 }}>{quiz.topicIds.map((id) => topics.find((t) => t.id === id)?.title ?? '?').join(', ')}</td>
                  <td>{quiz.until ? new Date(quiz.until + 'T12:00:00').toLocaleDateString('pl-PL') : '—'}</td>
                  <td>
                    {result ? (
                      <>
                        <span className={`pill ${result.grade >= 4 ? 'good' : result.grade <= 2 ? 'bad' : ''}`}>
                          {result.grade} — {GRADE_NAMES[result.grade]}
                        </span>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {result.correct}/{result.total} · {new Date(result.at).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}
                        </div>
                      </>
                    ) : (
                      <span className="pill">czeka na napisanie</span>
                    )}
                  </td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => void remove(quiz)} aria-label={`Usuń kartkówkę: ${quiz.title}`}>
                      <Icon name="trash" size={16} />
                    </button>
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
