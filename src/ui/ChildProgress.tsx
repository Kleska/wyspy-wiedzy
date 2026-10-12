import { useEffect, useState } from 'react';
import { SUBJECTS } from '../content/seed';
import { generatorById } from '../content/generators';
import { store } from '../data/store';
import { addDays, dateKey, GRADE_NAMES, isQuizHidden, quizStates, sessionMistakes } from '../engine';
import { childHistory, filterHistory, historyStats, type HistoryEntry, type HistoryKind, type HistoryPeriod } from '../studentHistory';
import { plural } from '../themes';
import { LevelChip, Modal } from './bits';
import { DailyCard, FamilyCard, HelloCard, TimesCard, WeekCard } from './HomeCards';
import { MistakeList, mistakeRows } from './Mistakes';
import { practice, useApp, useProgress } from './hooks';
import { Icon, type IconName } from './icons';

type Tab = 'overview' | 'history' | 'results';
const TABS: [Tab, string][] = [['overview', 'Podsumowanie'], ['history', 'Historia nauki'], ['results', 'Sprawdziany i kartkówki']];
const KINDS: [HistoryKind | 'all', string][] = [['all', 'Wszystkie'], ['learning', 'Lekcje i ćwiczenia'], ['test', 'Sprawdziany'], ['quiz', 'Kartkówki'], ['diagnostic', 'Testy na start'], ['games', 'Gry']];

export function historyDuration(seconds: number) {
  if (seconds < 60) return `${Math.round(seconds)} s`;
  const minutes = Math.floor(seconds / 60);
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}
const formatDate = (at: number) => new Date(at).toLocaleString('pl-PL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const entryIcon = (entry: HistoryEntry): IconName => entry.kind === 'games' ? 'zap' : entry.session.mode === 'learn' ? 'book' : entry.kind === 'test' || entry.kind === 'quiz' ? 'test' : 'pencil';

export function ChildProgress() {
  const { profile, theme, go, openTopic } = useApp();
  const progress = useProgress(profile.id)!;
  const [tab, setTab] = useState<Tab>('overview');
  const [period, setPeriod] = useState<HistoryPeriod>('30');
  const [kind, setKind] = useState<HistoryKind | 'all'>('all');
  const [subject, setSubject] = useState('');
  const [limit, setLimit] = useState(20);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => setLimit(20), [period, kind, subject, tab]);
  const topics = store.allTopics();
  const entries = childHistory(profile, store.list('session'), store.list('attempt'), topics);
  const selected = entries.find((entry) => entry.session.id === selectedId);
  const filtered = filterHistory(entries, period, kind, subject, Date.now());
  const visible = tab === 'results' ? filtered.filter((entry) => ['test', 'quiz', 'diagnostic'].includes(entry.kind)) : filtered;
  const stats = historyStats(filtered);
  const subjects = SUBJECTS.filter((s) => entries.some((entry) => entry.subjectIds.includes(s.id)) || store.topicsFor(profile.id).some((t) => t.subject === s.id));
  const pending = quizStates(profile.quizzes, progress).filter((q) => !q.result && !isQuizHidden(profile, q.quiz.id, 'child') && (!subject || store.topicsFor(profile.id).some((t) => q.quiz.topicIds.includes(t.id) && t.subject === subject)) && (kind === 'all' || kind === 'quiz'));
  const switchTab = (next: Tab) => { setTab(next); setKind('all'); };
  const practiced = store.topicsFor(profile.id).filter((topic) => (progress.topics.get(topic.id)?.level ?? 0) > 0 || progress.lessonsDone.has(topic.id));
  return <>
    <header className="clear-page-head"><span className="label">Zobacz, ile już za Tobą</span><h1>Moje postępy</h1><p className="muted">{profile.name}, tutaj znajdziesz swoją historię nauki i wyniki.</p></header>
    <div className="child-progress-tabs" role="tablist" aria-label="Widok postępów">
      {TABS.map(([id, label], index) => <button key={id} id={`progress-tab-${id}`} role="tab" aria-selected={tab === id} aria-controls="child-progress-panel" tabIndex={tab === id ? 0 : -1} onClick={() => switchTab(id)} onKeyDown={(event) => {
        const next = event.key === 'ArrowRight' ? (index + 1) % TABS.length : event.key === 'ArrowLeft' ? (index + TABS.length - 1) % TABS.length : event.key === 'Home' ? 0 : event.key === 'End' ? TABS.length - 1 : null;
        if (next !== null) { event.preventDefault(); switchTab(TABS[next][0]); document.getElementById(`progress-tab-${TABS[next][0]}`)?.focus(); }
      }}>{label}</button>)}
    </div>
    <section id="child-progress-panel" className="col child-progress-panel" role="tabpanel" aria-labelledby={`progress-tab-${tab}`}>
      <div className="card history-filters">
        <label className="field"><span>Okres</span><select className="select" value={period} onChange={(event) => setPeriod(event.target.value as HistoryPeriod)}><option value="7">Ostatnie 7 dni</option><option value="30">Ostatnie 30 dni</option><option value="all">Cała historia</option></select></label>
        {tab !== 'overview' && <label className="field"><span>Rodzaj</span><select className="select" value={kind} onChange={(event) => setKind(event.target.value as HistoryKind | 'all')}>{KINDS.filter(([id]) => tab !== 'results' || ['all', 'test', 'quiz', 'diagnostic'].includes(id)).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>}
        <label className="field"><span>Przedmiot</span><select className="select" value={subject} onChange={(event) => setSubject(event.target.value)}><option value="">Wszystkie przedmioty</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      </div>
      {tab === 'overview' ? <>
        <div className="child-history-stats" aria-label="Statystyki z wybranego okresu">
          <div className="card"><Icon name="clock" /><b>{historyDuration(stats.seconds)}</b><span>czasu nauki</span></div>
          <div className="card"><Icon name="check" /><b>{stats.completed}</b><span>ukończonych sesji</span></div>
          <div className="card"><Icon name="target" /><b>{stats.accuracy === null ? '—' : `${stats.accuracy}%`}</b><span>dobrych odpowiedzi</span><small>{stats.correct} z {stats.answered} · bez poprawek i gier</small></div>
          <div className="card"><Icon name="test" /><b>{stats.assessments}</b><span>napisanych sprawdzianów i kartkówek</span></div>
        </div>
        <WeekActivity entries={filtered} />
        <section className="card col"><h2>Tematy, które już poznajesz</h2><p className="muted">Poziomy tematów pokazują, co pamiętasz także po czasie. To postęp od ostatniego resetu, niezależnie od wybranego okresu.</p>
          {!practiced.length && <p>Po pierwszej lekcji lub ćwiczeniu pojawią się tutaj Twoje tematy.</p>}
          {SUBJECTS.map((s) => {
            const own = practiced.filter((topic) => topic.subject === s.id);
            return own.length ? <details className="clear-details" key={s.id}><summary>{s.name} · {own.length} {plural(own.length, ['temat', 'tematy', 'tematów'])}</summary><div className="child-topic-progress">{own.map((topic) => {
              const state = progress.topics.get(topic.id);
              const mastery = Math.min(100, Math.round((state?.mastery ?? 0) * 100));
              return <button className="history-topic" key={topic.id} onClick={() => openTopic(topic.id)}><b>{topic.title}</b><LevelChip small level={state?.level ?? 0} /><span className="bar" aria-label={`Opanowanie: ${mastery}%`}><span style={{ width: `${mastery}%` }} /></span><small>{mastery}%{progress.lessonsDone.has(topic.id) ? ' · lekcja przeczytana' : ''}</small></button>;
            })}</div></details> : null;
          })}
        </section>
        <HelloCard progress={progress} />
        <details className="card clear-details"><summary>Cele, odznaki i tabliczka mnożenia</summary><div className="progress-cards"><DailyCard progress={progress} theme={theme} wide /><WeekCard progress={progress} theme={theme} wide /><FamilyCard wide />{(profile.grade ?? 3) >= 2 && (profile.grade ?? 3) <= 4 && <TimesCard wide />}</div></details>
      </> : <>
        {tab === 'results' && pending.length > 0 && <section className="card col" aria-label="Kartkówki do napisania"><h2>Kartkówki do napisania</h2><p className="muted">Od rodzica · oczekujące zadania, niezależnie od wybranego okresu.</p>{pending.map(({ quiz }) => {
          const ownTopics = store.topicsFor(profile.id).filter((topic) => quiz.topicIds.includes(topic.id));
          if (subject && !ownTopics.some((topic) => topic.subject === subject)) return null;
          if (kind !== 'all' && kind !== 'quiz') return null;
          const own = quiz.items?.filter((item) => ownTopics.some((topic) => topic.id === item.topicId && topic.exercises.some((ex) => ex.id === item.exerciseId)));
          const count = Math.min(quiz.count, own ? own.length : ownTopics.reduce((sum, topic) => sum + topic.exercises.length, 0));
          return <div className="pending-history-quiz" key={quiz.id}><div><b>{quiz.title}</b><span className="muted">{count > 0 ? `${count} ${plural(count, ['pytanie', 'pytania', 'pytań'])} bez podpowiedzi` : 'Zadania nie są już dostępne'}{quiz.until ? ` · termin ${new Date(quiz.until + 'T12:00:00').toLocaleDateString('pl-PL')}` : ''}</span></div><button className="btn" disabled={!count} onClick={() => go(practice({ kind: 'test', topicIds: ownTopics.map((topic) => topic.id), title: `Kartkówka: ${quiz.title}`, subjectId: ownTopics[0].subject, count, quizId: quiz.id, ...(own ? { items: own } : {}) }))}>Napisz kartkówkę</button></div>;
        })}</section>}
        <section className="col" aria-label={tab === 'results' ? 'Wyniki sprawdzianów i kartkówek' : 'Historia nauki'}>
          <div className="history-list-head"><h2>{tab === 'results' ? 'Twoje wyniki' : 'Twoja historia'}</h2><span className="muted">{visible.length} {plural(visible.length, ['wpis', 'wpisy', 'wpisów'])}</span></div>
          {!visible.length && <div className="card history-empty"><Icon name="book" size={32} /><b>Jeszcze nie ma tu wyników</b><p className="muted">Wybierz inny okres lub przedmiot. Nowa nauka i ukończone sprawdziany pojawią się tutaj automatycznie.</p><button className="btn btn-sm" onClick={() => { setPeriod('all'); setKind('all'); setSubject(''); }}>Pokaż całą historię</button></div>}
          {visible.slice(0, limit).map((entry) => <button key={entry.session.id} className="card history-entry" onClick={() => setSelectedId(entry.session.id)}>
            <span className="history-entry-icon" aria-hidden="true"><Icon name={entryIcon(entry)} size={24} /></span>
            <span className="history-entry-body"><small>{entry.label} · {formatDate(entry.at)}</small><b>{entry.title}</b><span className="muted">{historyDuration(entry.session.activeSeconds)}{entry.session.mode === 'learn' ? ' · lekcja' : entry.session.mode === 'pairs' ? ` · ${entry.correct} par` : entry.answered > 0 ? ` · ${entry.correct}/${entry.answered} dobrze` : ' · bez odpowiedzi'}</span></span>
            <span className="history-entry-result">{entry.grade !== null ? <span className={`pill ${entry.grade >= 4 ? 'good' : entry.grade <= 2 ? 'bad' : ''}`}>Ocena {entry.grade}</span> : <span className="pill">{entry.session.completed ? 'Ukończone' : 'Niedokończone'}</span>}<Icon name="arrowRight" size={20} /></span>
          </button>)}
          {visible.length > limit && <button className="btn" onClick={() => setLimit((n) => n + 20)}>Pokaż więcej ({Math.min(20, visible.length - limit)})</button>}
        </section>
      </>}
    </section>
    {selected && <HistoryDetails entry={selected} onClose={() => setSelectedId(null)} />}
  </>;
}

function WeekActivity({ entries }: { entries: HistoryEntry[] }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const at = addDays(today.getTime(), index - 6);
    const key = dateKey(at);
    const seconds = entries.filter((entry) => dateKey(entry.session.startedAt) === key).reduce((sum, entry) => sum + entry.session.activeSeconds, 0);
    return { key, seconds, label: new Date(at).toLocaleDateString('pl-PL', { weekday: 'short' }), date: new Date(at).toLocaleDateString('pl-PL') };
  });
  const max = Math.max(60, ...days.map((day) => day.seconds));
  return <section className="card col"><h2>Twoje ostatnie 7 dni</h2><p className="muted">Czas nauki z wybranego przedmiotu.</p><ol className="child-week-activity" aria-label="Czas nauki w ostatnich 7 dniach">{days.map((day) => <li key={day.key} aria-label={`${day.date}: ${historyDuration(day.seconds)}`}><span>{day.seconds < 60 ? `${day.seconds} s` : `${Math.floor(day.seconds / 60)} min`}</span><span className="child-day-bar"><i style={{ height: `${Math.max(2, (day.seconds / max) * 100)}%` }} /></span><b>{day.label}</b></li>)}</ol></section>;
}

function HistoryDetails({ entry, onClose }: { entry: HistoryEntry; onClose: () => void }) {
  const { profile, go, openTopic } = useApp();
  const attempts = store.list('attempt').filter((attempt) => attempt.profileId === profile.id && attempt.at >= (profile.resetAt ?? ''));
  const mistakes = sessionMistakes(entry.session.id, attempts);
  const rows = mistakeRows(mistakes, store.allTopics());
  const allowed = store.topicsFor(profile.id);
  const repairable = rows.filter((row) => allowed.some((topic) => topic.id === row.topicId && topic.exercises.some((ex) => ex.id === row.exerciseId)));
  const currentTopics = allowed.filter((topic) => entry.topicIds.includes(topic.id));
  const generator = entry.session.mode === 'gen' ? generatorById(entry.session.genId ?? '') : undefined;
  return <Modal title={entry.title} onClose={onClose} wide>
    <p className="muted">{entry.label} · {formatDate(entry.at)} · {historyDuration(entry.session.activeSeconds)}</p>
    <div className="history-detail-result">
      {entry.grade !== null ? <><b className={`grade-num g${entry.grade}`}>{entry.grade}</b><div><strong>{GRADE_NAMES[entry.grade]}</strong><p>{entry.correct} z {entry.answered} poprawnych ({Math.round((entry.correct / entry.answered) * 100)}%)</p></div></> : <div><strong>{entry.session.completed ? 'Ukończone' : 'Niedokończone'}</strong><p>{entry.session.mode === 'learn' ? entry.session.completed ? 'Lekcja została przeczytana.' : 'Czytanie lekcji przerwano.' : entry.answered ? `${entry.correct} z ${entry.answered} poprawnych` : 'Brak zapisanych odpowiedzi.'}</p></div>}
    </div>
    {!entry.session.completed && <p className="note">To podejście nie zostało ukończone. Niedokończony sprawdzian nie dostaje oceny.</p>}
    {entry.retries > 0 && <p className="muted">Dodatkowe poprawki w tej sesji: {entry.retries}. Wynik powyżej pokazuje pierwsze odpowiedzi.</p>}
    {rows.length > 0 && <section className="col"><h3>Zobacz, co warto poprawić</h3><MistakeList rows={rows} mine reportFor={profile.id} />{repairable.length > 0 && <button className="btn btn-primary" onClick={() => { onClose(); go(practice({ kind: 'fix', items: repairable.slice(0, store.settings.sessionLength).map(({ topicId, exerciseId }) => ({ topicId, exerciseId })), subjectId: entry.subjectIds.length === 1 ? entry.subjectIds[0] : null })); }}>Popraw błędy ({Math.min(repairable.length, store.settings.sessionLength)})</button>}</section>}
    {mistakes.length > rows.length && <p className="muted">Część zadań zmieniono lub wyłączono. Ich dawnych treści nie można już pokazać.</p>}
    {!rows.length && entry.session.mode !== 'learn' && <p className="muted">{entry.session.mode === 'pairs' ? 'Zapisano wynik gry; pojedyncze pary nie są przechowywane w historii.' : generator ? 'Zapisano wynik treningu. Treść losowanych zadań nie jest przechowywana.' : entry.correct === entry.answered && entry.answered > 0 ? 'Wszystkie odpowiedzi były poprawne!' : 'Brak dostępnej listy błędów dla tego podejścia.'}</p>}
    {currentTopics.length > 0 && <details className="clear-details"><summary>Wróć do tematów</summary><div className="col">{currentTopics.map((topic) => <button key={topic.id} className="btn" onClick={() => { onClose(); openTopic(topic.id); }}>{topic.title}</button>)}</div></details>}
    {generator && <button className="btn" onClick={() => { onClose(); go(practice({ kind: 'gen', genId: generator.id, home: true })); }}>Ćwicz z nowymi liczbami</button>}
    <button className="btn btn-block" onClick={onClose}>Wracam do historii</button>
  </Modal>;
}
