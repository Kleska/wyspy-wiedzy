import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { factExercises, generateExercises, generatorById, genTopicId, SLOW_SESSION } from '../content/generators';
import { subjectLang, subjectOf } from '../content/seed';
import { nowIso, store, uid } from '../data/store';
import { dictationText, parseWords, speakableSentence, wordHints } from '../dsl';
import { divisionGridOf } from '../longdiv';
import {
  buildDiagnosticQueue,
  buildExamQueue,
  buildReviewQueue,
  buildTopicQueue,
  computeProgress,
  PLACE_MIN,
  PLACE_RATIO,
  schoolGrade,
  shuffle,
  STREAK_MILESTONES,
  type Progress,
  type QueueItem,
} from '../engine';
import { playSound, speak, speakParts, stopSpeaking } from '../speech';
import type { Attempt, ParsedTopic, Session } from '../types';
import { GuideModal, PassageCard } from './bits';
import { askConfirm } from './dialogs';
import { ExerciseView } from './exercises/Exercises';
import { answerText, correctText, initialAnswer, isCorrect, isReady, questionText, type Answer } from './exercises/logic';
import { backScreen, isExamRun, useApp, type Run, type SessionResult } from './hooks';
import { Icon } from './icons';

type Item = QueueItem & { retry?: boolean };

/** Ile błędnych zadań wraca jeszcze raz na końcu jednego ćwiczenia (reszta wróci w powtórkach). */
const MAX_RETRIES = 4;
/** Ochrona przed „przeskoczeniem” informacji zwrotnej tym samym naciśnięciem Enter. */
const FEEDBACK_GUARD_MS = 700;

export function snapshot(profileId: string): Progress {
  return computeProgress({
    profileId,
    attempts: store.list('attempt'),
    sessions: store.list('session'),
    redemptions: store.list('redemption'),
    topics: store.allTopics(),
    settings: store.settingsFor(profileId),
    since: store.get('profile', profileId)?.resetAt,
    now: Date.now(),
  });
}

function buildQueue(run: Run, topics: ParsedTopic[], before: Progress, n: number): Item[] {
  const now = Date.now();
  switch (run.kind) {
    case 'topic': {
      const t = topics.find((x) => x.id === run.topicId);
      return t ? buildTopicQueue(t, before, n, now) : [];
    }
    case 'review':
      return buildReviewQueue(topics, before, n, now);
    case 'test':
      // Kartkówka z konkretnych zadań (np. z błędów): dokładnie te zadania, w losowej kolejności.
      if (run.items?.length)
        return shuffle(
          run.items.flatMap(({ topicId, exerciseId }) => {
            const ex = topics.find((t) => t.id === topicId)?.exercises.find((e) => e.id === exerciseId);
            return ex ? [{ topicId, ex }] : [];
          }),
        ).slice(0, run.count);
      return buildExamQueue(
        topics.filter((t) => run.topicIds.includes(t.id)),
        run.count,
      );
    case 'diagnostic':
      return buildDiagnosticQueue(
        topics.filter((t) => t.subject === run.subjectId),
        before,
      );
    case 'gen': {
      if (run.facts?.length) return factExercises(run.facts).map((ex) => ({ topicId: genTopicId('mul'), ex }));
      const g = generatorById(run.genId);
      return g ? generateExercises(g, g.slow ? Math.min(n, SLOW_SESSION) : n).map((ex) => ({ topicId: genTopicId(g.id), ex })) : [];
    }
    case 'fix':
      return run.items.flatMap(({ topicId, exerciseId }) => {
        const ex = topics.find((t) => t.id === topicId)?.exercises.find((e) => e.id === exerciseId);
        return ex ? [{ topicId, ex }] : [];
      });
  }
}

export function runTitle(run: Run, topics: ParsedTopic[]): string {
  switch (run.kind) {
    case 'topic':
      return topics.find((t) => t.id === run.topicId)?.title ?? 'Ćwiczenie';
    case 'review':
      return 'Powtórka';
    case 'test':
      return run.title;
    case 'diagnostic':
      return `Test na start: ${subjectOf(run.subjectId).name}`;
    case 'gen':
      return run.facts?.length ? 'Tabliczka: najsłabsze działania' : generatorById(run.genId)?.title ?? 'Trening';
    case 'fix':
      return 'Poprawa błędów';
  }
}

function runSubject(run: Run, topics: ParsedTopic[]): string | null {
  switch (run.kind) {
    case 'topic':
      return topics.find((t) => t.id === run.topicId)?.subject ?? null;
    case 'review':
      return null;
    case 'test':
    case 'diagnostic':
      return run.subjectId;
    case 'gen':
      return 'mat';
    case 'fix':
      return run.subjectId;
  }
}

/** Polecenie w całości po angielsku zaczyna się jak pytanie: „Who…?”, „Where…?”, „True or false?”. */
const FOREIGN_PROMPT = /^(who|whose|what|where|when|which|how|true|is|are|can|has|have|do|does)\b/i;

export function Practice({ run }: { run: Run }) {
  const { profile, theme, go } = useApp();
  const settings = store.settings;
  const topics = store.topicsFor(profile.id);
  const exam = isExamRun(run);
  const title = runTitle(run, topics);
  const subjectId = runSubject(run, topics);
  const before = useMemo(() => snapshot(profile.id), [profile.id]);

  const [queue, setQueue] = useState<Item[]>(() => buildQueue(run, topics, before, settings.sessionLength));
  const [idx, setIdx] = useState(0);
  const item: Item | undefined = queue[idx];
  const [answer, setAnswer] = useState<Answer>(() => (queue[0] ? initialAnswer(queue[0].ex) : null));
  const [phase, setPhase] = useState<'answer' | 'feedback'>('answer');
  const [ok, setOk] = useState(false);
  const [hint, setHint] = useState(false);
  const [combo, setCombo] = useState(0);
  const [praise, setPraise] = useState('');
  const [guideOpen, setGuideOpen] = useState(false);

  const session = useRef<Session>({
    id: uid(),
    profileId: profile.id,
    topicId: run.kind === 'topic' ? run.topicId : null,
    mode: run.kind,
    ...(run.kind === 'test' ? { topicIds: run.topicIds, ...(run.quizId ? { quizId: run.quizId } : {}) } : {}),
    ...(run.kind === 'diagnostic' ? { topicIds: [...new Set(queue.map((q) => q.topicId))] } : {}),
    ...(run.kind === 'gen' ? { genId: run.genId } : {}),
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
  const examLog = useRef<{ item: Item; correct: boolean; given: string }[]>([]);
  // Tekst do czytania jest rozwinięty przy pierwszym pytaniu do niego (potem można go rozwinąć).
  const firstOfPassage = useMemo(() => {
    const seen = new Set<string>();
    return queue.map((q) => {
      const t = q.ex.passage?.title;
      if (!t || seen.has(t)) return false;
      seen.add(t);
      return true;
    });
  }, [queue]);
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
    let body = '';
    if (ex.type === 'choice') body = (ex.sentence ? speakableSentence(ex.sentence) + '. ' : '') + ex.options.join(', ');
    if (ex.type === 'tap') body = ex.tokens.join(' ');
    if (ex.type === 'fill') body = speakableSentence(ex.parts.map((p) => (Array.isArray(p) ? ' … ' : p)).join(''));
    if (ex.type === 'dictation') body = dictationText(ex.parts);
    if (ex.type === 'sort') body = ex.items.map((i) => i.text).join(', ');
    if (ex.type === 'match') body = ex.pairs.map((p) => p[0]).join(', ');
    const lang = subjectLang(topics.find((t) => t.id === item.topicId)?.subject);
    // Język obcy: polecenie czyta polski głos, a zdanie i odpowiedzi — głos w języku zadania.
    // Pytania do tekstu bywają w całości w języku obcym („Where is…?”) — wtedy czyta je głos obcy.
    if (lang === 'pl') speak(`${ex.prompt}. ${body}`);
    else speakParts([{ text: ex.prompt, lang: FOREIGN_PROMPT.test(ex.prompt) ? lang : 'pl' }, { text: body, lang }]);
  }, [item, topics]);

  useEffect(() => {
    itemStart.current = Date.now();
    // Dyktando czyta się samo.
    if (settings.autoRead && item && item.ex.type !== 'dictation') readAloud();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const finish = useCallback(async () => {
    finished.current = true;
    await save(true);
    const after = snapshot(profile.id);
    const earnedBefore = new Set(before.badges.filter((b) => b.earned).map((b) => b.id));
    const touched = [...new Set(queue.map((q) => q.topicId))];
    const levelChanges = touched.flatMap((tid) => {
      const t = topics.find((x) => x.id === tid);
      const from = before.topics.get(tid)?.level ?? 0;
      const to = after.topics.get(tid)?.level ?? 0;
      return t && from !== to ? [{ topicId: tid, title: t.title, from, to }] : [];
    });
    const ms = STREAK_MILESTONES.find(([n]) => before.bestStreak < n && after.bestStreak >= n);
    const result: SessionResult = {
      run,
      title,
      subjectId,
      answered: session.current.answered,
      firstCorrect: session.current.correct,
      firstTotal: session.current.answered,
      retryTotal: retryStats.current.total,
      retryCorrect: retryStats.current.correct,
      seconds: seconds.current,
      xpGained: after.xp - before.xp,
      coinsGained: after.coinsEarned - before.coinsEarned,
      levelBefore: before.level,
      levelAfter: after.level,
      starsAfter: run.kind === 'topic' ? after.topics.get(run.topicId)?.stars ?? 0 : 0,
      levelChanges,
      newBadges: after.badges.filter((b) => b.earned && !earnedBefore.has(b.id)).map((b) => b.title),
      streakAfter: after.streak,
      milestone: ms ? { days: ms[0], bonus: ms[1] } : null,
      weekDone: !before.week.done && after.week.done,
    };
    if (exam) {
      const per = new Map<string, { c: number; n: number }>();
      for (const l of examLog.current) {
        const v = per.get(l.item.topicId) ?? { c: 0, n: 0 };
        v.n++;
        if (l.correct) v.c++;
        per.set(l.item.topicId, v);
      }
      result.exam = {
        grade: schoolGrade(session.current.correct, session.current.answered),
        perTopic: [...per].map(([tid, v]) => ({
          topicId: tid,
          title: topics.find((t) => t.id === tid)?.title ?? '',
          correct: v.c,
          total: v.n,
          placed: v.n >= PLACE_MIN && v.c / v.n >= PLACE_RATIO,
        })),
        mistakes: examLog.current
          .filter((l) => !l.correct)
          .map((l) => ({
            topicId: l.item.topicId,
            exerciseId: l.item.ex.id,
            prompt: `${l.item.ex.prompt} ${questionText(l.item.ex)}`.trim(),
            given: l.given,
            correct: correctText(l.item.ex),
          })),
      };
    }
    if (settings.sounds) playSound('done');
    go({ name: 'summary', result });
  }, [before, exam, go, profile.id, queue, run, save, settings.sounds, subjectId, title, topics]);

  const advance = useCallback(() => {
    if (idx + 1 >= queue.length) {
      void finish();
      return;
    }
    setIdx(idx + 1);
    setAnswer(initialAnswer(queue[idx + 1].ex));
    setPhase('answer');
    setHint(false);
    window.scrollTo({ top: 0 });
  }, [finish, idx, queue]);

  const check = useCallback(() => {
    if (!item || phase !== 'answer' || !isReady(item.ex, answer)) return;
    const correct = isCorrect(item.ex, answer);
    started.current = true;
    const attempt: Attempt = {
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
    };
    if (!correct) attempt.answer = answerText(item.ex, answer);
    void store.put('attempt', attempt);
    if (!item.retry) {
      session.current = { ...session.current, answered: session.current.answered + 1, correct: session.current.correct + (correct ? 1 : 0) };
    } else {
      retryStats.current = { total: retryStats.current.total + 1, correct: retryStats.current.correct + (correct ? 1 : 0) };
    }
    dirty.current = true;
    void save(false);

    if (exam) {
      // Sprawdzian: bez podpowiedzi i bez informacji zwrotnej — wynik na końcu.
      examLog.current.push({ item, correct, given: answerText(item.ex, answer) });
      stopSpeaking();
      advance();
      return;
    }

    const willRetry = !correct && !item.retry && queue.filter((q) => q.retry).length < MAX_RETRIES;
    if (willRetry) setQueue((q) => [...q, { ...item, retry: true }]);
    setRetryQueued(willRetry);
    feedbackAt.current = Date.now();
    setCombo((c) => (correct ? (item.retry ? c : c + 1) : 0));
    setOk(correct);
    setPraise(theme.praise[Math.floor(Math.random() * theme.praise.length)]);
    setPhase('feedback');
    if (settings.sounds) playSound(correct ? 'good' : 'bad');
  }, [item, phase, answer, hint, profile.id, save, exam, advance, theme.praise, settings.sounds, queue]);

  const next = useCallback(() => {
    if (phase !== 'feedback' || Date.now() - feedbackAt.current < FEEDBACK_GUARD_MS) return;
    stopSpeaking();
    advance();
  }, [advance, phase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (guideOpen || e.key !== 'Enter' || e.repeat || e.isComposing || e.defaultPrevented) return;
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
  }, [phase, next, check, guideOpen]);

  const back = () => go(backScreen(run, subjectId));

  const exit = async () => {
    const msg = exam ? 'Przerwać? Niedokończony sprawdzian nie dostanie oceny.' : 'Skończyć teraz? To, co już zrobione, zostanie zapisane.';
    if (started.current && !(await askConfirm(msg, { ok: exam ? 'Przerwij' : 'Skończ', cancel: exam ? 'Piszę dalej' : 'Ćwiczę dalej' }))) return;
    finished.current = true;
    if (started.current) await save(false);
    back();
  };

  if (!item) {
    return (
      <div className="center-screen">
        <div className="card col" style={{ maxWidth: 480, textAlign: 'center', gap: 16 }}>
          <h1 style={{ fontSize: 28 }}>{run.kind === 'review' ? 'Nie ma nic do powtórki!' : 'Brak zadań do tego ćwiczenia.'}</h1>
          <p className="muted" style={{ fontWeight: 700 }}>
            {run.kind === 'review' ? 'Wszystko jest świeże w pamięci. Wróć jutro albo wybierz nowy temat.' : 'Rodzic może dodać zadania w panelu rodzica.'}
          </p>
          <button className="btn btn-primary btn-lg" onClick={back}>
            Wróć
          </button>
        </div>
      </div>
    );
  }

  const ex = item.ex;
  const exTopic = topics.find((t) => t.id === item.topicId);
  const itemTitle = exTopic?.title ?? title;
  const lang = subjectLang(exTopic?.subject);
  // Słowniczek przedmiotu (słówka ze wszystkich tematów) — źródło podpowiedzi do słów w zdaniu.
  const glossary = lang === 'pl' ? [] : topics.filter((t) => t.subject === exTopic?.subject).flatMap((t) => parseWords(t.words));
  // Podpowiadamy słowa ze zdania, nigdy z odpowiedzi do wyboru ani z luk.
  const visibleText =
    ex.type === 'choice' ? speakableSentence(ex.sentence ?? '') : ex.type === 'fill' || ex.type === 'dictation' ? ex.parts.filter((p) => typeof p === 'string').join(' … ') : '';
  const hintWords = glossary.length ? wordHints(visibleText, glossary) : [];
  const hasHint = !!(ex.hint || hintWords.length || exTopic?.description);
  // „Oblicz pisemnie”: rozwiązanie krok po kroku pokazuje sam słupek z kratkami, więc w stopce nie powtarzamy wyjaśnienia.
  const division = divisionGridOf(ex);
  const ready = isReady(ex, answer);
  const inRetry = idx >= mainCount;
  const pctDone = inRetry ? 100 : Math.round(((idx + (phase === 'feedback' ? 1 : 0)) / mainCount) * 100);
  const counter = exam ? `Pytanie ${idx + 1} z ${mainCount}` : inRetry ? `Poprawka ${idx - mainCount + 1} z ${queue.length - mainCount}` : `${idx + 1} / ${mainCount}`;
  const showCorrectText = !ok && (ex.type === 'choice' || ex.type === 'tap' || ex.type === 'fill' || ex.type === 'dictation');
  const hasGuide = !!(exTopic?.guide || exTopic?.description);

  return (
    <div className={`practice ${exam ? 'exam' : ''}`}>
      <div className="pr-top">
        <button className="btn icon-btn" onClick={exit} aria-label={exam ? 'Przerwij sprawdzian' : 'Zakończ ćwiczenie'}>
          <Icon name="x" />
        </button>
        <div className="bar pr-progress" role="progressbar" aria-valuenow={pctDone} aria-valuemin={0} aria-valuemax={100} aria-label="Postęp ćwiczenia">
          <span style={{ width: `${pctDone}%` }} />
        </div>
        <span className="muted" style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
          {counter}
        </span>
        {!exam && combo >= 2 && (
          <span className="combo" aria-label={`Seria ${combo} dobrych odpowiedzi`}>
            <Icon name="zap" size={16} /> ×{combo}
          </span>
        )}
      </div>

      <div className="pr-body">
        {ex.passage && (
          <PassageCard
            key={`p${idx}`}
            passage={ex.passage}
            defaultOpen={firstOfPassage[idx] || exam}
            lang={lang}
            words={exam || !glossary.length ? undefined : wordHints(ex.passage.text, glossary, 40)}
          />
        )}
        <div>
          <div className="pr-topic">
            {exam ? `${title} · ` : ''}
            {itemTitle}
            {item.retry ? ' · druga szansa' : ''}
          </div>
          <div className="pr-prompt">
            <h1>{ex.prompt}</h1>
            <button className="btn icon-btn" onClick={readAloud} aria-label="Przeczytaj na głos">
              <Icon name="volume" />
            </button>
          </div>
          {exam && idx === 0 && <p className="exam-note">Bez podpowiedzi i poprawek. Wynik i ocenę zobaczysz na końcu.</p>}
        </div>

        <ExerciseView
          key={idx}
          ex={ex}
          answer={answer}
          setAnswer={setAnswer}
          reveal={phase === 'feedback'}
          hint={hint}
          seed={`${session.current.id}:${ex.id}:${item.retry ? 1 : 0}`}
          onEnter={check}
          lang={lang}
        />

        {hint && phase === 'answer' && hasHint && (
          <div className="hint-box">
            <Icon name="bulb" />
            <div className="hint-lines">
              {ex.hint && <span className="hint-main">{ex.hint}</span>}
              {hintWords.length > 0 && (
                <span className="hint-words">
                  <span className="hint-label">Słówka:</span>
                  {hintWords.map(([w, t]) => (
                    <span key={w} className="hint-word">
                      <b lang={lang}>{w}</b> – {t}
                    </span>
                  ))}
                </span>
              )}
              {exTopic?.description && <span className={ex.hint || hintWords.length ? 'hint-rule' : ''}>{exTopic.description}</span>}
            </div>
          </div>
        )}
      </div>

      {phase === 'answer' ? (
        <div className="pr-foot pr-foot-answer">
          {!exam && (
            <button className="btn" onClick={() => setHint(true)} disabled={hint}>
              <Icon name="bulb" />
              Podpowiedź
            </button>
          )}
          <span className="spacer" />
          <button className="btn btn-primary btn-lg" onClick={check} disabled={!ready}>
            {exam ? (idx + 1 >= queue.length ? 'Zakończ sprawdzian' : 'Dalej') : 'Sprawdź'}
            {exam && <Icon name="arrowRight" />}
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
              {ex.explain && !division && <div className="fb-text">{ex.explain}</div>}
              {lang !== 'pl' && ex.hint && <div className="fb-text fb-translation">{ex.hint}</div>}
              {!ok && !item.retry && (
                <div className="fb-text muted">{retryQueued ? 'To zadanie wróci jeszcze raz na końcu.' : 'To zadanie wróci w powtórce w kolejnych dniach.'}</div>
              )}
            </div>
          </div>
          <div className="fb-actions">
            {!ok && hasGuide && (
              <button className="btn" onClick={() => setGuideOpen(true)}>
                <Icon name="book" /> Ściąga
              </button>
            )}
            <button className="btn btn-primary btn-lg" onClick={next}>
              {idx + 1 >= queue.length ? 'Zakończ' : 'Dalej'}
              <Icon name="arrowRight" />
            </button>
          </div>
        </div>
      )}
      {guideOpen && exTopic && <GuideModal topicTitle={exTopic.title} description={exTopic.description} guide={exTopic.guide} words={exTopic.words} lang={lang} onClose={() => setGuideOpen(false)} />}
    </div>
  );
}
