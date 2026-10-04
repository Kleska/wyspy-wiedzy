import { useMemo, useRef, useState } from 'react';
import { subjectLang } from '../content/seed';
import { nowIso, store, uid } from '../data/store';
import { parseLesson } from '../dsl';
import { LESSON_COINS } from '../engine';
import { divisionGridOf, divisionLayout, lessonDivision, writtenDivisionOf } from '../longdiv';
import { playSound } from '../speech';
import { coinText } from '../themes';
import type { Exercise, Lesson, LessonPair, Session } from '../types';
import { PassageCard } from './bits';
import { ExerciseView } from './exercises/Exercises';
import { correctText, initialAnswer, isCorrect, isReady, type Answer } from './exercises/logic';
import { practice, useApp, useProgress, type Screen } from './hooks';
import { Icon } from './icons';
import { DivisionSolution, DivisionSteps } from './LongDivision';
import { TopBar } from './TopBar';

/** Każda karta ma zmieścić się na jednym ekranie telefonu: przykład jest osobno, a pary idą po dwie. */
type Card =
  | { kind: 'key' }
  | { kind: 'steps' }
  | { kind: 'example' }
  | { kind: 'division'; a: number; b: number; n: number; of: number }
  | { kind: 'pairs'; from: number; part: number; parts: number }
  | { kind: 'trick' }
  | { kind: 'check'; ex: Exercise; n: number };

const PAIRS_PER_CARD = 2;

const CARD_TITLE: Record<Exclude<Card['kind'], 'check'>, string> = {
  key: 'Najważniejsze',
  steps: 'Krok po kroku',
  example: 'Przykład',
  division: 'Przykład krok po kroku',
  pairs: 'Tak — nie tak',
  trick: 'Jak to zapamiętać',
};

const EXAMPLE = /^Przykład\s*:\s*(.*)$/;
/** Zwykły krok: ani „Przykład: …”, ani „słupek: 936 : 4” (te mają własne karty). */
const isPlainStep = (l: string) => !EXAMPLE.test(l) && !lessonDivision(l);

/** „Tak / nie tak”: poprawna wersja obok typowego błędu, z krótkim „bo…”. */
export function PairList({ pairs, compact }: { pairs: LessonPair[]; compact?: boolean }) {
  return (
    <div className={`lesson-pairs ${compact ? 'compact' : ''}`}>
      {pairs.map((p, i) => (
        <div key={i} className="lesson-pair">
          <div className="lp-good">
            <Icon name="check" size={20} stroke={3} />
            <span>{p.good}</span>
          </div>
          <div className="lp-bad">
            <Icon name="x" size={20} stroke={3} />
            <span>{p.bad}</span>
          </div>
          {/* Na stronie powtórki zostają same pary — powody są w lekcji. */}
          {p.why && !compact && <div className="lp-why">Bo {p.why}</div>}
        </div>
      ))}
    </div>
  );
}

export function LessonKey({ lines }: { lines: string[] }) {
  return (
    <ul className="lesson-list">
      {lines.map((l, i) => (
        <li key={i}>{l}</li>
      ))}
    </ul>
  );
}

function Steps({ lines }: { lines: string[] }) {
  return (
    <ol className="lesson-steps">
      {lines.filter(isPlainStep).map((l, i) => (
        <li key={i}>{l}</li>
      ))}
    </ol>
  );
}

/** Dzieli tekst na zdania (bez wyrażeń „lookbehind”, których nie znają starsze iPady). */
function sentences(text: string): string[] {
  const out: string[] = [];
  let cur = '';
  for (const piece of text.split(/([.?!]+[”")]*\s+)/)) {
    cur += piece;
    if (/[.?!]+[”")]*\s+$/.test(piece)) {
      out.push(cur.trim());
      cur = '';
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** Przykład rozbijamy na zdania — każde w osobnej linii, żeby było widać kolejne kroki. */
function Example({ lines }: { lines: string[] }) {
  return (
    <div className="lesson-example">
      {lines
        .filter((l) => EXAMPLE.test(l))
        .flatMap((l) => sentences(l.match(EXAMPLE)![1]))
        .map((part, i) => (
          <span key={i} className={part.startsWith('Czyli') ? 'result' : ''}>
            {part}
          </span>
        ))}
    </div>
  );
}

export function LessonTrick({ lines }: { lines: string[] }) {
  return (
    <div className="lesson-trick">
      {lines.map((l, i) => (
        <p key={i}>
          <Icon name="bulb" size={22} />
          <span>{l}</span>
        </p>
      ))}
    </div>
  );
}

function cardsOf(lesson: Lesson): Card[] {
  const out: Card[] = [];
  if (lesson.key.length) out.push({ kind: 'key' });
  if (lesson.steps.some(isPlainStep)) out.push({ kind: 'steps' });
  if (lesson.steps.some((l) => EXAMPLE.test(l))) out.push({ kind: 'example' });
  const divs = lesson.steps.map(lessonDivision).filter((d): d is [number, number] => Array.isArray(d));
  divs.forEach(([a, b], n) => out.push({ kind: 'division', a, b, n: n + 1, of: divs.length }));
  const parts = Math.ceil(lesson.pairs.length / PAIRS_PER_CARD);
  for (let part = 0; part < parts; part++) out.push({ kind: 'pairs', from: part * PAIRS_PER_CARD, part: part + 1, parts });
  if (lesson.trick.length) out.push({ kind: 'trick' });
  lesson.checks.forEach((ex, n) => out.push({ kind: 'check', ex, n }));
  return out;
}

/**
 * Tryb nauki: krótkie karty jednego tematu — najważniejsze, krok po kroku, tak / nie tak, sposób na zapamiętanie
 * i kilka pytań kontrolnych z wyjaśnieniem. Pytania nie trafiają do dziennika postępów; zapisujemy tylko to,
 * że lekcja została przeczytana (sesja `learn`).
 */
export function Learn({ topicId, from }: { topicId: string; from?: 'home' | 'subject' }) {
  const { profile, theme, go } = useApp();
  const progress = useProgress(profile.id);
  const topic = store.topicsFor(profile.id).find((t) => t.id === topicId);
  const lesson = useMemo(() => parseLesson(topic?.lesson), [topic?.lesson]);
  const cards = useMemo(() => (lesson ? cardsOf(lesson) : []), [lesson]);
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [answer, setAnswer] = useState<Answer>(null);
  const [checked, setChecked] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  // Karta ze słupkiem: który krok dzielenia jest już pokazany.
  const [frame, setFrame] = useState(0);
  const startedAt = useRef({ iso: nowIso(), ms: Date.now() });
  // Czy to pierwsze przejście tej lekcji — sprawdzamy na początku, bo po zapisie będzie już „zrobiona”.
  const firstTime = useRef(!progress?.lessonsDone.has(topicId));
  const seed = useRef(uid());

  const back: Screen = from === 'home' || !topic ? { name: 'home' } : { name: 'subject', subjectId: topic.subject };

  if (!topic || !lesson || !cards.length) {
    return (
      <>
        <TopBar back={() => go(back)} />
        <div className="page">
          <div className="card">Ten temat nie ma jeszcze lekcji.</div>
        </div>
      </>
    );
  }

  const lang = subjectLang(topic.subject);
  const card = cards[idx];
  const checks = lesson.checks.length;

  const open = (i: number) => {
    const c = cards[i];
    setIdx(i);
    setAnswer(c.kind === 'check' ? initialAnswer(c.ex) : null);
    setChecked(null);
    setFrame(0);
    window.scrollTo({ top: 0 });
  };

  const finish = async () => {
    const session: Session = {
      id: uid(),
      profileId: profile.id,
      topicId: topic.id,
      mode: 'learn',
      startedAt: startedAt.current.iso,
      endedAt: nowIso(),
      // Liczymy czas czytania, ale z rozsądnym limitem (odłożony tablet nie nabija minut).
      activeSeconds: Math.min(600, Math.max(1, Math.round((Date.now() - startedAt.current.ms) / 1000))),
      answered: 0,
      correct: 0,
      completed: true,
    };
    await store.put('session', session);
    if (store.settings.sounds) playSound('done');
    setDone(true);
    window.scrollTo({ top: 0 });
  };

  const next = () => (idx + 1 >= cards.length ? void finish() : open(idx + 1));

  const check = () => {
    if (card.kind !== 'check' || checked !== null || !isReady(card.ex, answer)) return;
    const ok = isCorrect(card.ex, answer);
    setChecked(ok);
    if (ok) setScore((s) => s + 1);
    if (store.settings.sounds) playSound(ok ? 'good' : 'bad');
  };

  if (done) {
    return (
      <div className="summary lesson-done">
        <div className="label">Nauka · {topic.title}</div>
        <h1>Lekcja przeczytana!</h1>
        {checks > 0 && (
          <p style={{ fontWeight: 800, fontSize: 20 }}>
            Pytania kontrolne: {score} z {checks}
          </p>
        )}
        {firstTime.current && <p className="muted" style={{ fontWeight: 700 }}>+{coinText(LESSON_COINS, theme)} za pierwszą lekcję z tego tematu</p>}
        <p style={{ fontWeight: 700 }}>Teraz najlepiej od razu poćwiczyć — wtedy zostaje w głowie.</p>
        <div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => go(practice({ kind: 'topic', topicId: topic.id }))}>
            Ćwiczę ten temat <Icon name="arrowRight" />
          </button>
          <button className="btn btn-lg" onClick={() => go(back)}>
            Wróć
          </button>
        </div>
      </div>
    );
  }

  const isCheck = card.kind === 'check';
  // Słupek odsłaniamy krok po kroku tym samym dużym przyciskiem; dopiero po ostatnim kroku idziemy do następnej karty.
  const stepsLeft = card.kind === 'division' ? divisionLayout(card.a, card.b).frames.length - 1 - frame : 0;
  const checkDivision = isCheck && !divisionGridOf(card.ex) ? writtenDivisionOf(card.ex) : null;
  return (
    <div className="practice lesson">
      <div className="pr-top">
        <button className="btn icon-btn" onClick={() => go(back)} aria-label="Zamknij lekcję">
          <Icon name="x" />
        </button>
        <div className="bar pr-progress" role="progressbar" aria-valuenow={Math.round((idx / cards.length) * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Postęp lekcji">
          <span style={{ width: `${Math.round((idx / cards.length) * 100)}%` }} />
        </div>
        <span className="muted" style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
          {idx + 1} / {cards.length}
        </span>
      </div>

      <div className="pr-body">
        {isCheck && card.ex.passage && <PassageCard passage={card.ex.passage} defaultOpen lang={lang} />}
        <div>
          <div className="pr-topic">Nauka · {topic.title}</div>
          <div className="pr-prompt">
            <h1>{isCheck ? card.ex.prompt : CARD_TITLE[card.kind]}</h1>
          </div>
          {isCheck && (
            <p className="muted" style={{ fontWeight: 700, marginTop: 4 }}>
              Sprawdź się: pytanie {card.n + 1} z {checks}
            </p>
          )}
          {card.kind === 'division' && (
            <p className="muted" style={{ fontWeight: 700, marginTop: 4 }}>
              {card.a} : {card.b}
              {card.of > 1 ? ` · przykład ${card.n} z ${card.of}` : ''}
            </p>
          )}
          {card.kind === 'pairs' && card.parts > 1 && (
            <p className="muted" style={{ fontWeight: 700, marginTop: 4 }}>
              Część {card.part} z {card.parts}
            </p>
          )}
        </div>

        {card.kind === 'key' && <LessonKey lines={lesson.key} />}
        {card.kind === 'steps' && <Steps lines={lesson.steps} />}
        {card.kind === 'example' && <Example lines={lesson.steps} />}
        {card.kind === 'division' && <DivisionSteps a={card.a} b={card.b} frame={frame} />}
        {card.kind === 'pairs' && <PairList pairs={lesson.pairs.slice(card.from, card.from + PAIRS_PER_CARD)} />}
        {card.kind === 'trick' && <LessonTrick lines={lesson.trick} />}
        {isCheck && (
          <ExerciseView
            key={idx}
            ex={card.ex}
            answer={answer}
            setAnswer={setAnswer}
            reveal={checked !== null}
            hint={false}
            seed={`${seed.current}:${card.ex.id}`}
            onEnter={checked === null ? check : next}
            lang={lang}
          />
        )}
        {checkDivision && checked !== null && <DivisionSolution key={`d${idx}`} a={checkDivision[0]} b={checkDivision[1]} />}
      </div>

      {isCheck && checked !== null ? (
        <div className={`pr-foot ${checked ? 'good' : 'bad'}`} role="status" aria-live="polite">
          <div className="fb">
            <span className="fb-icon">
              <Icon name={checked ? 'check' : 'x'} size={28} stroke={3.2} />
            </span>
            <div>
              <div className="fb-title">{checked ? 'Dobrze!' : 'Jeszcze nie'}</div>
              {!checked && <div className="fb-text">Poprawnie: {correctText(card.ex)}</div>}
              {card.ex.explain && <div className="fb-text">{card.ex.explain}</div>}
            </div>
          </div>
          <div className="fb-actions">
            <button className="btn btn-primary btn-lg" onClick={next}>
              {idx + 1 >= cards.length ? 'Kończę lekcję' : 'Dalej'}
              <Icon name="arrowRight" />
            </button>
          </div>
        </div>
      ) : (
        <div className="pr-foot pr-foot-answer">
          {(idx > 0 || frame > 0) && (
            <button className="btn" onClick={() => (frame > 0 ? setFrame(frame - 1) : open(idx - 1))}>
              <Icon name="chevronLeft" /> Wstecz
            </button>
          )}
          <span className="spacer" />
          {isCheck ? (
            <button className="btn btn-primary btn-lg" onClick={check} disabled={!isReady(card.ex, answer)}>
              Sprawdź
            </button>
          ) : stepsLeft > 0 ? (
            <button className="btn btn-primary btn-lg" onClick={() => setFrame(frame + 1)}>
              Następny krok
              <Icon name="arrowRight" />
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={next}>
              {idx + 1 >= cards.length ? 'Kończę lekcję' : 'Dalej'}
              <Icon name="arrowRight" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Powtórka przed sprawdzianem: najważniejsze rzeczy, pary „tak / nie tak” i sposoby na zapamiętanie
 * ze wszystkich podanych tematów na jednej stronie.
 */
export function ReviewSheet({ topicIds, title, from, subjectId }: { topicIds: string[]; title: string; from: 'home' | 'subject'; subjectId?: string }) {
  const { profile, go } = useApp();
  const progress = useProgress(profile.id);
  const items = store
    .topicsFor(profile.id)
    .filter((t) => topicIds.includes(t.id))
    .map((t) => ({ t, lesson: parseLesson(t.lesson) }))
    .filter((x): x is { t: typeof x.t; lesson: Lesson } => !!x.lesson && x.lesson.key.length > 0);
  const back: Screen = from === 'subject' && subjectId ? { name: 'subject', subjectId } : { name: 'home' };
  return (
    <>
      <TopBar back={() => go(back)} />
      <div className="page sheet-page">
        <div className="page-head">
          <h1>{title}</h1>
        </div>
        <p style={{ fontWeight: 700 }}>Najważniejsze rzeczy z każdego tematu na jednej stronie. Przeczytaj przed sprawdzianem — na głos zapamiętasz więcej.</p>
        {items.length === 0 && <div className="card">Te tematy nie mają jeszcze lekcji.</div>}
        {items.map(({ t, lesson }) => (
          <section key={t.id} className="card col sheet-topic" style={{ gap: 14 }}>
            <div className="row" style={{ flexWrap: 'wrap' }}>
              <h2 className="card-title" style={{ margin: 0, flex: '1 1 200px' }}>
                {t.title}
              </h2>
              <button className="btn btn-sm" onClick={() => go({ name: 'learn', topicId: t.id, nonce: Date.now(), from })}>
                <Icon name="book" size={16} /> {progress?.lessonsDone.has(t.id) ? 'Powtórz lekcję' : 'Cała lekcja'}
              </button>
            </div>
            <LessonKey lines={lesson.key} />
            {lesson.pairs.length > 0 && <PairList pairs={lesson.pairs} compact />}
            {lesson.trick.length > 0 && <LessonTrick lines={lesson.trick} />}
          </section>
        ))}
      </div>
    </>
  );
}
