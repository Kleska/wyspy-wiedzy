import { useState } from 'react';
import { subjectOf } from '../../content/seed';
import { generatorById } from '../../content/generators';
import { gradeOf, store } from '../../data/store';
import { addDays, dateKey, GRADE_NAMES, LEVEL_NAMES, weekStart, type Progress } from '../../engine';
import { TYPE_LABEL } from '../../dsl';
import type { ParsedTopic, Profile, SessionMode } from '../../types';
import { LevelChip } from '../bits';
import { exerciseSummary } from '../exercises/logic';
import { plural } from '../../themes';
import { useProgress } from '../hooks';
import { Icon, Stars } from '../icons';

const DAY_NAMES = ['nd', 'pn', 'wt', 'śr', 'cz', 'pt', 'sb'];

const MODE_LABEL: Record<SessionMode, string> = {
  topic: 'Ćwiczenie',
  review: 'Powtórka',
  test: 'Sprawdzian',
  diagnostic: 'Test na start',
  gen: 'Trening',
  fix: 'Poprawa błędów',
  sprint: 'Błyskawica',
  pairs: 'Pary na czas',
};

function fmtMin(sec: number) {
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

/** Nazwa gry/treningu z klucza zapisanego w sesji (np. „mul”, „quiz:pl”, „pairs:mul”). */
function gameLabel(key: string): string {
  const k = key.replace(/^pairs:/, '');
  if (k.startsWith('quiz:')) return subjectOf(k.slice(5)).name;
  return generatorById(k)?.title ?? k;
}

const fmtDay = (t: number) => new Date(t).toLocaleDateString('pl-PL', { day: 'numeric', month: 'numeric' });

/** Liczby z jednego tygodnia (od poniedziałku). */
function weekNumbers(progress: Progress, start: number) {
  let sec = 0;
  let ans = 0;
  let cor = 0;
  let days = 0;
  for (let i = 0; i < 7; i++) {
    const k = dateKey(addDays(start, i));
    const d = progress.days.get(k);
    if (d) {
      sec += d.seconds;
      ans += d.answered;
      cor += d.correct;
    }
    if (progress.activeDays.has(k)) days++;
  }
  const end = addDays(start, 7);
  return {
    sec,
    ans,
    cor,
    days,
    acc: ans ? Math.round((cor / ans) * 100) : null,
    ups: progress.levelUps.filter((l) => l.at >= start && l.at < end),
    exams: progress.exams.filter((e) => e.at >= start && e.at < end),
  };
}

interface Weak {
  topic: string;
  exText: string;
  type: string;
  wrong: number;
  right: number;
  answers: string[];
}

function buildReport(p: Profile, progress: Progress, topics: ParsedTopic[], weak: Weak[]): string {
  const start = weekStart(Date.now());
  const cur = weekNumbers(progress, start);
  const prev = weekNumbers(progress, addDays(start, -7));
  const title = (id: string) => topics.find((t) => t.id === id)?.title ?? '?';
  const lines = [
    `Raport tygodniowy — ${p.name} (klasa ${gradeOf(p)})`,
    `Tydzień ${fmtDay(start)}–${fmtDay(addDays(start, 6))}`,
    '',
    `• Czas nauki: ${fmtMin(cur.sec)} (tydzień wcześniej: ${fmtMin(prev.sec)})`,
    `• Dni nauki: ${cur.days} z 7 · seria: ${progress.streak} (rekord ${progress.bestStreak})`,
    `• Odpowiedzi: ${cur.ans}${cur.acc !== null ? `, poprawnych ${cur.acc}%` : ''}${prev.acc !== null ? ` (tydzień wcześniej ${prev.acc}%)` : ''}`,
    `• Cel tygodnia: ${progress.week.done ? 'wykonany' : `dni ${progress.week.days}/${progress.week.daysTarget}, tematy ${progress.week.levelUps}/${progress.week.levelUpsTarget}`}`,
  ];
  if (cur.ups.length) lines.push(`• Wyższy poziom: ${cur.ups.map((u) => `${title(u.topicId)} (${LEVEL_NAMES[u.to]})`).join(', ')}`);
  for (const e of cur.exams) {
    lines.push(
      `• ${e.mode === 'test' ? 'Sprawdzian' : 'Test na start'}: ${e.topicIds.map(title).join(', ')} — ${e.correct}/${e.total}${e.mode === 'test' ? `, ocena ${e.grade} (${GRADE_NAMES[e.grade]})` : ''}`,
    );
  }
  if (weak.length) {
    lines.push('', 'Do poćwiczenia:');
    for (const w of weak.slice(0, 5)) lines.push(`• ${w.topic}: ${w.exText}${w.answers.length ? ` — odpowiadał(a): ${w.answers.join('; ')}` : ''}`);
  }
  lines.push('', 'Z aplikacji Wyspy Wiedzy');
  return lines.join('\n');
}

export function ParentStats() {
  const profiles = store.profiles();
  const [pid, setPid] = useState(profiles[0]?.id ?? null);
  const progress = useProgress(pid);
  const [msg, setMsg] = useState('');
  const [showText, setShowText] = useState(false);
  const profile = pid ? store.get('profile', pid) : undefined;
  if (!pid || !progress || !profile) return <p>Brak profilu ucznia.</p>;
  const topics = store.topicsFor(pid);
  const allTopics = store.allTopics();
  const since = profile.resetAt ?? '';

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
  const goal = store.settingsFor(pid).dailyGoalMinutes;
  const maxSec = Math.max(60 * goal, ...days.map((d) => d.sec));

  // Ostatnie błędne odpowiedzi do każdego zadania
  const wrongAnswers = new Map<string, string[]>();
  for (const a of store
    .list('attempt')
    .filter((a) => a.profileId === pid && !a.correct && a.answer && a.at >= since)
    .sort((x, y) => y.at.localeCompare(x.at))) {
    const k = `${a.topicId}|${a.exerciseId}`;
    const list = wrongAnswers.get(k) ?? [];
    if (list.length < 3 && !list.includes(a.answer!)) list.push(a.answer!);
    wrongAnswers.set(k, list);
  }

  const weak: Weak[] = [];
  for (const t of topics) {
    const s = progress.topics.get(t.id);
    for (const w of s?.weak ?? []) {
      const ex = t.exercises.find((e) => e.id === w.exerciseId);
      if (ex)
        weak.push({
          topic: t.title,
          exText: `${ex.prompt} — ${exerciseSummary(ex)}`,
          type: TYPE_LABEL[ex.type],
          wrong: w.wrong,
          right: w.right,
          answers: wrongAnswers.get(`${t.id}|${ex.id}`) ?? [],
        });
    }
  }
  weak.sort((a, b) => b.wrong - a.wrong || a.right - b.right);

  const sessions = store
    .list('session')
    .filter((s) => s.profileId === pid && s.answered > 0 && s.startedAt >= since)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, 15);

  const practiced = topics.filter((t) => (progress.topics.get(t.id)?.level ?? 0) > 0);
  const start = weekStart(Date.now());
  const cur = weekNumbers(progress, start);
  const prev = weekNumbers(progress, addDays(start, -7));
  const report = buildReport(profile, progress, allTopics, weak);

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: `Raport tygodniowy — ${profile.name}`, text: report });
        return;
      }
    } catch {
      return; // anulowano udostępnianie
    }
    try {
      await navigator.clipboard.writeText(report);
      setMsg('Raport skopiowany — wklej go w wiadomości albo e-mailu.');
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setShowText(true);
    }
  };

  const delta = (a: number, b: number, unit = '') => {
    if (a === b) return <span className="muted">bez zmian</span>;
    return (
      <span className={a > b ? 'delta up' : 'delta down'}>
        {a > b ? '▲' : '▼'} {Math.abs(a - b)}
        {unit}
      </span>
    );
  };

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
          <span>dziś (cel {goal} min)</span>
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
          <span>
            {plural(progress.streak, ['dzień', 'dni', 'dni'])} z rzędu (rekord {progress.bestStreak}){progress.freezes > 0 ? ` · zamrożenia: ${progress.freezes}` : ''}
          </span>
        </div>
        <div className="card kpi">
          <b>{fmtMin(progress.totalSeconds)}</b>
          <span>łącznie · poziom {progress.level}</span>
        </div>
      </div>

      <section className="card col" style={{ gap: 12 }}>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <h2 className="card-title" style={{ margin: 0, flex: 1 }}>
            Ten tydzień ({fmtDay(start)}–{fmtDay(addDays(start, 6))})
          </h2>
          <button className="btn btn-sm btn-primary" onClick={share}>
            <Icon name="share" size={16} /> Udostępnij raport
          </button>
          <button className="btn btn-sm" onClick={() => setShowText((v) => !v)}>
            {showText ? 'Ukryj tekst' : 'Pokaż tekst'}
          </button>
        </div>
        {msg && (
          <div className="note" role="status">
            {msg}
          </div>
        )}
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th />
                <th>Ten tydzień</th>
                <th>Poprzedni</th>
                <th>Zmiana</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Czas nauki</td>
                <td>{fmtMin(cur.sec)}</td>
                <td>{fmtMin(prev.sec)}</td>
                <td>{delta(Math.round(cur.sec / 60), Math.round(prev.sec / 60), ' min')}</td>
              </tr>
              <tr>
                <td>Dni nauki</td>
                <td>{cur.days} / 7</td>
                <td>{prev.days} / 7</td>
                <td>{delta(cur.days, prev.days)}</td>
              </tr>
              <tr>
                <td>Odpowiedzi</td>
                <td>{cur.ans}</td>
                <td>{prev.ans}</td>
                <td>{delta(cur.ans, prev.ans)}</td>
              </tr>
              <tr>
                <td>Poprawność</td>
                <td>{cur.acc !== null ? `${cur.acc}%` : '—'}</td>
                <td>{prev.acc !== null ? `${prev.acc}%` : '—'}</td>
                <td>{cur.acc !== null && prev.acc !== null ? delta(cur.acc, prev.acc, ' pp') : '—'}</td>
              </tr>
              <tr>
                <td>Tematy na wyższym poziomie</td>
                <td>{cur.ups.length}</td>
                <td>{prev.ups.length}</td>
                <td>{delta(cur.ups.length, prev.ups.length)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style={{ fontWeight: 700 }}>
          Cel tygodnia:{' '}
          {progress.week.done ? (
            <span className="pill good">wykonany</span>
          ) : (
            `dni nauki ${progress.week.days}/${progress.week.daysTarget}, tematy na wyższym poziomie ${progress.week.levelUps}/${progress.week.levelUpsTarget}`
          )}
          {cur.ups.length > 0 && (
            <span className="muted"> · {cur.ups.map((u) => `${allTopics.find((t) => t.id === u.topicId)?.title} → ${LEVEL_NAMES[u.to]}`).join(', ')}</span>
          )}
        </p>
        {showText && <textarea className="textarea" readOnly value={report} style={{ minHeight: 220 }} aria-label="Tekst raportu" />}
      </section>

      <section className="card">
        <h2 className="card-title">Czas nauki — ostatnie 14 dni</h2>
        <div className="chart" role="img" aria-label="Minuty nauki dziennie przez ostatnie 14 dni">
          {days.map((d, i) => (
            <div key={d.key} className={`chart-col ${i === days.length - 1 ? 'show' : ''}`} title={`${d.label}: ${Math.round(d.sec / 60)} min, ${d.answered} ${plural(d.answered, ['odpowiedź', 'odpowiedzi', 'odpowiedzi'])}`}>
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
                <th>Poziom</th>
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
                        {profile.plan?.topicIds.includes(t.id) ? ' · w planie' : ''}
                      </div>
                    </td>
                    <td>
                      <LevelChip level={s?.level ?? 0} small />
                      {s?.placed && (
                        <div className="muted" style={{ fontSize: 12 }}>
                          zaliczony testem
                        </div>
                      )}
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
                  <th>Ostatnio odpowiadał(a)</th>
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
                    <td>{w.answers.length ? w.answers.map((a, j) => <div key={j} className="wrong-answer">„{a}”</div>) : <span className="muted">—</span>}</td>
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
                  <th>Rodzaj</th>
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
                    <td>{MODE_LABEL[s.mode] ?? s.mode}</td>
                    <td>
                      {s.topicId
                        ? allTopics.find((t) => t.id === s.topicId)?.title ?? '(usunięty temat)'
                        : s.topicIds?.length
                          ? s.topicIds.map((id) => allTopics.find((t) => t.id === id)?.title ?? '?').join(', ')
                          : s.genId
                            ? gameLabel(s.genId)
                            : '—'}
                    </td>
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
