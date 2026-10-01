import { useMemo } from 'react';
import { store } from '../data/store';
import { GRADE_NAMES, GRADE_SCALE, WEEK_BONUS } from '../engine';
import { coinText } from '../themes';
import { LevelChip } from './bits';
import { withFractions } from './exercises/Exercises';
import { practice, useApp, type SessionResult } from './hooks';
import { Icon, Stars } from './icons';

const COLORS = ['#E0512E', '#F2B705', '#2A7F45', '#1F6FA8', '#8A4FD1', '#FF5C8A', '#A6E35A'];

function Confetti() {
  const bits = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        dur: 2.2 + Math.random() * 1.8,
        color: COLORS[i % COLORS.length],
        rot: Math.random() * 360,
      })),
    [],
  );
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b, i) => (
        <i key={i} style={{ left: `${b.left}%`, background: b.color, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s`, transform: `rotate(${b.rot}deg)` }} />
      ))}
    </div>
  );
}

function headline(acc: number): string {
  return acc >= 0.9 ? 'Mistrzowsko!' : acc >= 0.7 ? 'Świetna robota!' : acc >= 0.5 ? 'Dobrze idzie!' : 'Trening czyni mistrza!';
}

function gradeComment(g: number): string {
  if (g >= 6) return 'Celująco! Nie było ani jednego błędu.';
  if (g === 5) return 'Bardzo dobrze! Popraw błędy i będzie szóstka.';
  if (g === 4) return 'Dobrze! Jeszcze trochę ćwiczeń i będzie piątka.';
  if (g === 3) return 'Połowa drogi za Tobą. Popraw błędy i poćwicz tematy z listy.';
  return 'To dopiero początek. Zacznij od poprawy błędów — każdy trening pomaga.';
}

export function Summary({ result }: { result: SessionResult }) {
  const { theme, go } = useApp();
  const acc = result.firstTotal ? result.firstCorrect / result.firstTotal : 0;
  const run = result.run;
  const exam = result.exam;
  const back = () => (result.subjectId ? go({ name: 'subject', subjectId: result.subjectId }) : go({ name: 'home' }));
  const mins = Math.floor(result.seconds / 60);
  const secs = result.seconds % 60;
  const celebrate = acc >= 0.7 || !!result.milestone || result.weekDone;
  const topics = store.topics();
  const nextTopic = run.kind === 'diagnostic' && exam ? exam.perTopic.find((t) => !t.placed) : undefined;

  return (
    <div className="summary">
      {celebrate && <Confetti />}
      <div className="label">{result.title}</div>

      {run.kind === 'test' && exam ? (
        <div className="grade-box">
          <span className={`grade-num g${exam.grade}`} aria-label={`Ocena ${exam.grade}`}>
            {exam.grade}
          </span>
          <div className="col" style={{ gap: 4, textAlign: 'left' }}>
            <b className="grade-name">{GRADE_NAMES[exam.grade]}</b>
            <span style={{ fontWeight: 800 }}>
              {result.firstCorrect} z {result.firstTotal} ({Math.round(acc * 100)}%)
            </span>
            <span className="muted" style={{ fontSize: 14, fontWeight: 700 }}>
              {gradeComment(exam.grade)}
            </span>
          </div>
        </div>
      ) : run.kind === 'diagnostic' ? (
        <h1>Test na start — gotowe!</h1>
      ) : (
        <h1>{headline(acc)}</h1>
      )}

      {run.kind === 'topic' && (
        <div style={{ color: 'var(--gold)' }}>
          <Stars n={result.starsAfter} size={48} />
        </div>
      )}

      {result.milestone && (
        <div className="card celebrate">
          <span className="celebrate-icon" aria-hidden="true">
            <Icon name="flame" size={40} />
          </span>
          <div>
            <b>{result.milestone.days} dni nauki z rzędu!</b>
            <div>Nagroda: +{coinText(result.milestone.bonus, theme)}</div>
          </div>
        </div>
      )}
      {result.weekDone && (
        <div className="card celebrate">
          <span className="celebrate-icon" aria-hidden="true">
            <Icon name="target" size={40} />
          </span>
          <div>
            <b>Cel tygodnia wykonany!</b>
            <div>Nagroda: +{coinText(WEEK_BONUS, theme)}</div>
          </div>
        </div>
      )}

      {run.kind === 'diagnostic' && exam && (
        <section className="card col" style={{ gap: 10, textAlign: 'left' }}>
          <h2 className="card-title" style={{ margin: 0 }}>
            Co już umiesz
          </h2>
          {exam.perTopic.map((t) => (
            <div key={t.topicId} className="diag-row">
              <span className={`diag-mark ${t.placed ? 'good' : ''}`}>{t.placed ? <Icon name="check" size={18} stroke={3.2} /> : `${t.correct}/${t.total}`}</span>
              <span style={{ flex: 1, fontWeight: 800 }}>{t.title}</span>
              {t.placed ? <LevelChip level={3} small /> : <span className="muted" style={{ fontWeight: 700, fontSize: 14 }}>do ćwiczenia</span>}
            </div>
          ))}
          <p className="muted" style={{ fontSize: 14, fontWeight: 700 }}>
            Tematy z ptaszkiem są już na poziomie „Biegły”. Resztę warto poćwiczyć.
          </p>
          {nextTopic && (
            <button className="btn btn-primary btn-lg" onClick={() => go(practice({ kind: 'topic', topicId: nextTopic.topicId }))}>
              Ćwicz: {nextTopic.title} <Icon name="arrowRight" />
            </button>
          )}
        </section>
      )}

      <div className="summary-stats">
        <div className="card">
          <b style={{ fontFamily: 'var(--font-display)', fontSize: 30 }}>
            {result.firstCorrect}/{result.firstTotal}
          </b>
          <div className="muted" style={{ fontWeight: 700 }}>
            {exam ? 'dobrych odpowiedzi' : 'dobrze za pierwszym razem'}
          </div>
          {result.retryTotal > 0 && (
            <div style={{ fontWeight: 800, marginTop: 6 }}>
              poprawione: {result.retryCorrect} z {result.retryTotal}
            </div>
          )}
        </div>
        <div className="card">
          <b style={{ fontFamily: 'var(--font-display)', fontSize: 30 }}>+{result.xpGained} XP</b>
          <div className="muted" style={{ fontWeight: 700 }}>
            doświadczenia
          </div>
        </div>
        <div className="card">
          <b style={{ fontFamily: 'var(--font-display)', fontSize: 30 }}>+{result.coinsGained}</b>
          <div className="muted" style={{ fontWeight: 700 }}>
            {coinText(result.coinsGained, theme).replace(/^\d+ /, '')}
          </div>
        </div>
        <div className="card">
          <b style={{ fontFamily: 'var(--font-display)', fontSize: 30 }}>
            {mins}:{String(secs).padStart(2, '0')}
          </b>
          <div className="muted" style={{ fontWeight: 700 }}>
            czasu nauki
          </div>
        </div>
      </div>

      {result.levelChanges.length > 0 && (
        <section className="card col" style={{ gap: 10, textAlign: 'left' }}>
          <h2 className="card-title" style={{ margin: 0 }}>
            Co się zmieniło
          </h2>
          {result.levelChanges.map((c) => (
            <div key={c.topicId} className="change-row">
              <Icon name={c.to > c.from ? 'arrowUp' : 'arrowDown'} size={22} className={c.to > c.from ? 'ic-up' : 'ic-down'} />
              <span className="change-title">{c.title}</span>
              <span className="change-levels">
                <LevelChip level={c.from} small /> <Icon name="arrowRight" size={16} /> <LevelChip level={c.to} small />
              </span>
            </div>
          ))}
          {result.levelChanges.some((c) => c.to < c.from) && (
            <p className="muted" style={{ fontSize: 14, fontWeight: 700 }}>
              Poziom spada, gdy coś się zapomina. Powtórka szybko go odbuduje.
            </p>
          )}
        </section>
      )}

      {result.levelAfter > result.levelBefore && (
        <div className="card panel" style={{ fontWeight: 800, fontSize: 20 }}>
          <Icon name="trophy" /> Nowy poziom: {theme.levelLabel(result.levelAfter)}!
        </div>
      )}
      {result.newBadges.length > 0 && (
        <div className="card" style={{ fontWeight: 800 }}>
          <Icon name="award" /> {result.newBadges.length > 1 ? 'Nowe odznaki' : 'Nowa odznaka'}: {result.newBadges.join(', ')}
        </div>
      )}

      {exam && exam.mistakes.length > 0 && (
        <section className="card col" style={{ gap: 10, textAlign: 'left' }}>
          <h2 className="card-title" style={{ margin: 0 }}>
            Błędy do poprawy ({exam.mistakes.length})
          </h2>
          {exam.mistakes.map((m, i) => (
            <div key={i} className="mistake">
              <div className="mistake-q">
                {withFractions(m.prompt)}
                <span className="muted"> · {topics.find((t) => t.id === m.topicId)?.title}</span>
              </div>
              <div>
                <span className="pill bad">Twoja odpowiedź</span> {withFractions(m.given || '—')}
              </div>
              <div>
                <span className="pill good">Poprawnie</span> {withFractions(m.correct)}
              </div>
            </div>
          ))}
          <button
            className="btn btn-primary btn-lg"
            onClick={() => go(practice({ kind: 'fix', items: exam.mistakes.map((m) => ({ topicId: m.topicId, exerciseId: m.exerciseId })), subjectId: result.subjectId }))}
          >
            <Icon name="repeat" /> Popraw błędy
          </button>
        </section>
      )}
      {run.kind === 'test' && (
        <p className="muted" style={{ fontSize: 13, fontWeight: 700 }}>
          Ocena według skali: {GRADE_SCALE}. W Twojej szkole skala może być trochę inna.
        </p>
      )}

      <div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
        {(run.kind === 'topic' || run.kind === 'gen') && (
          <button className="btn btn-lg" onClick={() => go(practice(run))}>
            <Icon name="repeat" /> Jeszcze raz
          </button>
        )}
        <button className="btn btn-primary btn-lg" onClick={back}>
          {result.subjectId ? 'Wróć do tematów' : 'Wróć na start'}
        </button>
      </div>
    </div>
  );
}
