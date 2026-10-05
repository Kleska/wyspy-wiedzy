import { useEffect, useRef, useState, type ReactNode } from 'react';
import { generatorsFor, trainerTopicIds } from '../content/generators';
import { SUBJECTS, subjectOf } from '../content/seed';
import { gradeOf, store } from '../data/store';
import {
  addDays,
  dateKey,
  daysUntil,
  factsSummary,
  familyGoalProgress,
  GRADE_NAMES,
  groupByUnit,
  mistakesToFix,
  sessionMistakes,
  planActive,
  planExamCount,
  planStatus,
  planTopicIds,
  recentTopicId,
  reviewCount,
  splitDone,
  quizStates,
  suggestTopic,
  unitLabel,
  untouchedTopics,
  WEEK_BONUS,
  weekStart,
  type Progress,
} from '../engine';
import { coinText, plural, type ThemeDef } from '../themes';
import type { ParsedTopic } from '../types';
import { LevelChip, LevelSteps, Modal } from './bits';
import { practice, useApp, useProgress } from './hooks';
import { Icon, Stars, type IconName } from './icons';
import { MistakeList, mistakeRows } from './Mistakes';
import { canPlayPairs, fmtTime } from './Pairs';
import { TimesGrid, useTimesMap } from './TimesTable';
import { quizPool } from './Sprint';
import { TopBar } from './TopBar';
import { TrainerButtons } from './Trainers';

type NodeState = 'next' | 'done' | 'started' | 'fresh';

function nodeState(t: ParsedTopic, p: Progress, nextId: string | undefined): NodeState {
  if (t.id === nextId) return 'next';
  const s = p.topics.get(t.id);
  if ((s?.stars ?? 0) >= 1) return 'done';
  if ((s?.level ?? 0) > 0) return 'started';
  return 'fresh';
}

const pct = (x: number) => `${Math.round(x * 100)}%`;

function subjectStats(topics: ParsedTopic[], p: Progress) {
  const stats = topics.map((t) => p.topics.get(t.id));
  const mastery = topics.length ? stats.reduce((a, s) => a + (s?.mastery ?? 0), 0) / topics.length : 0;
  const stars = stats.reduce((a, s) => a + (s?.stars ?? 0), 0);
  const due = stats.reduce((a, s) => a + (s?.dueCount ?? 0), 0);
  return { mastery, stars, maxStars: topics.length * 3, due };
}

// ─── Ekran startowy: wybór przedmiotu ─────────────────────────────────────────

/**
 * Kolejność: powitanie → „Teraz” (plan od rodzica albo polecany temat) → kartkówki → przedmioty → powtórka,
 * a niżej karty zwijane (zadania na dziś, cele, mini-gry, test na start). Tematy nie mają tu własnych kart:
 * to, co dziecko widzi na górze, wynika z planu, a nie z kodu.
 */
export function Home() {
  const { profile, theme, go } = useApp();
  const progress = useProgress(profile.id)!;
  const now = Date.now();
  const topics = store.topicsFor(profile.id);
  // Tematy skończone schodzą z planszy i z polecanych, ale zostają w powtórce, błędach i statystykach przedmiotu.
  const { active } = splitDone(topics, profile, now);
  const subjects = SUBJECTS.filter((s) => topics.some((t) => t.subject === s.id));
  const reviewN = reviewCount(topics, progress);
  const mistakes = mistakesToFix({ profileId: profile.id, attempts: store.list('attempt'), topics, now, since: profile.resetAt });
  const grade = gradeOf(profile);
  const wide = useWindowWidth() >= 900;
  const planOn = planTopicIds(profile, now).some((id) => topics.some((t) => t.id === id));

  return (
    <>
      <TopBar />
      <div className="start">
        <HelloCard progress={progress} />
        {planOn ? <PlanCard progress={progress} /> : <NowCard progress={progress} topics={active} />}
        <QuizCard progress={progress} />

        <section className="col" style={{ gap: 14 }}>
          <h2 className="section-title">Co dziś ćwiczymy?</h2>
          {subjects.length === 0 ? (
            <div className="card">Nie ma jeszcze tematów dla klasy {profile.grade ?? 3}. Rodzic może je dodać w panelu rodzica.</div>
          ) : (
            <div className="subject-grid">
              {subjects.map((s) => {
                const ts = topics.filter((t) => t.subject === s.id);
                const st = subjectStats(ts, progress);
                return (
                  <button key={s.id} className="card subject-big" data-subject={s.id} onClick={() => go({ name: 'subject', subjectId: s.id })}>
                    <span className="subject-badge" aria-hidden="true">
                      {s.short}
                    </span>
                    <span className="subject-body">
                      <span className="subject-name">{s.name}</span>
                      <span className="subject-meta">
                        {ts.length} {plural(ts.length, ['temat', 'tematy', 'tematów'])}
                        {st.due > 0 ? ` · ${st.due} do powtórki` : ''}
                      </span>
                      <span className="subject-progress">
                        <span className="bar">
                          <span style={{ width: pct(st.mastery) }} />
                        </span>
                        <b>{pct(st.mastery)}</b>
                      </span>
                      <span className="subject-stars">
                        <Icon name="star" size={18} fill="var(--gold)" stroke={1.4} style={{ color: 'var(--gold)' }} /> {st.stars} / {st.maxStars}
                      </span>
                    </span>
                    <Icon name="arrowRight" size={28} className="subject-go" />
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <div className="start-row">
          <section className="card col" style={{ gap: 12 }}>
            <h2 className="card-title" style={{ margin: 0 }}>
              Powtórka
            </h2>
            <p style={{ fontWeight: 700 }}>
              {reviewN > 0
                ? `${reviewN} ${plural(reviewN, ['zadanie czeka', 'zadania czekają', 'zadań czeka'])} na powtórkę. Powtórki pomagają zapamiętać na dłużej.`
                : 'Wszystko powtórzone. Nowe powtórki pojawią się jutro.'}
            </p>
            <button className="btn btn-lg btn-block" disabled={reviewN === 0} onClick={() => go(practice({ kind: 'review' }))}>
              <Icon name="repeat" />
              Powtórz
            </button>
            <div className="mistakes-box">
              <b>Moje błędy</b>
              <span className="muted" style={{ fontWeight: 700, fontSize: 15 }}>
                {mistakes.length > 0
                  ? `${mistakes.length} ${plural(mistakes.length, ['zadanie', 'zadania', 'zadań'])} z ostatnich 2 tygodni ${plural(mistakes.length, ['czeka', 'czekają', 'czeka'])} na poprawę.`
                  : 'Brak błędów do poprawy — super!'}
              </span>
              {mistakes.length > 0 && (
                <button
                  className="btn btn-block"
                  onClick={() =>
                    go(practice({ kind: 'fix', items: mistakes.slice(0, store.settings.sessionLength).map(({ topicId, exerciseId }) => ({ topicId, exerciseId })), subjectId: null }))
                  }
                >
                  <Icon name="pencil" /> Popraw moje błędy ({Math.min(mistakes.length, store.settings.sessionLength)})
                </button>
              )}
            </div>
          </section>
          <DailyCard progress={progress} theme={theme} wide={wide} />
          <WeekCard progress={progress} theme={theme} wide={wide} />
          <FamilyCard wide={wide} />
          <MiniGamesCard progress={progress} wide={wide} />
          {grade >= 2 && grade <= 4 && <TimesCard wide={wide} />}
          <DiagnosticCard progress={progress} topics={active} wide={wide} />
        </div>
      </div>
    </>
  );
}

/**
 * Karta zwijana z dolnej części startu. Na telefonie jest domyślnie zwinięta (start ma być krótki),
 * na szerokim ekranie — otwarta, bo karty stoją obok siebie.
 */
function Fold({ icon, title, meta, wide, className, children }: { icon: IconName; title: string; meta?: string; wide: boolean; className?: string; children: ReactNode }) {
  const [open, setOpen] = useState(wide);
  return (
    <details className={`card fold ${className ?? ''}`} open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>
        <Icon name={icon} size={26} className="fold-icon" />
        <h2 className="card-title">{title}</h2>
        {meta && <span className="fold-meta">{meta}</span>}
        <Icon name="chevronDown" size={22} className="fold-chev" />
      </summary>
      <div className="col fold-body">{children}</div>
    </details>
  );
}

/**
 * „Teraz”, gdy nie ma planu od rodzica: temat, który dziecko ostatnio ćwiczyło (także treningiem z nowymi liczbami),
 * a jeśli nic takiego nie było — temat polecany przez aplikację.
 */
function NowCard({ progress, topics }: { progress: Progress; topics: ParsedTopic[] }) {
  const { profile, theme, go, openTopic } = useApp();
  const recentId = recentTopicId({
    profileId: profile.id,
    sessions: store.list('session'),
    now: Date.now(),
    since: profile.resetAt,
    trainerTopics: trainerTopicIds,
    allowed: (id) => topics.some((t) => t.id === id),
  });
  const topic = topics.find((t) => t.id === recentId) ?? suggestTopic(topics, progress);
  if (!topic) return null;
  const subject = subjectOf(topic.subject);
  const recent = topic.id === recentId;
  // Dziecko, które właśnie ćwiczyło w tym dziale, dostaje treningi całego działu (np. słupki bez reszty i z resztą).
  const trained = recent && topic.unit ? topics.filter((t) => t.subject === topic.subject && t.unit === topic.unit) : [topic];
  return (
    <section className="card col now-card" aria-label="Teraz" style={{ gap: 12 }}>
      <div className="plan-head">
        <span className="plan-icon" aria-hidden="true">
          <Icon name="star" size={26} fill="currentColor" stroke={1.4} />
        </span>
        <div style={{ flex: '1 1 190px', minWidth: 0 }}>
          <div className="label">{recent ? 'Teraz · ostatnio ćwiczone' : 'Teraz polecamy'}</div>
          <h2 className="plan-title">{topic.title}</h2>
        </div>
      </div>
      <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
        <LevelChip level={progress.topics.get(topic.id)?.level ?? 0} small />
        <button className="link-btn" onClick={() => go({ name: 'subject', subjectId: topic.subject, unit: topic.unit?.trim() })}>
          {subject.name}
          {topic.unit ? ` · ${topic.unit}` : ''}
        </button>
      </div>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <button className="btn btn-primary btn-lg" style={{ flex: '1 1 180px' }} onClick={() => go(practice({ kind: 'topic', topicId: topic.id }))}>
          {theme.start} <Icon name="arrowRight" />
        </button>
        <button className="btn btn-lg" onClick={() => openTopic(topic.id)}>
          <Icon name="book" /> Ściąga
        </button>
      </div>
      <TrainerButtons topics={trained} home />
    </section>
  );
}

// ─── Plan od rodzica ─────────────────────────────────────────────────────────

function PlanCard({ progress }: { progress: Progress }) {
  const { profile, go } = useApp();
  const plan = profile.plan;
  if (!plan || !planActive(plan, Date.now())) return null;
  const topics = store.topicsFor(profile.id).filter((t) => plan.topicIds.includes(t.id));
  if (!topics.length) return null;
  const lvl = (t: ParsedTopic) => progress.topics.get(t.id)?.level ?? 0;
  const status = planStatus(plan, topics.map((t) => t.id), progress);
  const done = status.fluent;
  const examN = planExamCount(topics.length);
  const last = status.lastExam;
  // Trzy kroki: Nauka (lekcje) → Ćwiczenia (poziom „Biegły”) → Sprawdzian próbny (ocena 5–6).
  const lessonTopics = topics.filter((t) => t.lesson?.trim());
  const learned = lessonTopics.filter((t) => progress.lessonsDone.has(t.id)).length;
  const nextLesson = lessonTopics.find((t) => !progress.lessonsDone.has(t.id));
  const stage = nextLesson ? 1 : status.confirmed ? 4 : done < topics.length ? 2 : 3;
  // Powtórka z własnych błędów: zadania z tematów planu, w których dziecko pomyliło się w ostatnim miesiącu.
  const planMistakes = mistakesToFix({ profileId: profile.id, attempts: store.list('attempt'), topics, now: Date.now(), since: profile.resetAt, days: 30 });
  const sheetTitle = `Powtórka przed sprawdzianem${plan.title ? `: ${plan.title}` : ''}`;
  const days = plan.until ? daysUntil(plan.until, Date.now()) : null;
  const when = days === null ? '' : days <= 0 ? 'dziś' : days === 1 ? 'jutro' : `za ${days} dni`;
  const next = suggestTopic(topics, progress, plan.topicIds);
  return (
    <section className="card plan-card" aria-label="Plan od rodzica">
      <div className="plan-head">
        <span className="plan-icon" aria-hidden="true">
          <Icon name="pin" size={26} />
        </span>
        <div style={{ flex: '1 1 190px', minWidth: 0 }}>
          <div className="label">Teraz · plan od rodzica{when ? ` · termin ${when}` : ''}</div>
          <h2 className="plan-title">{plan.title || 'Tematy na teraz'}</h2>
        </div>
      </div>
      <ol className="plan-steps" aria-label="Kolejność nauki">
        {lessonTopics.length > 0 && (
          <li className={learned === lessonTopics.length ? 'done' : stage === 1 ? 'now' : ''}>
            <b>1</b>
            <span>
              Nauka
              <small>
                {learned}/{lessonTopics.length} {plural(lessonTopics.length, ['lekcja', 'lekcje', 'lekcji'])}
              </small>
            </span>
          </li>
        )}
        <li className={done === topics.length ? 'done' : stage === 2 ? 'now' : ''}>
          <b>{lessonTopics.length > 0 ? 2 : 1}</b>
          <span>
            Ćwiczenia
            <small>
              {done}/{topics.length} na poziomie „Biegły”
            </small>
          </span>
        </li>
        <li className={status.confirmed ? 'done' : stage === 3 ? 'now' : ''}>
          <b>{lessonTopics.length > 0 ? 3 : 2}</b>
          <span>
            Sprawdzian próbny
            <small>{last ? `ocena ${last.grade}` : `${examN} ${plural(examN, ['pytanie', 'pytania', 'pytań'])}`}</small>
          </span>
        </li>
      </ol>
      <div className="plan-topics">
        {topics.map((t) => (
          <button key={t.id} className="plan-topic" onClick={() => go(practice({ kind: 'topic', topicId: t.id }))}>
            <span className="plan-topic-title">
              {t.title}
              {t.lesson?.trim() && progress.lessonsDone.has(t.id) && (
                <span className="lesson-mark" title="Lekcja przeczytana">
                  <Icon name="book" size={14} />
                </span>
              )}
            </span>
            <span className="plan-topic-level">
              <LevelSteps level={lvl(t)} />
              <LevelChip level={lvl(t)} small />
            </span>
          </button>
        ))}
      </div>
      <TrainerButtons topics={topics} home />
      {status.confirmed && last ? (
        <p className="plan-done">
          <Icon name="check" stroke={3} /> Materiał opanowany! Sprawdzian próbny: {last.grade} ({GRADE_NAMES[last.grade]}), {last.correct}/{last.total}.
        </p>
      ) : (
        <p className={`plan-check ${last || done === topics.length ? '' : 'plan-check-how'}`}>
          {last ? (
            <>
              Ostatni sprawdzian próbny: <b>{last.grade} ({GRADE_NAMES[last.grade]})</b>, {last.correct}/{last.total}. Cel: ocena 5 lub 6 — poćwicz tematy i spróbuj jeszcze raz.
            </>
          ) : done === topics.length ? (
            <>Wszystkie tematy są na poziomie „Biegły”. Teraz sprawdzian próbny: {examN} pytań bez podpowiedzi. Ocena 5 lub 6 potwierdzi, że umiesz materiał.</>
          ) : (
            <>
              {lessonTopics.length > 0 ? 'Najpierw przeczytaj lekcje, potem ćwicz tematy (z podpowiedziami), a na koniec' : 'Najpierw ćwicz tematy (z podpowiedziami), potem'} zrób sprawdzian
              próbny: {examN} pytań bez podpowiedzi. Ocena 5 lub 6 potwierdzi, że umiesz materiał.
            </>
          )}
        </p>
      )}
      <div className="row" style={{ flexWrap: 'wrap' }}>
        {nextLesson && (
          <button className="btn btn-primary" onClick={() => go({ name: 'learn', topicId: nextLesson.id, nonce: Date.now(), from: 'home' })}>
            <Icon name="book" /> Nauka: {nextLesson.title} <Icon name="arrowRight" />
          </button>
        )}
        {next && done < topics.length && (
          <button className={`btn ${stage === 2 ? 'btn-primary' : ''}`} onClick={() => go(practice({ kind: 'topic', topicId: next.id }))}>
            Ćwicz: {next.title} <Icon name="arrowRight" />
          </button>
        )}
        {planMistakes.length > 0 && (
          <button
            className="btn"
            onClick={() => go(practice({ kind: 'fix', items: planMistakes.slice(0, 20).map(({ topicId, exerciseId }) => ({ topicId, exerciseId })), subjectId: null }))}
          >
            <Icon name="target" /> Popraw swoje błędy ({planMistakes.length})
          </button>
        )}
        {lessonTopics.length > 0 && (
          <button className="btn" onClick={() => go({ name: 'sheet', topicIds: lessonTopics.map((t) => t.id), title: sheetTitle, from: 'home' })}>
            <Icon name="book" /> Powtórka przed sprawdzianem
          </button>
        )}
        <button
          className={`btn ${stage >= 3 ? 'btn-primary' : ''}`}
          onClick={() =>
            go(practice({ kind: 'test', topicIds: topics.map((t) => t.id), title: plan.title ? `Próbny: ${plan.title}` : 'Sprawdzian próbny', subjectId: topics[0].subject, count: examN }))
          }
        >
          <Icon name="test" /> Sprawdzian próbny
        </button>
      </div>
    </section>
  );
}

/** Kartkówki od rodzica: do napisania (raz, bez podpowiedzi) i świeżo napisane z oceną. */
function QuizCard({ progress }: { progress: Progress }) {
  const { profile, go } = useApp();
  const topics = store.topicsFor(profile.id);
  const now = Date.now();
  // Która napisana kartkówka ma otwarty przegląd błędów.
  const [review, setReview] = useState<string | null>(null);
  const attempts = store.list('attempt');
  const items = quizStates(profile.quizzes, progress)
    .map((q) => ({ ...q, topics: topics.filter((t) => q.quiz.topicIds.includes(t.id)) }))
    // Napisana kartkówka zostaje na ekranie przez tydzień, potem wynik jest już tylko w panelu rodzica.
    .filter((q) => q.topics.length > 0 && (!q.result || now - q.result.at < 7 * 86_400_000));
  if (!items.length) return null;
  return (
    <section className="card quiz-card" aria-label="Kartkówki od rodzica">
      <div className="plan-head">
        <span className="plan-icon" aria-hidden="true">
          <Icon name="test" size={26} />
        </span>
        <div style={{ flex: '1 1 190px', minWidth: 0 }}>
          <div className="label">Od rodzica</div>
          <h2 className="plan-title">{items.length === 1 ? 'Kartkówka' : 'Kartkówki'}</h2>
        </div>
      </div>
      {items.map(({ quiz, result, topics: ts }) => {
        // Kartkówka z konkretnych zadań (np. z błędów) ma tyle pytań, ile z tych zadań jeszcze istnieje.
        const own = quiz.items?.filter((it) => ts.some((t) => t.id === it.topicId && t.exercises.some((e) => e.id === it.exerciseId)));
        const n = own ? Math.min(quiz.count, own.length) : Math.min(quiz.count, ts.reduce((a, t) => a + t.exercises.length, 0));
        if (!result && n === 0) return null;
        const wrong = result ? mistakeRows(sessionMistakes(result.sessionId, attempts), topics) : [];
        const days = quiz.until ? daysUntil(quiz.until, now) : null;
        const when = days === null ? '' : days < 0 ? ' · termin minął' : days === 0 ? ' · termin dziś' : days === 1 ? ' · termin jutro' : ` · termin za ${days} dni`;
        return (
          <div key={quiz.id} className={`quiz-row ${result ? 'done' : ''}`}>
            <div className="quiz-info">
              <b>{quiz.title}</b>
              <div className="muted quiz-meta">
                {result
                  ? `Napisana: ${result.correct}/${result.total} · ${GRADE_NAMES[result.grade]}`
                  : `${n} ${plural(n, ['pytanie', 'pytania', 'pytań'])} bez podpowiedzi${when}`}
              </div>
            </div>
            {result ? (
              // Ocena i „Zobacz błędy” to jedna, nierozdzielna para: zawsze stoją obok siebie, więc każda karta wygląda tak samo
              // (nazwa oceny jest w opisie wyżej — z długą nazwą w plakietce przycisk spadał do osobnej linii).
              <div className="quiz-result">
                <span className={`pill ${result.grade >= 4 ? 'good' : result.grade <= 2 ? 'bad' : ''}`}>ocena {result.grade}</span>
                {wrong.length > 0 && (
                  <button className="btn btn-sm" onClick={() => setReview(quiz.id)}>
                    <Icon name="eye" size={16} /> Zobacz błędy ({wrong.length})
                  </button>
                )}
              </div>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() =>
                  go(practice({ kind: 'test', topicIds: ts.map((t) => t.id), title: `Kartkówka: ${quiz.title}`, subjectId: ts[0].subject, count: n, quizId: quiz.id, ...(own ? { items: own } : {}) }))
                }
              >
                Piszę kartkówkę <Icon name="arrowRight" />
              </button>
            )}
            {review === quiz.id && (
              <Modal title={`Błędy: ${quiz.title}`} onClose={() => setReview(null)} wide>
                <p className="muted" style={{ fontWeight: 700 }}>
                  To zadania z błędną odpowiedzią. Przeczytaj wyjaśnienia, a potem popraw je — tak najszybciej zostaną w głowie.
                </p>
                <MistakeList mine rows={wrong} reportFor={profile.id} />
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => go(practice({ kind: 'fix', items: wrong.map(({ topicId, exerciseId }) => ({ topicId, exerciseId })), subjectId: null }))}
                >
                  <Icon name="repeat" /> Popraw błędy ({wrong.length})
                </button>
              </Modal>
            )}
          </div>
        );
      })}
    </section>
  );
}

// ─── Karty na dole ekranu startowego ─────────────────────────────────────────

function TimesCard({ wide }: { wide: boolean }) {
  const { profile, go } = useApp();
  const map = useTimesMap(profile.id);
  const sum = factsSummary(map);
  return (
    <Fold icon="target" title="Tabliczka mnożenia" meta={`${sum.known}/${sum.total}`} wide={wide}>
      <button className="times-mini-btn" onClick={() => go({ name: 'times' })} aria-label="Otwórz mapę tabliczki mnożenia">
        <TimesGrid map={map} mini />
      </button>
      <p style={{ fontWeight: 700 }}>
        Umiesz na pamięć {sum.label(sum.known)} z {sum.total}.{sum.weak > 0 ? ` Do poprawy: ${sum.weak}.` : ''}
      </p>
      <button className="btn btn-primary btn-block" onClick={() => go({ name: 'times' })}>
        <Icon name="target" /> Zobacz mapę i ćwicz
      </button>
    </Fold>
  );
}

function MiniGamesCard({ progress, wide }: { progress: Progress; wide: boolean }) {
  const { profile, go } = useApp();
  const gens = generatorsFor(gradeOf(profile));
  const g = gens.find((x) => x.id === 'mul') ?? gens.find((x) => !x.slow);
  const items: { key: string; icon: string; title: string; sub: string; onClick: () => void }[] = [];
  if (g) {
    const pb = progress.pairsBest.get(`pairs:${g.id}`);
    items.push({
      key: 'sg',
      icon: 'zap',
      title: `Błyskawica: ${g.title}`,
      sub: `60 sekund · rekord: ${progress.sprintBest.get(g.id) ?? 0}`,
      onClick: () => go({ name: 'sprint', game: { kind: 'gen', genId: g.id }, nonce: Date.now() }),
    });
    items.push({
      key: 'pg',
      icon: 'clock',
      title: `Pary na czas: ${g.title}`,
      sub: `6 par · rekord: ${pb ? fmtTime(pb) : '—'}`,
      onClick: () => go({ name: 'pairs', game: { kind: 'gen', genId: g.id }, nonce: Date.now() }),
    });
  }
  for (const s of SUBJECTS.filter((x) => x.id !== 'mat')) {
    if (quizPool(profile.id, s.id).length >= 5)
      items.push({
        key: `sq${s.id}`,
        icon: 'zap',
        title: `Błyskawica: ${s.name}`,
        sub: `60 sekund · rekord: ${progress.sprintBest.get(`quiz:${s.id}`) ?? 0}`,
        onClick: () => go({ name: 'sprint', game: { kind: 'quiz', subjectId: s.id }, nonce: Date.now() }),
      });
    if (canPlayPairs({ kind: 'quiz', subjectId: s.id }, profile.id)) {
      const pb = progress.pairsBest.get(`pairs:quiz:${s.id}`);
      items.push({
        key: `pq${s.id}`,
        icon: 'clock',
        title: `Pary na czas: ${s.name}`,
        sub: `6 par · rekord: ${pb ? fmtTime(pb) : '—'}`,
        onClick: () => go({ name: 'pairs', game: { kind: 'quiz', subjectId: s.id }, nonce: Date.now() }),
      });
    }
  }
  if (!items.length) return null;
  return (
    <Fold icon="zap" title="Mini-gry" wide={wide} className="challenges">
      <p className="muted" style={{ fontWeight: 700, fontSize: 14 }}>
        Szybkie gry na rekord. Więcej gier jest w każdym przedmiocie, w karcie „Wyzwania”.
      </p>
      {items.slice(0, 4).map((it) => (
        <button key={it.key} className="challenge" onClick={it.onClick}>
          <Icon name={it.icon} size={28} />
          <span>
            <b>{it.title}</b>
            <small>{it.sub}</small>
          </span>
        </button>
      ))}
    </Fold>
  );
}

const WEEK_NAMES = ['pn', 'wt', 'śr', 'cz', 'pt', 'sb', 'nd'];

function WeekCard({ progress, theme, wide }: { progress: Progress; theme: ThemeDef; wide: boolean }) {
  const w = progress.week;
  const mon = weekStart(Date.now());
  const today = dateKey(Date.now());
  const rows: [string, number, number][] = [
    [`Ucz się ${w.daysTarget} dni w tym tygodniu`, w.days, w.daysTarget],
    [`Podnieś poziom ${w.levelUpsTarget} ${plural(w.levelUpsTarget, ['tematu', 'tematów', 'tematów'])}`, w.levelUps, w.levelUpsTarget],
  ];
  return (
    <Fold icon="calendar" title="Cel tygodnia" meta={w.done ? 'zrobione' : `${Math.min(w.days, w.daysTarget)}/${w.daysTarget} dni`} wide={wide}>
      <div className="week-days">
        {WEEK_NAMES.map((n, i) => {
          const dk = dateKey(addDays(mon, i));
          const st = progress.activeDays.has(dk) ? 'on' : progress.frozenDays.has(dk) ? 'frozen' : dk === today ? 'today' : dk > today ? 'future' : '';
          return (
            <span key={dk} className={`week-day ${st}`} title={dk}>
              <span className="week-dot">{st === 'on' ? <Icon name="check" size={16} stroke={3.2} /> : st === 'frozen' ? <Icon name="snowflake" size={16} /> : ''}</span>
              <small>{n}</small>
            </span>
          );
        })}
      </div>
      {rows.map(([title, v, target]) => (
        <div key={title} className={`quest ${v >= target ? 'done' : ''}`}>
          <span className="quest-badge">{v >= target ? <Icon name="check" size={18} stroke={3.2} /> : `${Math.min(v, target)}/${target}`}</span>
          <span className="quest-title">{title}</span>
        </div>
      ))}
      <p style={{ fontWeight: 800, fontSize: 15 }}>{w.done ? `Zrobione! +${coinText(WEEK_BONUS, theme)}` : `Nagroda za cały tydzień: +${coinText(WEEK_BONUS, theme)}`}</p>
    </Fold>
  );
}

function FamilyCard({ wide }: { wide: boolean }) {
  const goal = store.settings.familyGoal;
  if (!goal) return null;
  const profiles = store.profiles();
  const fp = familyGoalProgress(goal, store.list('attempt'), store.list('session'), profiles.map((p) => p.id));
  const ratio = Math.min(1, fp.total / goal.target);
  return (
    <Fold icon="heart" title="Wspólny cel" meta={pct(ratio)} wide={wide} className="family-card">
      <b style={{ fontSize: 20 }}>{goal.title}</b>
      <div className="bar" aria-label="Postęp wspólnego celu">
        <span style={{ width: pct(ratio) }} />
      </div>
      <span style={{ fontWeight: 800 }}>
        {Math.min(fp.total, goal.target)} / {goal.target} dobrych odpowiedzi
      </span>
      <div className="family-people">
        {profiles.map((p) => (
          <span key={p.id} className="family-person">
            <span className="avatar">{p.avatar}</span> {p.name}: <b>{fp.per.get(p.id) ?? 0}</b>
          </span>
        ))}
      </div>
      <p className="muted" style={{ fontWeight: 700, fontSize: 14 }}>
        {fp.done ? 'Udało się! Powiedzcie rodzicowi, że cel jest osiągnięty.' : 'Każda dobra odpowiedź — Twoja czy rodzeństwa — przybliża Was do celu.'}
      </p>
    </Fold>
  );
}

function DiagnosticCard({ progress, topics, wide }: { progress: Progress; topics: ParsedTopic[]; wide: boolean }) {
  const { go } = useApp();
  const options = SUBJECTS.map((s) => ({ s, n: untouchedTopics(topics.filter((t) => t.subject === s.id), progress).length })).filter((x) => x.n >= 3);
  if (!options.length) return null;
  return (
    <Fold icon="compass" title="Test na start" wide={wide}>
      <p style={{ fontWeight: 700 }}>Sprawdź, co już umiesz. Tematy, które dobrze znasz, od razu dostaną poziom „Biegły” — nie trzeba ich ćwiczyć od zera.</p>
      {options.map(({ s, n }) => (
        <button key={s.id} className="btn btn-block" onClick={() => go(practice({ kind: 'diagnostic', subjectId: s.id }))}>
          {s.name} · {Math.min(n, 8) * 3} {plural(Math.min(n, 8) * 3, ['pytanie', 'pytania', 'pytań'])}
        </button>
      ))}
    </Fold>
  );
}

// ─── Ekran przedmiotu: plansza w stylu motywu ─────────────────────────────────

export function SubjectScreen({ subjectId, unit: unitFromLink }: { subjectId: string; /** Dział do otwarcia (np. z karty „Teraz”). */ unit?: string }) {
  const { profile, theme, go, openTopic } = useApp();
  const progress = useProgress(profile.id)!;
  const subject = subjectOf(subjectId);
  const now = Date.now();
  const every = store.topicsFor(profile.id).filter((t) => t.subject === subjectId);
  // Na planszy są tematy „teraz” i z biblioteki; skończone leżą w zwiniętej sekcji pod planszą.
  const { active: allTopics, done: doneTopics } = splitDone(every, profile, now);
  const planIds = planTopicIds(profile, now);
  // Działy (np. Ułamki zwykłe, Unit 0): plansza pokazuje jeden naraz. Domyślnie ten, w którym jest polecany temat.
  const units = groupByUnit(allTopics);
  const hasUnits = units.some((u) => u.unit);
  const suggestedAll = suggestTopic(allTopics, progress, planIds);
  const [unitSel, setUnitSel] = useState<string | null>(unitFromLink ?? null);
  const unit = hasUnits ? (units.find((u) => u.unit === unitSel) ?? units.find((u) => u.unit === (suggestedAll?.unit?.trim() ?? '')) ?? units[0]).unit : '';
  const topics = hasUnits ? allTopics.filter((t) => (t.unit?.trim() ?? '') === unit) : allTopics;
  const suggested = hasUnits ? suggestTopic(topics, progress, planIds) : suggestedAll;
  const st = subjectStats(every, progress);
  // Na telefonie działy stoją w jednym, przewijanym rzędzie — wybrany dział ma być widoczny od razu.
  const chipsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = chipsRef.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
    const box = chipsRef.current;
    if (el && box && box.scrollWidth > box.clientWidth) box.scrollLeft = Math.max(0, el.getBoundingClientRect().left - box.getBoundingClientRect().left + box.scrollLeft - 60);
  }, [unit]);
  const play = () => suggested && go(practice({ kind: 'topic', topicId: suggested.id }));

  const board = (() => {
    switch (theme.layout) {
      case 'map':
        return <MapBoard topics={topics} progress={progress} nextId={suggested?.id} onOpen={openTopic} theme={theme} />;
      case 'route':
        return (
          <section className="card route-card">
            <h2 className="card-title">Trasa: {subject.name}</h2>
            <div className="route-scroll">
              <div className="route">
                {topics.map((t, i) => {
                  const s = progress.topics.get(t.id);
                  const ns = nodeState(t, progress, suggested?.id);
                  return (
                    <button key={t.id} className={`stop ${ns}`} onClick={() => openTopic(t.id)}>
                      <span className="dot">{ns === 'next' ? <Icon name={theme.icon} /> : ns === 'done' ? <Icon name="check" stroke={3} /> : i + 1}</span>
                      <span className="stop-label">{t.title}</span>
                      <Stars n={s?.stars ?? 0} size={16} />
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        );
      case 'grid':
        return (
          <section className="card world">
            <div className="tiles">
              {topics.map((t, i) => {
                const s = progress.topics.get(t.id);
                const ns = nodeState(t, progress, suggested?.id);
                return (
                  <button key={t.id} className={`tile ${ns === 'next' ? 'next' : ''} ${ns === 'fresh' ? 'fresh' : ''}`} onClick={() => openTopic(t.id)}>
                    <span className="tile-num">ETAP {i + 1}</span>
                    <span className="tile-title">{t.title}</span>
                    {ns === 'next' ? <span className="play">{theme.start}</span> : <Stars n={s?.stars ?? 0} size={18} />}
                  </button>
                );
              })}
            </div>
          </section>
        );
      case 'list':
        return (
          <section className="card">
            <div className="plan-list">
              {topics.map((t) => {
                const s = progress.topics.get(t.id);
                return (
                  <div key={t.id} className="topic-row">
                    <div>
                      <div className="t-title">
                        {t.title} {planIds.includes(t.id) && <Icon name="pin" size={16} />}
                      </div>
                      <div className="t-meta">
                        <LevelChip level={s?.level ?? 0} small />
                        {s?.dueCount ? ` · ${s.dueCount} do powtórki` : ''}
                        {s?.newCount ? ` · ${s.newCount} ${plural(s.newCount, ['nowe', 'nowe', 'nowych'])}` : ''}
                      </div>
                    </div>
                    <span className="bar ink" style={{ height: 8 }}>
                      <span style={{ width: pct(s?.mastery ?? 0) }} />
                    </span>
                    <b className="pct" style={{ textAlign: 'right' }}>
                      {pct(s?.mastery ?? 0)}
                    </b>
                    <button className="btn btn-sm" onClick={() => openTopic(t.id)}>
                      Ćwicz
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        );
    }
  })();

  return (
    <>
      <TopBar back={() => go({ name: 'home' })} />
      <div className="subject-page">
        <header className="subject-head" data-subject={subjectId}>
          <span className="subject-badge" aria-hidden="true">
            {subject.short}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1>{theme.subjectTitle(subject)}</h1>
            <div className="subject-meta">
              {pct(st.mastery)} opanowane · {st.stars} z {st.maxStars} gwiazdek
            </div>
          </div>
        </header>
        {hasUnits && (
          <div className="unit-chips" role="group" aria-label="Dział" ref={chipsRef}>
            <span className="label">Dział</span>
            {units.map((u) => {
              const fluent = u.topics.filter((t) => (progress.topics.get(t.id)?.level ?? 0) >= 3).length;
              return (
                <button key={u.unit} type="button" aria-pressed={u.unit === unit} onClick={() => setUnitSel(u.unit)}>
                  {unitLabel(u.unit)}
                  <small>
                    {fluent}/{u.topics.length}
                  </small>
                </button>
              );
            })}
          </div>
        )}
        <div className="subject-layout">
          <main className="subject-board">
            {topics.length ? (
              board
            ) : (
              <div className="card">{doneTopics.length ? 'Wszystkie tematy z tego przedmiotu są skończone. Znajdziesz je niżej, a zadania z nich wracają w Powtórce.' : 'Brak tematów w tym przedmiocie.'}</div>
            )}
            {doneTopics.length > 0 && (
              <details className="card done-topics">
                <summary>
                  <Icon name="check" size={24} stroke={3} className="done-icon" />
                  <span className="done-head">
                    <b>
                      Skończone · {doneTopics.length} {plural(doneTopics.length, ['temat', 'tematy', 'tematów'])}
                    </b>
                    <small>Zadania z nich wracają w Powtórce</small>
                  </span>
                  <Icon name="chevronDown" size={22} className="fold-chev" />
                </summary>
                <div className="col" style={{ gap: 12 }}>
                  {groupByUnit(doneTopics).map((u) => (
                    <div key={u.unit} className="col" style={{ gap: 6 }}>
                      {u.unit && <span className="label">{u.unit}</span>}
                      {u.topics.map((t) => (
                        <button key={t.id} className="done-topic" onClick={() => openTopic(t.id)}>
                          <span className="done-topic-title">{t.title}</span>
                          <Stars n={progress.topics.get(t.id)?.stars ?? 0} size={16} />
                          <LevelChip level={progress.topics.get(t.id)?.level ?? 0} small />
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </main>
          <div className="subject-side">
            {suggested && (
              <aside className="card col next-card">
                <div className="label">{planIds.includes(suggested.id) ? 'Teraz · z planu rodzica' : 'Teraz polecamy'}</div>
                <h2 style={{ fontSize: 26 }}>{suggested.title}</h2>
                <LevelChip level={progress.topics.get(suggested.id)?.level ?? 0} />
                {suggested.description && <p className="rule">{suggested.description}</p>}
                <button className="btn btn-primary btn-lg btn-block" onClick={play}>
                  {theme.start}
                  <Icon name="arrowRight" />
                </button>
                <TrainerButtons topics={[suggested]} />
                <p className="muted" style={{ fontSize: 15, fontWeight: 700 }}>
                  Albo wybierz dowolny temat na planszy.
                </p>
              </aside>
            )}
            <Challenges subjectId={subjectId} topics={topics} allTopics={allTopics} doneTopics={doneTopics} scope={hasUnits ? unitLabel(unit) : undefined} progress={progress} planIds={planIds} />
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Wyzwania: sprawdzian, test na start, trening bez końca, Błyskawica ──────

function Challenges({
  subjectId,
  topics,
  allTopics,
  doneTopics,
  scope,
  progress,
  planIds,
}: {
  subjectId: string;
  /** Tematy widoczne na planszy (wybrany dział) — z nich jest sprawdzian. */
  topics: ParsedTopic[];
  /** Wszystkie tematy przedmiotu z planszy — test na start obejmuje cały przedmiot. */
  allTopics: ParsedTopic[];
  /** Tematy skończone — można je dobrać do sprawdzianu. */
  doneTopics: ParsedTopic[];
  /** Nazwa rozdziału, jeśli przedmiot jest podzielony na rozdziały. */
  scope?: string;
  progress: Progress;
  planIds: string[];
}) {
  const { profile, go } = useApp();
  const [modal, setModal] = useState<'test' | 'gen' | null>(null);
  const untouched = untouchedTopics(allTopics, progress).length;
  const gens = subjectId === 'mat' ? generatorsFor(gradeOf(profile)) : [];
  const quizOk = subjectId !== 'mat' && quizPool(profile.id, subjectId).length >= 5;
  const pairsOk = subjectId !== 'mat' && canPlayPairs({ kind: 'quiz', subjectId }, profile.id);
  const pairsBest = progress.pairsBest.get(`pairs:quiz:${subjectId}`);
  if (!topics.length && !doneTopics.length) return null;
  return (
    <section className="card col challenges" style={{ gap: 10 }}>
      <h2 className="card-title" style={{ margin: 0 }}>
        Wyzwania
      </h2>
      <button className="challenge" onClick={() => setModal('test')}>
        <Icon name="test" size={28} />
        <span>
          <b>Sprawdzian{scope ? `: ${scope}` : ''}</b>
          <small>Bez podpowiedzi, z oceną 1–6</small>
        </span>
      </button>
      {topics.some((t) => t.lesson?.trim()) && (
        <button
          className="challenge"
          onClick={() =>
            go({ name: 'sheet', topicIds: topics.filter((t) => t.lesson?.trim()).map((t) => t.id), title: `Powtórka: ${scope ?? subjectOf(subjectId).name}`, from: 'subject', subjectId })
          }
        >
          <Icon name="book" size={28} />
          <span>
            <b>Powtórka{scope ? `: ${scope}` : ''}</b>
            <small>Najważniejsze rzeczy na jednej stronie</small>
          </span>
        </button>
      )}
      {untouched >= 2 && (
        <button className="challenge" onClick={() => go(practice({ kind: 'diagnostic', subjectId }))}>
          <Icon name="compass" size={28} />
          <span>
            <b>Test na start</b>
            <small>
              Sprawdź, co już umiesz ({Math.min(untouched, 8) * 3} {plural(Math.min(untouched, 8) * 3, ['pytanie', 'pytania', 'pytań'])})
            </small>
          </span>
        </button>
      )}
      {gens.some((g) => g.id === 'mul') && (
        <button className="challenge" onClick={() => go({ name: 'times' })}>
          <Icon name="target" size={28} />
          <span>
            <b>Mapa tabliczki mnożenia</b>
            <small>Zobacz, które działania już umiesz</small>
          </span>
        </button>
      )}
      {gens.length > 0 && (
        <button className="challenge" onClick={() => setModal('gen')}>
          <Icon name="infinity" size={28} />
          <span>
            <b>Trening bez końca i mini-gry</b>
            <small>Zawsze nowe liczby · Błyskawica · Pary na czas</small>
          </span>
        </button>
      )}
      {quizOk && (
        <button className="challenge" onClick={() => go({ name: 'sprint', game: { kind: 'quiz', subjectId }, nonce: Date.now() })}>
          <Icon name="zap" size={28} />
          <span>
            <b>Błyskawica</b>
            <small>60 sekund szybkich pytań · rekord: {progress.sprintBest.get(`quiz:${subjectId}`) ?? 0}</small>
          </span>
        </button>
      )}
      {pairsOk && (
        <button className="challenge" onClick={() => go({ name: 'pairs', game: { kind: 'quiz', subjectId }, nonce: Date.now() })}>
          <Icon name="clock" size={28} />
          <span>
            <b>Pary na czas</b>
            <small>Połącz 6 par jak najszybciej · rekord: {pairsBest ? fmtTime(pairsBest) : '—'}</small>
          </span>
        </button>
      )}
      {modal === 'test' && <TestSetup subjectId={subjectId} topics={topics} doneTopics={doneTopics} scope={scope} progress={progress} planIds={planIds} onClose={() => setModal(null)} />}
      {modal === 'gen' && (
        <Modal title="Trening bez końca i mini-gry" onClose={() => setModal(null)}>
          <p className="muted" style={{ fontWeight: 700 }}>
            Za każdym razem nowe zadania. Trening — spokojnie, z podpowiedzią. Błyskawica — 60 sekund na rekord. Pary na czas — połącz 6 par jak
            najszybciej.
          </p>
          <div className="col" style={{ gap: 10 }}>
            {gens.map((g) => (
              <div key={g.id} className="gen-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b>{g.title}</b>
                  <div className="muted" style={{ fontSize: 14, fontWeight: 700 }}>
                    {g.description}
                    {!g.slow && ` · rekordy: ${progress.sprintBest.get(g.id) ?? 0} w Błyskawicy`}
                    {!g.slow && progress.pairsBest.get(`pairs:${g.id}`) ? `, ${fmtTime(progress.pairsBest.get(`pairs:${g.id}`)!)} w Parach` : ''}
                  </div>
                </div>
                <button className="btn btn-sm" onClick={() => go(practice({ kind: 'gen', genId: g.id }))}>
                  Trening
                </button>
                {!g.slow && (
                  <>
                    <button className="btn btn-sm btn-primary" onClick={() => go({ name: 'sprint', game: { kind: 'gen', genId: g.id }, nonce: Date.now() })}>
                      <Icon name="zap" size={16} /> Błyskawica
                    </button>
                    <button className="btn btn-sm btn-primary" onClick={() => go({ name: 'pairs', game: { kind: 'gen', genId: g.id }, nonce: Date.now() })}>
                      <Icon name="clock" size={16} /> Pary
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </Modal>
      )}
    </section>
  );
}

function TestSetup({
  subjectId,
  topics: boardTopics,
  doneTopics,
  scope,
  progress,
  planIds,
  onClose,
}: {
  subjectId: string;
  topics: ParsedTopic[];
  /** Tematy skończone: są na liście (z dopiskiem), ale domyślnie niezaznaczone. */
  doneTopics: ParsedTopic[];
  scope?: string;
  progress: Progress;
  planIds: string[];
  onClose: () => void;
}) {
  const { go } = useApp();
  const topics = [...boardTopics, ...doneTopics];
  const doneIds = new Set(doneTopics.map((t) => t.id));
  const planned = topics.filter((t) => planIds.includes(t.id)).map((t) => t.id);
  const started = boardTopics.filter((t) => (progress.topics.get(t.id)?.level ?? 0) > 0).map((t) => t.id);
  const [sel, setSel] = useState<string[]>(planned.length ? planned : started.length ? started : (boardTopics.length ? boardTopics : topics).map((t) => t.id));
  const [count, setCount] = useState(15);
  const available = topics.filter((t) => sel.includes(t.id)).reduce((a, t) => a + t.exercises.length, 0);
  const title = sel.length === 1 ? `Sprawdzian: ${topics.find((t) => t.id === sel[0])?.title}` : `Sprawdzian: ${subjectOf(subjectId).name}${scope ? `, ${scope}` : ''}`;
  return (
    <Modal title="Sprawdzian" onClose={onClose}>
      <p className="muted" style={{ fontWeight: 700 }}>
        Jak w szkole: bez podpowiedzi i bez poprawek. Na końcu ocena i lista błędów do poprawy.
      </p>
      <div className="field">
        <span>Z jakich tematów?</span>
        <div className="col" style={{ gap: 6 }}>
          {topics.map((t) => (
            <label key={t.id} className="check-row">
              <input type="checkbox" checked={sel.includes(t.id)} onChange={(e) => setSel((cur) => (e.target.checked ? [...cur, t.id] : cur.filter((x) => x !== t.id)))} />
              <span style={{ flex: 1 }}>
                {t.title}
                {doneIds.has(t.id) && <small className="muted"> · skończony</small>}
              </span>
              <LevelChip level={progress.topics.get(t.id)?.level ?? 0} small />
            </label>
          ))}
        </div>
      </div>
      <div className="field">
        <span>Ile pytań?</span>
        <div className="grade-grid count-grid" role="group" aria-label="Liczba pytań">
          {[10, 15, 20].map((n) => (
            <button key={n} type="button" aria-pressed={count === n} onClick={() => setCount(n)}>
              {n}
            </button>
          ))}
        </div>
      </div>
      <button
        className="btn btn-primary btn-lg btn-block"
        disabled={sel.length === 0}
        onClick={() => go(practice({ kind: 'test', topicIds: sel, title, subjectId, count: Math.min(count, available) }))}
      >
        <Icon name="test" /> Zaczynam sprawdzian
      </button>
    </Modal>
  );
}

function MapBoard({ topics, progress, nextId, onOpen, theme }: { topics: ParsedTopic[]; progress: Progress; nextId?: string; onOpen: (id: string) => void; theme: ThemeDef }) {
  const W = 380;
  const STEP = 168;
  const TOP = 96;
  const vw = useWindowWidth();
  const inner = Math.min(480, vw - 24) - 44;
  const amp = Math.max(12, Math.min(90, inner / 2 - 104));
  const pts = topics.map((_, i) => ({ x: W / 2 + Math.sin(i * 1.15) * amp, y: TOP + i * STEP }));
  const H = TOP + Math.max(0, topics.length - 1) * STEP + 140;
  return (
    <div className="map-wrap">
      <div className="island">
        <div className="island-inner">
          <div className="path" style={{ height: H }}>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" style={{ left: '50%', marginLeft: -W / 2 }}>
              <polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 18" />
            </svg>
            {topics.map((t, i) => {
              const s = progress.topics.get(t.id);
              const ns = nodeState(t, progress, nextId);
              const size = ns === 'next' ? 92 : 72;
              return (
                <div key={t.id} className="node" style={{ left: `calc(50% + ${pts[i].x - W / 2}px)`, top: pts[i].y - size / 2 }}>
                  {ns === 'next' && (
                    <span className="label" style={{ position: 'absolute', top: -30, color: 'var(--accent)', letterSpacing: '0.06em' }}>
                      {theme.start}
                    </span>
                  )}
                  <button className={`node-btn ${ns}`} onClick={() => onOpen(t.id)} aria-label={`${t.title}, ${s?.stars ?? 0} ${plural(s?.stars ?? 0, ['gwiazdka', 'gwiazdki', 'gwiazdek'])}`}>
                    {ns === 'next' ? (
                      <Icon name="star" size={40} fill="currentColor" stroke={1.4} />
                    ) : ns === 'done' ? (
                      <Icon name="check" size={30} stroke={3.2} />
                    ) : ns === 'started' ? (
                      <span style={{ fontSize: 18 }}>{pct(s?.mastery ?? 0)}</span>
                    ) : (
                      i + 1
                    )}
                  </button>
                  <span className="node-label">{t.title}</span>
                  <Stars n={s?.stars ?? 0} size={18} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function HelloCard({ progress }: { progress: Progress }) {
  const { profile, theme } = useApp();
  const inLevel = progress.xp - progress.levelFloor;
  const need = progress.levelNext - progress.levelFloor;
  const stars = [...progress.topics.values()].reduce((a, t) => a + t.stars, 0);
  return (
    <section className="card hello-card hello-wide">
      <div className="col" style={{ flex: 1, gap: 10, minWidth: 0 }}>
        <div className="hello-row">
          <span className="avatar avatar-lg">{profile.avatar}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="hello-name">
              {theme.hello}, {profile.name}!
            </div>
            <div className="hello-level">
              {theme.levelLabel(progress.level)} · {inLevel} / {need} XP
            </div>
            <div className="bar" aria-label="Postęp poziomu" style={{ marginTop: 8 }}>
              <span style={{ width: `${Math.round((inLevel / need) * 100)}%` }} />
            </div>
          </div>
        </div>
        {progress.streakAtRisk && (
          <p className="streak-note">
            <Icon name="flame" size={18} /> Poćwicz dziś, żeby nie stracić serii {progress.streak} {plural(progress.streak, ['dnia', 'dni', 'dni'])}!
            {progress.freezes > 0 ? ` Masz ${progress.freezes} ${plural(progress.freezes, ['zamrożenie', 'zamrożenia', 'zamrożeń'])} na wszelki wypadek.` : ''}
          </p>
        )}
      </div>
      <div className="stat-tiles">
        <div className="stat-tile">
          <Icon name="flame" size={24} style={{ color: '#e8662c' }} />
          <b>{progress.streak}</b>
          <small>
            {plural(progress.streak, ['dzień', 'dni', 'dni'])} z rzędu
            {progress.freezes > 0 && (
              <span className="freeze-badge" title="Zamrożenia serii">
                {' '}
                · <Icon name="snowflake" size={12} /> {progress.freezes}
              </span>
            )}
          </small>
        </div>
        <div className="stat-tile">
          <Icon name="coin" size={24} style={{ color: 'var(--gold)' }} />
          <b>{progress.coins}</b>
          <small>{plural(progress.coins, theme.coin)}</small>
        </div>
        <div className="stat-tile">
          <Icon name="star" size={24} fill="var(--gold)" stroke={1.4} style={{ color: 'var(--gold)' }} />
          <b>{stars}</b>
          <small>{plural(stars, ['gwiazdka', 'gwiazdki', 'gwiazdek'])}</small>
        </div>
      </div>
    </section>
  );
}

function DailyCard({ progress, theme, wide }: { progress: Progress; theme: ThemeDef; wide: boolean }) {
  const done = progress.quests.filter((q) => q.done).length;
  return (
    <Fold icon="flag" title="Zadania na dziś" meta={`${done}/${progress.quests.length}`} wide={wide}>
      {progress.quests.map((q) => (
        <div key={q.id} className={`quest ${q.done ? 'done' : ''}`}>
          <span className="quest-badge">{q.done ? <Icon name="check" size={18} stroke={3.2} /> : `${q.progress}/${q.target}`}</span>
          <span className="quest-title">{q.title}</span>
        </div>
      ))}
      <div className="chest">
        <div className={`chest-box ${progress.chestOpen ? 'open' : ''}`} aria-hidden="true">
          <div className="body" />
          <div className="lid" />
          <div className="band" />
        </div>
        <div className="col" style={{ gap: 6, flex: 1 }}>
          <b style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Skrzynia dnia</b>
          <span style={{ fontWeight: 700, fontSize: 15 }}>
            {progress.chestOpen ? `Otwarta! +${coinText(20, theme)}` : `Zrób wszystkie zadania: +${coinText(20, theme)}`}
          </span>
          <div className="segments">
            {progress.quests.map((q, i) => (
              <span key={i} className={i < done ? 'on' : ''} />
            ))}
          </div>
        </div>
      </div>
    </Fold>
  );
}

function useWindowWidth() {
  const [w, setW] = useState(() => (typeof window === 'undefined' ? 1024 : window.innerWidth));
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return w;
}
