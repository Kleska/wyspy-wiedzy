import { useCallback, useEffect, useRef, useState } from 'react';
import { generateExercises, generatorById, genTopicId } from '../content/generators';
import { subjectOf } from '../content/seed';
import { nowIso, store, uid } from '../data/store';
import { isFillAnswerCorrect } from '../dsl';
import { shuffle, SPRINT_PAID_PER_DAY, SPRINT_RECORD_BONUS, SPRINT_SECONDS } from '../engine';
import { playSound } from '../speech';
import { coinText, plural } from '../themes';
import type { Attempt, ChoiceExercise, FillExercise, Session } from '../types';
import { askConfirm } from './dialogs';
import { renderSentence, withFractions } from './exercises/Exercises';
import { useApp, type SprintGame } from './hooks';
import { Icon } from './icons';
import { snapshot } from './Practice';

type Q = { topicId: string; ex: FillExercise | ChoiceExercise; order?: number[] };

export const sprintKey = (g: SprintGame) => (g.kind === 'gen' ? g.genId : `quiz:${g.subjectId}`);

export function sprintTitle(g: SprintGame): string {
  return g.kind === 'gen' ? generatorById(g.genId)?.title ?? 'Błyskawica' : `${subjectOf(g.subjectId).name}: szybkie pytania`;
}

/** Pytania do Błyskawicy z tematów przedmiotu: tylko „wybierz” (szybkie stuknięcie). */
export function quizPool(profileId: string, subjectId: string): Q[] {
  const out: Q[] = [];
  for (const t of store.topicsFor(profileId).filter((x) => x.subject === subjectId)) {
    for (const ex of t.exercises) if (ex.type === 'choice') out.push({ topicId: t.id, ex });
  }
  return out;
}

function makePool(game: SprintGame, profileId: string): Q[] {
  if (game.kind === 'gen') {
    const g = generatorById(game.genId);
    return g ? generateExercises(g, 150).map((ex) => ({ topicId: genTopicId(g.id), ex })) : [];
  }
  return shuffle(quizPool(profileId, game.subjectId)).map((q) => ({ ...q, order: shuffle((q.ex as ChoiceExercise).options.map((_, i) => i)) }));
}

export function Sprint({ game }: { game: SprintGame }) {
  const { profile, theme, go } = useApp();
  const settings = store.settings;
  const key = sprintKey(game);
  const title = sprintTitle(game);
  const backTo = () => go({ name: 'subject', subjectId: game.kind === 'gen' ? 'mat' : game.subjectId });

  const before = useRef(snapshot(profile.id));
  const best = before.current.sprintBest.get(key) ?? 0;
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro');
  const pool = useRef<Q[]>([]);
  const pos = useRef(0);
  const [q, setQ] = useState<Q | null>(null);
  const [value, setValue] = useState('');
  const [flash, setFlash] = useState<'good' | 'bad' | null>(null);
  const [reveal, setReveal] = useState<string | null>(null);
  const [left, setLeft] = useState(SPRINT_SECONDS * 1000);
  const [score, setScore] = useState({ answered: 0, correct: 0 });
  const [result, setResult] = useState<{ coins: number; record: boolean } | null>(null);
  const session = useRef<Session | null>(null);
  const endAt = useRef(0);
  const qStart = useRef(0);
  const busy = useRef(false);
  const counts = useRef({ answered: 0, correct: 0 });

  const nextQ = useCallback(() => {
    if (pos.current >= pool.current.length) {
      pool.current = makePool(game, profile.id);
      pos.current = 0;
    }
    setQ(pool.current[pos.current++] ?? null);
    setValue('');
    setFlash(null);
    setReveal(null);
    qStart.current = Date.now();
    busy.current = false;
  }, [game, profile.id]);

  const start = async () => {
    pool.current = makePool(game, profile.id);
    pos.current = 0;
    counts.current = { answered: 0, correct: 0 };
    setScore({ answered: 0, correct: 0 });
    session.current = {
      id: uid(),
      profileId: profile.id,
      topicId: null,
      mode: 'sprint',
      genId: key,
      startedAt: nowIso(),
      endedAt: null,
      activeSeconds: 0,
      answered: 0,
      correct: 0,
      completed: false,
    };
    await store.put('session', session.current);
    endAt.current = Date.now() + SPRINT_SECONDS * 1000;
    setLeft(SPRINT_SECONDS * 1000);
    setPhase('play');
    nextQ();
  };

  const finish = useCallback(async () => {
    if (!session.current) return;
    const c = counts.current;
    session.current = { ...session.current, answered: c.answered, correct: c.correct, activeSeconds: SPRINT_SECONDS, completed: true, endedAt: nowIso() };
    await store.put('session', session.current);
    const after = snapshot(profile.id);
    setResult({ coins: after.coinsEarned - before.current.coinsEarned, record: c.correct > best && c.correct > 0 });
    setPhase('done');
    if (settings.sounds) playSound('done');
  }, [best, profile.id, settings.sounds]);

  // Zegar
  useEffect(() => {
    if (phase !== 'play') return;
    const t = setInterval(() => {
      const l = Math.max(0, endAt.current - Date.now());
      setLeft(l);
      if (l <= 0) {
        clearInterval(t);
        void finish();
      }
    }, 100);
    return () => clearInterval(t);
  }, [phase, finish]);

  const record = useCallback(
    (correct: boolean, given: string) => {
      if (!q || !session.current) return;
      const a: Attempt = {
        id: uid(),
        profileId: profile.id,
        sessionId: session.current.id,
        topicId: q.topicId,
        exerciseId: q.ex.id,
        correct,
        retry: false,
        hint: false,
        ms: Date.now() - qStart.current,
        at: nowIso(),
      };
      if (!correct) a.answer = given.slice(0, 200);
      void store.put('attempt', a);
      counts.current = { answered: counts.current.answered + 1, correct: counts.current.correct + (correct ? 1 : 0) };
      setScore(counts.current);
      if (settings.sounds) playSound(correct ? 'good' : 'bad');
    },
    [q, profile.id, settings.sounds],
  );

  const gap = q?.ex.type === 'fill' ? (q.ex.parts.find((p) => Array.isArray(p)) as string[]) : null;

  const answerFill = useCallback(
    (v: string, submit: boolean) => {
      if (!gap || busy.current || phase !== 'play') return;
      setValue(v);
      if (isFillAnswerCorrect(v, gap)) {
        busy.current = true;
        record(true, v);
        setFlash('good');
        setTimeout(nextQ, 160);
      } else if (submit && v.trim()) {
        busy.current = true;
        record(false, v);
        setFlash('bad');
        setReveal(gap[0]);
        setTimeout(nextQ, 1000);
      }
    },
    [gap, nextQ, phase, record],
  );

  const answerChoice = (i: number) => {
    if (!q || q.ex.type !== 'choice' || busy.current) return;
    busy.current = true;
    const ok = i === q.ex.correct;
    record(ok, q.ex.options[i]);
    setFlash(ok ? 'good' : 'bad');
    if (!ok) setReveal(q.ex.options[q.ex.correct]);
    setTimeout(nextQ, ok ? 300 : 1100);
  };

  // Klawiatura fizyczna
  useEffect(() => {
    if (phase !== 'play' || !gap) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (/^[0-9]$/.test(e.key) || e.key === ',' || e.key === '/') answerFill(value + e.key, false);
      else if (e.key === '.') answerFill(value + ',', false);
      else if (e.key === 'Backspace') answerFill(value.slice(0, -1), false);
      else if (e.key === 'Enter') answerFill(value, true);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, gap, value, answerFill]);

  const exit = async () => {
    if (phase === 'play') {
      if (!(await askConfirm('Przerwać Błyskawicę? Wynik się nie zapisze.', { ok: 'Przerwij', cancel: 'Gram dalej' }))) return;
    }
    backTo();
  };

  const needsComma = gap?.some((a) => a.includes(','));
  const needsSlash = gap?.some((a) => a.includes('/'));
  const secs = Math.ceil(left / 1000);

  if (phase === 'intro') {
    const empty = game.kind === 'quiz' && quizPool(profile.id, game.subjectId).length < 5;
    return (
      <div className="center-screen">
        <div className="card col sprint-intro">
          <span className="sprint-badge" aria-hidden="true">
            <Icon name="zap" size={44} />
          </span>
          <div className="label">Błyskawica</div>
          <h1>{title}</h1>
          <p style={{ fontWeight: 700 }}>
            Masz {SPRINT_SECONDS} sekund. Odpowiadaj jak najszybciej — liczą się dobre odpowiedzi.
            {game.kind === 'gen' ? ' Dobra odpowiedź przechodzi dalej sama.' : ''}
          </p>
          <div className="sprint-record">
            <Icon name="trophy" /> Twój rekord: <b>{best}</b>
          </div>
          <p className="muted" style={{ fontSize: 14, fontWeight: 700 }}>
            Nowy rekord: +{coinText(SPRINT_RECORD_BONUS, theme)}. Za ukończenie {coinText(5, theme)} (do {SPRINT_PAID_PER_DAY} razy dziennie).
          </p>
          {empty ? (
            <p className="error">W tym przedmiocie jest za mało pytań do Błyskawicy.</p>
          ) : (
            <button className="btn btn-primary btn-lg btn-block" onClick={start}>
              Start! <Icon name="zap" />
            </button>
          )}
          <button className="btn btn-block" onClick={backTo}>
            Wróć
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'done' && result) {
    return (
      <div className="summary">
        <div className="label">Błyskawica · {title}</div>
        <h1>{result.record ? 'Nowy rekord!' : 'Koniec czasu!'}</h1>
        <div className="summary-stats">
          <div className="card">
            <b style={{ fontFamily: 'var(--font-display)', fontSize: 40 }}>{score.correct}</b>
            <div className="muted" style={{ fontWeight: 700 }}>
              {plural(score.correct, ['dobra odpowiedź', 'dobre odpowiedzi', 'dobrych odpowiedzi'])}
            </div>
          </div>
          <div className="card">
            <b style={{ fontFamily: 'var(--font-display)', fontSize: 40 }}>{Math.max(best, score.correct)}</b>
            <div className="muted" style={{ fontWeight: 700 }}>
              rekord
            </div>
          </div>
          <div className="card">
            <b style={{ fontFamily: 'var(--font-display)', fontSize: 40 }}>+{result.coins}</b>
            <div className="muted" style={{ fontWeight: 700 }}>
              {plural(result.coins, theme.coin)}
            </div>
          </div>
        </div>
        {score.answered > score.correct && (
          <p className="muted" style={{ fontWeight: 700 }}>
            Błędne odpowiedzi: {score.answered - score.correct}. Spokojnie — szybkość przyjdzie z treningiem.
          </p>
        )}
        <div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-lg" onClick={() => go({ name: 'sprint', game, nonce: Date.now() })}>
            <Icon name="repeat" /> Jeszcze raz
          </button>
          <button className="btn btn-primary btn-lg" onClick={backTo}>
            Wróć do tematów
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`practice sprint ${flash ?? ''}`}>
      <div className="pr-top">
        <button className="btn icon-btn" onClick={exit} aria-label="Przerwij Błyskawicę">
          <Icon name="x" />
        </button>
        <div className="bar pr-progress sprint-time" role="timer" aria-label={`Zostało ${secs} sekund`}>
          <span style={{ width: `${(left / (SPRINT_SECONDS * 1000)) * 100}%` }} />
        </div>
        <span className="sprint-secs">{secs} s</span>
        <span className="combo" aria-label={`Dobre odpowiedzi: ${score.correct}`}>
          <Icon name="check" size={16} stroke={3} /> {score.correct}
        </span>
      </div>
      <div className="pr-body sprint-body">
        {q?.ex.type === 'fill' && (
          <>
            <div className={`sprint-q ${flash ?? ''}`} aria-live="polite">
              {q.ex.parts.map((p, i) =>
                Array.isArray(p) ? (
                  <span key={i} className="sprint-answer">
                    {value ? withFractions(value) : <span className="sprint-caret">?</span>}
                  </span>
                ) : (
                  <span key={i}>{withFractions(p)}</span>
                ),
              )}
            </div>
            {reveal && <div className="sprint-reveal">Poprawnie: {withFractions(reveal)}</div>}
            <div className="keypad sprint-keypad" aria-label="Klawiatura liczbowa">
              {['7', '8', '9', '4', '5', '6', '1', '2', '3'].map((d) => (
                <button key={d} type="button" onClick={() => answerFill(value + d, false)}>
                  {d}
                </button>
              ))}
              {needsComma || needsSlash ? (
                <button type="button" onClick={() => answerFill(value + (needsComma ? ',' : '/'), false)} aria-label={needsComma ? 'Przecinek' : 'Kreska ułamkowa'}>
                  {needsComma ? ',' : '/'}
                </button>
              ) : (
                <button type="button" className="key-back" onClick={() => answerFill(value.slice(0, -1), false)} aria-label="Usuń">
                  ⌫
                </button>
              )}
              <button type="button" onClick={() => answerFill(value + '0', false)}>
                0
              </button>
              <button type="button" className="key-ok" onClick={() => answerFill(value, true)} aria-label="Zatwierdź">
                OK
              </button>
              {(needsComma || needsSlash) && (
                <button type="button" className="key-back key-wide" onClick={() => answerFill(value.slice(0, -1), false)} aria-label="Usuń">
                  ⌫ Usuń
                </button>
              )}
            </div>
          </>
        )}
        {q?.ex.type === 'choice' && (
          <>
            <div className="sprint-prompt">{q.ex.prompt}</div>
            {q.ex.sentence && <p className="sentence">{renderSentence(q.ex.sentence)}</p>}
            <div className="options" role="group" aria-label="Odpowiedzi">
              {(q.order ?? q.ex.options.map((_, i) => i)).map((i) => {
                const ex = q.ex as ChoiceExercise;
                const cls = reveal !== null || flash ? (i === ex.correct ? 'correct' : '') : '';
                return (
                  <button key={i} className={`opt ${cls}`} onClick={() => answerChoice(i)} disabled={busy.current}>
                    {withFractions(ex.options[i])}
                  </button>
                );
              })}
            </div>
            {reveal && <div className="sprint-reveal">Poprawnie: {reveal}</div>}
          </>
        )}
      </div>
    </div>
  );
}
