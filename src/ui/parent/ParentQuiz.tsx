import { Fragment, useState } from 'react';
import { nowIso, store, uid } from '../../data/store';
import { dateKey, GRADE_NAMES, hideQuizzes, isQuizHidden, mistakesToFix, quizStates } from '../../engine';
import { plural } from '../../themes';
import type { AssignedQuiz, Profile } from '../../types';
import { askConfirm } from '../dialogs';
import { useProgress } from '../hooks';
import { Icon } from '../icons';
import { assignMistakeQuiz, examMistakeRows, ExamMistakes, MISTAKE_QUIZ_MAX } from './ExamMistakes';
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
  // Kartkówka z rozwiniętą listą błędów.
  const [shown, setShown] = useState<string | null>(null);
  const all = progress ? quizStates(p.quizzes, progress) : [];
  // Schowane przez rodzica kartkówki idą do zwiniętej listy „Schowane” (i znikają też z ekranu dziecka).
  const states = all.filter((s) => !isQuizHidden(p, s.quiz.id, 'parent'));
  const hiddenStates = all.filter((s) => isQuizHidden(p, s.quiz.id, 'parent'));
  const writtenIds = states.filter((s) => s.result).map((s) => s.quiz.id);
  // Zadania, w których dziecko pomyliło się w ostatnich 30 dniach i jeszcze ich nie poprawiło.
  const open30 = mistakesToFix({ profileId: p.id, attempts: store.list('attempt'), topics, now: Date.now(), since: p.resetAt, days: 30 });
  const fromMistakes = Math.min(open30.length, MISTAKE_QUIZ_MAX);
  const available = topics.filter((t) => sel.includes(t.id)).reduce((a, t) => a + t.exercises.length, 0);
  const n = Math.min(count, available);

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 5000);
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

  // „Przywróć” przywraca kartkówkę także na ekranie dziecka (nawet jeśli dziecko schowało ją wcześniej samo).
  const setHidden = async (ids: string[], hidden: boolean) => {
    const cur = store.get('profile', p.id);
    if (!cur) return;
    const at = nowIso();
    const byParent = { ...cur, ...hideQuizzes(cur, ids, 'parent', hidden, at) };
    await store.put('profile', { ...byParent, ...(hidden ? {} : hideQuizzes(byParent, ids, 'child', false, at)), updatedAt: at });
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
        {!open && fromMistakes > 0 && (
          <button
            className="btn btn-sm"
            onClick={async () => {
              const k = await assignMistakeQuiz(p.id, 'Poprawa błędów', open30);
              flash(`Zadano kartkówkę z ${k} ${plural(k, ['zadania', 'zadań', 'zadań'])}, w których ${p.name} ostatnio się pomylił(a).`);
            }}
          >
            <Icon name="repeat" size={16} /> Kartkówka z błędów ({fromMistakes})
          </button>
        )}
        {!open && writtenIds.length > 0 && (
          <button className="btn btn-sm" onClick={() => void setHidden(writtenIds, true)}>
            <Icon name="eyeOff" size={16} /> Schowaj napisane ({writtenIds.length})
          </button>
        )}
        {!open && (
          <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
            <Icon name="plus" size={16} /> Zadaj kartkówkę
          </button>
        )}
      </div>
      <p className="muted" style={{ fontSize: 14 }}>
        Krótki sprawdzian z wybranych tematów: bez podpowiedzi, pisany raz, z oceną 1–6. {p.name} zobaczy go na ekranie startowym, a wynik pojawi się tutaj — razem z listą pytań, w
        których były błędy. „Kartkówka z błędów” układa się sama z zadań, w których {p.name} pomylił(a) się w ostatnich 30 dniach i jeszcze ich nie poprawił(a).
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
              W wybranych tematach jest tylko {available} {plural(available, ['zadanie', 'zadania', 'zadań'])} — kartkówka będzie miała {n}{' '}
              {plural(n, ['pytanie', 'pytania', 'pytań'])}.
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
        !open && <p className="muted">{hiddenStates.length ? 'Wszystkie kartkówki są schowane — znajdziesz je niżej.' : 'Nie ma zadanych kartkówek.'}</p>
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
              {[...states].reverse().map(({ quiz, result }) => {
                return (
                  <Fragment key={quiz.id}>
                    <tr>
                      <td>
                        <b>{quiz.title}</b>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {quiz.count} {plural(quiz.count, ['pytanie', 'pytania', 'pytań'])} · zadana {new Date(quiz.createdAt).toLocaleDateString('pl-PL')}
                        </div>
                      </td>
                      <td style={{ maxWidth: 280 }}>
                        {quiz.items && (
                          <div className="muted" style={{ fontSize: 12 }}>
                            wybrane zadania z:
                          </div>
                        )}
                        {quiz.topicIds.map((id) => topics.find((t) => t.id === id)?.title ?? '?').join(', ')}
                      </td>
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
                            {isQuizHidden(p, quiz.id, 'child') && (
                              <div className="muted" style={{ fontSize: 12 }}>
                                {p.name} schował(a) ją u siebie
                              </div>
                            )}
                            {result.correct < result.total && (
                              <button
                                className="btn btn-sm"
                                style={{ marginTop: 6 }}
                                aria-expanded={shown === quiz.id}
                                onClick={() => setShown(shown === quiz.id ? null : quiz.id)}
                              >
                                <Icon name="eye" size={16} /> {shown === quiz.id ? 'Ukryj błędy' : `Błędy (${result.total - result.correct})`}
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="pill">czeka na napisanie</span>
                        )}
                      </td>
                      <td>
                        <div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
                          {result && (
                            <button className="btn btn-sm" onClick={() => void setHidden([quiz.id], true)} aria-label={`Schowaj kartkówkę: ${quiz.title}`} title="Schowaj">
                              <Icon name="eyeOff" size={16} />
                            </button>
                          )}
                          <button className="btn btn-sm btn-danger" onClick={() => void remove(quiz)} aria-label={`Usuń kartkówkę: ${quiz.title}`}>
                            <Icon name="trash" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {hiddenStates.length > 0 && (
        <details className="detail-box hidden-quizzes">
          <summary>
            <b>Schowane kartkówki ({hiddenStates.length})</b> <span className="muted">— nie ma ich też na ekranie dziecka</span>
          </summary>
          <ul className="hidden-quiz-list">
            {[...hiddenStates].reverse().map(({ quiz, result }) => (
              <li key={quiz.id}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <b>{quiz.title}</b>
                  <span className="muted" style={{ fontSize: 13 }}>
                    {' '}
                    · {result ? `${result.correct}/${result.total}, ocena ${result.grade}` : 'nienapisana'} · {new Date(quiz.createdAt).toLocaleDateString('pl-PL')}
                  </span>
                </span>
                <button className="btn btn-sm" onClick={() => void setHidden([quiz.id], false)}>
                  <Icon name="eye" size={16} /> Przywróć
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
      {/* Błędy pokazujemy pod tabelą (a nie w jej wierszu), żeby na telefonie nie trzeba było przewijać w bok. */}
      {states
        .filter(({ quiz, result }) => result && shown === quiz.id)
        .map(({ quiz, result }) => (
          <div key={quiz.id} className="detail-box">
            <b>Błędy: {quiz.title}</b>
            <ExamMistakes p={p} rows={examMistakeRows(p.id, result!.sessionId)} title={quiz.title.replace(/^Poprawa: /, '')} onAssigned={flash} />
          </div>
        ))}
    </section>
  );
}
