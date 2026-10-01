import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { askConfirm } from './dialogs';
import { nowIso, store, uid } from '../data/store';
import { speakableSentence } from '../dsl';
import { buildReviewQueue, buildTopicQueue, computeProgress, type Progress, type QueueItem } from '../engine';
import { playSound, speak, stopSpeaking } from '../speech';
import type { Session } from '../types';
import { ExerciseView } from './exercises/Exercises';
import { correctText, initialAnswer, isCorrect, isReady, type Answer } from './exercises/logic';
import { useApp, type SessionResult } from './hooks';
import { Icon } from './icons';

type Item = QueueItem & { retry?: boolean };

/** Ile błędnych zadań wraca jeszcze raz na końcu jednego ćwiczenia (reszta wróci w powtórkach). */
const MAX_RETRIES = 4;
/** Ochrona przed „przeskoczeniem” informacji zwrotnej tym samym naciśnięciem Enter. */
const FEEDBACK_GUARD_MS = 700;

function snapshot(profileId: string): Progress {
  return computeProgress({
    profileId,
    attempts: store.list('attempt'),
    sessions: store.list('session'),
    redemptions: store.list('redemption'),
    topics: store.allTopics(),
    settings: store.settingsFor(profileId),
    now: Date.now(),
  });
}

export function Practice({ topicId }: { topicId: string | null }) {
  const { profile, theme, go } = useApp();
  const settings = store.settings;
  const topics = store.topicsFor(profile.id);
  const topic = topicId ? topics.find((t) => t.id === topicId) ?? null : null;
  const before = useMemo(() => snapshot(profile.id), [profile.id]);

  const [queue, setQueue] = useState<Item[]>(() =>
    topic ? buildTopicQueue(topic, before, settings.sessionLength, Date.now()) : buildReviewQueue(topics, before, settings.sessionLength, Date.now()),
  );
  const [idx, setIdx] = useState(0);
  const item: Item | undefined = queue[idx];
  const [answer, setAnswer] = useState<Answer>(() => (queue[0] ? initialAnswer(queue[0].ex) : null));
  const [phase, setPhase] = useState<'answer' | 'feedback'>('answer');
  const [ok, setOk] = useState(false);
  const [hint, setHint] = useState(false);
  const [combo, setCombo] = useState(0);
  const [praise, setPraise] = useState('');

  const session = useRef<Session>({
    id: uid(),
    profileId: profile.id,
    topicId,
    mode: topicId ? 'topic' : 'review',
    startedAt: nowIso(),
    endedAt: null,
    activeSeconds: 0,
    answered: 0,
    correct: 0,
    completed: false,
  });
  const started = useRef(false);
  const seconds = useRef(0);
  const dirty = useRef(false);
  const lastInteract = useRef(Date.now());
  const itemStart = useRef(Date.now());
  const finished = useRef(false);
  const mainCount = useRef(queue.length).current;
  const retryStats = useRef({ total: 0, correct: 0 });
  const feedbackAt = useRef(0);
  const [retryQueued, setRetryQueued] = useState(false);

  const save = useCallback(async (completed: boolean) => {
    if (!started.current) return;
    session.current = {
      ...session.current,
      activeSeconds: seconds.current,
      completed,
      endedAt: completed ? nowIso() : session.current.endedAt,
    };
    dirty.current = false;
    await store.put('session', session.current);
  }, []);

  // Liczenie aktywnego czasu: tylko gdy ekran jest widoczny i dziecko coś robiło w ostatniej minucie.
  useEffect(() => {
    const touch = () => (lastInteract.current = Date.now());
    window.addEventListener('pointerdown', touch);
    window.addEventListener('keydown', touch);
    const tick = setInterval(() => {
      if (document.visibilityState === 'visible' && Date.now() - lastInteract.current < 60_000) {
        seconds.current++;
        dirty.current = true;
      }
    }, 1000);
    const persist = setInterval(() => dirty.current && void save(false), 15_000);
    const onHide = () => document.visibilityState === 'hidden' && dirty.current && void save(false);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.removeEventListener('pointerdown', touch);
      window.removeEventListener('keydown', touch);
      clearInterval(tick);
      clearInterval(persist);
      document.removeEventListener('visibilitychange', onHide);
      if (!finished.current && dirty.current) void save(false);
      stopSpeaking();
    };
  }, [save]);

  const readAloud = useCallback(() => {
    if (!item) return;
    const ex = item.ex;
    let text = ex.prompt;
    if (ex.type === 'choice') text += '. ' + (ex.sentence ? speakableSentence(ex.sentence) + '. ' : '') + ex.options.join(', ');
    if (ex.type === 'tap') text += '. ' + ex.tokens.join(' ');
    if (ex.type === 'fill') text += '. ' + ex.parts.map((p) => (Array.isArray(p) ? ' … ' : p)).join('');
    if (ex.type === 'sort') text += '. ' + ex.items.map((i) => i.text).join(', ');
    if (ex.type === 'match') text += '. ' + ex.pairs.map((p) => p[0]).join(', ');
    speak(text);
  }, [item]);

  useEffect(() => {
    itemStart.current = Date.now();
    if (settings.autoRead && item) readAloud();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const check = useCallback(() => {
    if (!item || phase !== 'answer' || !isReady(item.ex, answer)) return;
    const correct = isCorrect(item.ex, answer);
    started.current = true;
    void store.put('attempt', {
      id: uid(),
      profileId: profile.id,
      sessionId: session.current.id,
      topicId: item.topicId,
      exerciseId: item.ex.id,
      correct,
      retry: !!item.retry,
      hint,
      ms: Date.now() - itemStart.current,
      at: nowIso(),
    });
    if (!item.retry) {
      session.current = { ...session.current, answered: session.current.answered + 1, correct: session.current.correct + (correct ? 1 : 0) };
    } else {
      retryStats.current = { total: retryStats.current.total + 1, correct: retryStats.current.correct + (correct ? 1 : 0) };
    }
    dirty.current = true;
    void save(false);
    const willRetry = !correct && !item.retry && queue.filter((q) => q.retry).length < MAX_RETRIES;
    if (willRetry) setQueue((q) => [...q, { ...item, retry: true }]);
    setRetryQueued(willRetry);
    feedbackAt.current = Date.now();
    setCombo((c) => (correct ? (item.retry ? c : c + 1) : 0));
    setOk(correct);
    setPraise(theme.praise[Math.floor(Math.random() * theme.praise.length)]);
    setPhase('feedback');
    if (settings.sounds) playSound(correct ? 'good' : 'bad');
  }, [item, phase, answer, hint, profile.id, save, theme.praise, settings.sounds, queue]);

  const finish = useCallback(async () => {
    finished.current = true;
    await save(true);
    const after = snapshot(profile.id);
    const earnedBefore = new Set(before.badges.filter((b) => b.earned).map((b) => b.id));
    const firstTotal = session.current.answered;
    const result: SessionResult = {
      topicId,
      answered: firstTotal,
      firstCorrect: session.current.correct,
      firstTotal,
      retryTotal: retryStats.current.total,
      retryCorrect: retryStats.current.correct,
      seconds: seconds.current,
      xpGained: after.xp - before.xp,
      coinsGained: after.coinsEarned - before.coinsEarned,
      levelBefore: before.level,
      levelAfter: after.level,
      starsBefore: topicId ? before.topics.get(topicId)?.stars ?? 0 : 0,
      starsAfter: topicId ? after.topics.get(topicId)?.stars ?? 0 : 0,
      newBadges: after.badges.filter((b) => b.earned && !earnedBefore.has(b.id)).map((b) => b.title),
      completed: true,
    };
    if (settings.sounds) playSound('done');
    go({ name: 'summary', result });
  }, [before, go, profile.id, save, settings.sounds, topicId]);

  const next = useCallback(() => {
    if (phase !== 'feedback' || Date.now() - feedbackAt.current < FEEDBACK_GUARD_MS) return;
    stopSpeaking();
    if (idx + 1 >= queue.length) {
      void finish();
      return;
    }
    setIdx(idx + 1);
    setAnswer(initialAnswer(queue[idx + 1].ex));
    setPhase('answer');
    setHint(false);
    window.scrollTo({ top: 0 });
  }, [idx, queue, finish, phase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.repeat || e.isComposing || e.defaultPrevented) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (phase === 'feedback') {
        if (tag === 'BUTTON') return; // przycisk „Dalej” obsłuży to sam
        e.preventDefault();
        next();
      } else if (tag !== 'INPUT' && tag !== 'BUTTON' && tag !== 'TEXTAREA') {
        check();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, next, check]);

  const exit = async () => {
    if (started.current && !(await askConfirm('Skończyć teraz? To, co już zrobione, zostanie zapisane.', { ok: 'Skończ', cancel: 'Ćwiczę dalej' }))) return;
    finished.current = true;
    if (started.current) await save(false);
    go(topic ? { name: 'subject', subjectId: topic.subject } : { name: 'home' });
  };

  if (!item) {
    return (
      <div className="center-screen">
        <div className="card col" style={{ maxWidth: 480, textAlign: 'center', gap: 16 }}>
          <h1 style={{ fontSize: 28 }}>{topicId ? 'Ten temat nie ma jeszcze zadań.' : 'Nie ma nic do powtórki!'}</h1>
          <p className="muted" style={{ fontWeight: 700 }}>
            {topicId ? 'Rodzic może je dodać w panelu rodzica.' : 'Wszystko jest świeże w pamięci. Wróć jutro albo wybierz nowy temat.'}
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => go({ name: 'home' })}>
            Wróć
          </button>
        </div>
      </div>
    );
  }

  const ex = item.ex;
  const exTopic = topics.find((t) => t.id === item.topicId);
  const ready = isReady(ex, answer);
  const inRetry = idx >= mainCount;
  const pctDone = inRetry ? 100 : Math.round(((idx + (phase === 'feedback' ? 1 : 0)) / mainCount) * 100);
  const counter = inRetry ? `Poprawka ${idx - mainCount + 1} z ${queue.length - mainCount}` : `${idx + 1} / ${mainCount}`;
  const showCorrectText = !ok && (ex.type === 'choice' || ex.type === 'tap' || ex.type === 'fill');

  return (
    <div className="practice">
      <div className="pr-top">
        <button className="btn icon-btn" onClick={exit} aria-label="Zakończ ćwiczenie">
          <Icon name="x" />
        </button>
        <div className="bar pr-progress" role="progressbar" aria-valuenow={pctDone} aria-valuemin={0} aria-valuemax={100} aria-label="Postęp ćwiczenia">
          <span style={{ width: `${pctDone}%` }} />
        </div>
        <span className="muted" style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
          {counter}
        </span>
        {combo >= 2 && (
          <span className="combo" aria-label={`Seria ${combo} dobrych odpowiedzi`}>
            <Icon name="zap" size={16} /> ×{combo}
          </span>
        )}
      </div>

      <div className="pr-body">
        <div>
          <div className="pr-topic">
            {exTopic?.title}
            {item.retry ? ' · druga szansa' : ''}
          </div>
          <div className="pr-prompt">
            <h1>{ex.prompt}</h1>
            <button className="btn icon-btn" onClick={readAloud} aria-label="Przeczytaj na głos">
              <Icon name="volume" />
            </button>
          </div>
        </div>

        <ExerciseView key={idx} ex={ex} answer={answer} setAnswer={setAnswer} reveal={phase === 'feedback'} hint={hint} seed={`${session.current.id}:${ex.id}:${item.retry ? 1 : 0}`} onEnter={check} />

        {hint && phase === 'answer' && exTopic?.description && (
          <div className="hint-box">
            <Icon name="bulb" />
            <span>{exTopic.description}</span>
          </div>
        )}
      </div>

      {phase === 'answer' ? (
        <div className="pr-foot">
          <button className="btn" onClick={() => setHint(true)} disabled={hint}>
            <Icon name="bulb" />
            Podpowiedź
          </button>
          <span className="spacer" />
          <button className="btn btn-primary btn-lg" onClick={check} disabled={!ready}>
            Sprawdź
          </button>
        </div>
      ) : (
        <div className={`pr-foot ${ok ? 'good' : 'bad'}`} role="status" aria-live="polite">
          <div className="fb">
            <span className="fb-icon">
              <Icon name={ok ? 'check' : 'x'} size={28} stroke={3.2} />
            </span>
            <div>
              <div className="fb-title">{ok ? praise : theme.oops}</div>
              {showCorrectText && <div className="fb-text">Poprawnie: {correctText(ex)}</div>}
              {ex.explain && <div className="fb-text">{ex.explain}</div>}
              {!ok && !item.retry && (
                <div className="fb-text muted">{retryQueued ? 'To zadanie wróci jeszcze raz na końcu.' : 'To zadanie wróci w powtórce w kolejnych dniach.'}</div>
              )}
            </div>
          </div>
          <button className="btn btn-primary btn-lg" onClick={next}>
            {idx + 1 >= queue.length ? 'Zakończ' : 'Dalej'}
            <Icon name="arrowRight" />
          </button>
        </div>
      )}
    </div>
  );
}
