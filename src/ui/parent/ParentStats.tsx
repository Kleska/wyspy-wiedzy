import { useState } from 'react';
import { store } from '../../data/store';
import { SUBJECTS } from '../../content/seed';
import { childHistory, filterHistory, historyStats, type HistoryPeriod } from '../../studentHistory';
import { isQuizHidden, quizStates } from '../../engine';
import { useProgress } from '../hooks';
import { historyDuration } from '../ChildProgress';
import { ParentStatsDetails } from './ParentStatsDetails';
import { useParentStudent } from './ParentStudent';

export function ParentStats({ onOpenPlan }: { onOpenPlan?: () => void }) {
  const { studentId } = useParentStudent();
  const progress = useProgress(studentId);
  const [period, setPeriod] = useState<HistoryPeriod>('30');
  const [subject, setSubject] = useState('');
  const p = store.get('profile', studentId);
  if (!p || !progress) return <div className="card"><h1>Panel rodzica</h1><p>Dodaj dziecko w Ustawieniach, aby zacząć.</p></div>;
  const entries = filterHistory(childHistory(p, store.list('session'), store.list('attempt'), store.allTopics(), 'parent'), period, 'all', subject, Date.now());
  const stats = historyStats(entries);
  const results = entries.filter((e) => ['test', 'quiz', 'diagnostic'].includes(e.kind));
  const waiting = quizStates(p.quizzes, progress).filter((q) => !q.result && !isQuizHidden(p, q.quiz.id, 'parent')).length;
  const weak = store.topicsFor(p.id).map((topic) => ({ topic, state: progress.topics.get(topic.id) })).filter(({ topic, state }) => state && state.level > 0 && state.mastery < .7 && (!subject || topic.subject === subject)).sort((a, b) => a.state!.mastery - b.state!.mastery).slice(0, 3);
  return <>
    <header className="clear-page-head"><span className="label">Klasa {p.grade ?? 3}</span><h1>Postępy: {p.name}</h1><p className="muted">Najważniejsze liczby, ostatnie wyniki i kolejny krok.</p></header>
    <div className="card history-filters"><label className="field"><span>Okres</span><select className="select" value={period} onChange={(e) => setPeriod(e.target.value as HistoryPeriod)}><option value="7">Ostatnie 7 dni</option><option value="30">Ostatnie 30 dni</option><option value="all">Cała historia</option></select></label><label className="field"><span>Przedmiot</span><select className="select" value={subject} onChange={(e) => setSubject(e.target.value)}><option value="">Wszystkie przedmioty</option>{SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label></div>
    <div className="child-history-stats"><div className="card"><b>{historyDuration(stats.seconds)}</b><span>aktywnego czasu</span></div><div className="card"><b>{stats.completed}</b><span>ukończonych sesji</span></div><div className="card"><b>{stats.accuracy === null ? '—' : `${stats.accuracy}%`}</b><span>dobrych pierwszych odpowiedzi</span><small>{stats.correct}/{stats.answered} · bez poprawek i gier</small></div><div className="card"><b>{stats.assessments}</b><span>napisanych sprawdzianów i kartkówek</span></div></div>
    <section className="card col"><h2>Co teraz?</h2><p>{waiting ? `Kartkówki do napisania: ${waiting}.` : 'Nie ma oczekujących kartkówek.'}</p>{weak.length ? <><p className="muted">Tematy do utrwalenia według obecnego opanowania:</p><ul>{weak.map(({ topic, state }) => <li key={topic.id}>{topic.title} · {Math.round(state!.mastery * 100)}%</li>)}</ul></> : <p className="muted">Więcej ćwiczeń pozwoli wskazać tematy do utrwalenia.</p>}{onOpenPlan && <button className="btn btn-primary" onClick={onOpenPlan}>Zadaj kartkówkę lub ustaw plan</button>}</section>
    <section className="card col"><h2>Ostatnie sprawdziany i kartkówki</h2>{!results.length && <p className="muted">Brak wyników w tym okresie. Możesz wybrać całą historię.</p>}{results.slice(0, 6).map((e) => <div className="pending-history-quiz" key={e.session.id}><div><b>{e.title}</b><span className="muted">{e.label} · {new Date(e.at).toLocaleDateString('pl-PL')} · {e.correct}/{e.answered}</span></div><span className="pill">{e.grade !== null ? `Ocena ${e.grade}` : e.session.completed ? 'Test na start · bez oceny' : 'Niedokończone'}</span></div>)}</section>
    <details className="card clear-details"><summary>Szczegółowe statystyki i historia</summary><p className="muted">Poniżej osobne filtry tygodnia i analiza tematów od ostatniego resetu.</p><ParentStatsDetails key={p.id} /></details>
  </>;
}
