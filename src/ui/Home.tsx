import { useEffect, useState } from 'react';
import { generatorsFor } from '../content/generators';
import { SUBJECTS, subjectOf } from '../content/seed';
import { gradeOf, store } from '../data/store';
import {
  addDays,
  dateKey,
  daysUntil,
  factsSummary,
  familyGoalProgress,
  mistakesToFix,
  planActive,
  reviewCount,
  suggestTopic,
  untouchedTopics,
  WEEK_BONUS,
  weekStart,
  type Progress,
} from '../engine';
import { coinText, plural, type ThemeDef } from '../themes';
import type { ParsedTopic } from '../types';
import { LevelChip, LevelSteps, Modal } from './bits';
import { practice, useApp, useProgress } from './hooks';
import { Icon, Stars } from './icons';
import { canPlayPairs, fmtTime } from './Pairs';
import { TimesGrid, useTimesMap } from './TimesTable';
import { quizPool } from './Sprint';
import { TopBar } from './TopBar';

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

export function Home() {
  const { profile, theme, go } = useApp();
  const progress = useProgress(profile.id)!;
  const topics = store.topicsFor(profile.id);
  const subjects = SUBJECTS.filter((s) => topics.some((t) => t.subject === s.id));
  const reviewN = reviewCount(topics, progress);
  const mistakes = mistakesToFix({ profileId: profile.id, attempts: store.list('attempt'), topics, now: Date.now(), since: profile.resetAt });
  const grade = gradeOf(profile);

  return (
    <>
      <TopBar />
      <div className="start">
        <HelloCard progress={progress} />
        <PlanCard progress={progress} />

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
          <DailyCard progress={progress} theme={theme} />
          <MiniGamesCard progress={progress} />
        </div>

        <div className="start-row">
          {grade >= 2 && grade <= 4 && <TimesCard />}
          <WeekCard progress={progress} theme={theme} />
          <FamilyCard />
          <DiagnosticCard progress={progress} topics={topics} />
        </div>
      </div>
    </>
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
  const done = topics.filter((t) => lvl(t) >= 3).length;
  const days = plan.until ? daysUntil(plan.until, Date.now()) : null;
  const when = days === null ? '' : days <= 0 ? 'dziś' : days === 1 ? 'jutro' : `za ${days} dni`;
  const next = suggestTopic(topics, progress, plan.topicIds);
  return (
    <section className="card plan-card" aria-label="Plan od rodzica">
      <div className="plan-head">
        <span className="plan-icon" aria-hidden="true">
          <Icon name="pin" size={26} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="label">Plan od rodzica{when ? ` · termin ${when}` : ''}</div>
          <h2 className="plan-title">{plan.title || 'Tematy na teraz'}</h2>
        </div>
        <span className="pill">
          {done}/{topics.length} na poziomie „Biegły”
        </span>
      </div>
      <div className="plan-topics">
        {topics.map((t) => (
          <button key={t.id} className="plan-topic" onClick={() => go(practice({ kind: 'topic', topicId: t.id }))}>
            <span className="plan-topic-title">{t.title}</span>
            <span className="plan-topic-level">
              <LevelSteps level={lvl(t)} />
              <LevelChip level={lvl(t)} small />
            </span>
          </button>
        ))}
      </div>
      {done === topics.length ? (
        <p className="plan-done">
          <Icon name="check" stroke={3} /> Plan wykonany! Wszystkie tematy są na poziomie „Biegły”. Możesz zrobić sprawdzian próbny.
        </p>
      ) : null}
      <div className="row" style={{ flexWrap: 'wrap' }}>
        {next && done < topics.length && (
          <button className="btn btn-primary" onClick={() => go(practice({ kind: 'topic', topicId: next.id }))}>
            Ćwicz: {next.title} <Icon name="arrowRight" />
          </button>
        )}
        <button
          className="btn"
          onClick={() =>
            go(practice({ kind: 'test', topicIds: topics.map((t) => t.id), title: plan.title ? `Próbny: ${plan.title}` : 'Sprawdzian próbny', subjectId: topics[0].subject, count: 15 }))
          }
        >
          <Icon name="test" /> Sprawdzian próbny
        </button>
      </div>
    </section>
  );
}

// ─── Karty na dole ekranu startowego ─────────────────────────────────────────

function TimesCard() {
  const { profile, go } = useApp();
  const map = useTimesMap(profile.id);
  const sum = factsSummary(map);
  return (
    <section className="card col" style={{ gap: 12 }}>
      <h2 className="card-title" style={{ margin: 0 }}>
        Tabliczka mnożenia
      </h2>
      <button className="times-mini-btn" onClick={() => go({ name: 'times' })} aria-label="Otwórz mapę tabliczki mnożenia">
        <TimesGrid map={map} mini />
      </button>
      <p style={{ fontWeight: 700 }}>
        Umiesz na pamięć {sum.label(sum.known)} z {sum.total}.{sum.weak > 0 ? ` Do poprawy: ${sum.weak}.` : ''}
      </p>
      <button className="btn btn-primary btn-block" onClick={() => go({ name: 'times' })}>
        <Icon name="target" /> Zobacz mapę i ćwicz
      </button>
    </section>
  );
}

function MiniGamesCard({ progress }: { progress: Progress }) {
  const { profile, go } = useApp();
  const gens = generatorsFor(gradeOf(profile));
  const g = gens.find((x) => x.id === 'mul') ?? gens[0];
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
    <section className="card col challenges" style={{ gap: 10 }}>
      <div className="row" style={{ gap: 10 }}>
        <Icon name="zap" size={26} className="ic-games" />
        <h2 className="card-title" style={{ margin: 0 }}>
          Mini-gry
        </h2>
      </div>
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
    </section>
  );
}

const WEEK_NAMES = ['pn', 'wt', 'śr', 'cz', 'pt', 'sb', 'nd'];

function WeekCard({ progress, theme }: { progress: Progress; theme: ThemeDef }) {
  const w = progress.week;
  const mon = weekStart(Date.now());
  const today = dateKey(Date.now());
  const rows: [string, number, number][] = [
    [`Ucz się ${w.daysTarget} dni w tym tygodniu`, w.days, w.daysTarget],
    [`Podnieś poziom ${w.levelUpsTarget} ${plural(w.levelUpsTarget, ['tematu', 'tematów', 'tematów'])}`, w.levelUps, w.levelUpsTarget],
  ];
  return (
    <section className="card col" style={{ gap: 12 }}>
      <h2 className="card-title" style={{ margin: 0 }}>
        Cel tygodnia
      </h2>
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
    </section>
  );
}

function FamilyCard() {
  const goal = store.settings.familyGoal;
  if (!goal) return null;
  const profiles = store.profiles();
  const fp = familyGoalProgress(goal, store.list('attempt'), store.list('session'), profiles.map((p) => p.id));
  const ratio = Math.min(1, fp.total / goal.target);
  return (
    <section className="card col family-card" style={{ gap: 12 }}>
      <div className="row" style={{ gap: 10 }}>
        <Icon name="heart" size={26} className="ic-heart" />
        <h2 className="card-title" style={{ margin: 0 }}>
          Wspólny cel
        </h2>
      </div>
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
    </section>
  );
}

function DiagnosticCard({ progress, topics }: { progress: Progress; topics: ParsedTopic[] }) {
  const { go } = useApp();
  const options = SUBJECTS.map((s) => ({ s, n: untouchedTopics(topics.filter((t) => t.subject === s.id), progress).length })).filter((x) => x.n >= 3);
  if (!options.length) return null;
  return (
    <section className="card col" style={{ gap: 12 }}>
      <div className="row" style={{ gap: 10 }}>
        <Icon name="compass" size={26} />
        <h2 className="card-title" style={{ margin: 0 }}>
          Test na start
        </h2>
      </div>
      <p style={{ fontWeight: 700 }}>Sprawdź, co już umiesz. Tematy, które dobrze znasz, od razu dostaną poziom „Biegły” — nie trzeba ich ćwiczyć od zera.</p>
      {options.map(({ s, n }) => (
        <button key={s.id} className="btn btn-block" onClick={() => go(practice({ kind: 'diagnostic', subjectId: s.id }))}>
          {s.name} · {Math.min(n, 8) * 3} {plural(Math.min(n, 8) * 3, ['pytanie', 'pytania', 'pytań'])}
        </button>
      ))}
    </section>
  );
}

// ─── Ekran przedmiotu: plansza w stylu motywu ─────────────────────────────────

export function SubjectScreen({ subjectId }: { subjectId: string }) {
  const { profile, theme, go, openTopic } = useApp();
  const progress = useProgress(profile.id)!;
  const subject = subjectOf(subjectId);
  const topics = store.topicsFor(profile.id).filter((t) => t.subject === subjectId);
  const planIds = planActive(profile.plan, Date.now()) ? profile.plan!.topicIds : [];
  const suggested = suggestTopic(topics, progress, planIds);
  const st = subjectStats(topics, progress);
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
                      <span className="dot">{ns === 'next' ? <Icon name="plane" /> : ns === 'done' ? <Icon name="check" stroke={3} /> : i + 1}</span>
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
            <h1>{theme.layout === 'map' ? subject.island : theme.layout === 'grid' ? `ŚWIAT: ${subject.name.toUpperCase()}` : subject.name}</h1>
            <div className="subject-meta">
              {pct(st.mastery)} opanowane · {st.stars} z {st.maxStars} gwiazdek
            </div>
          </div>
        </header>
        <div className="subject-layout">
          <main className="subject-board">{topics.length ? board : <div className="card">Brak tematów w tym przedmiocie.</div>}</main>
          <div className="subject-side">
            {suggested && (
              <aside className="card col next-card">
                <div className="label">{planIds.includes(suggested.id) ? 'Z planu rodzica' : 'Teraz polecamy'}</div>
                <h2 style={{ fontSize: 26 }}>{suggested.title}</h2>
                <LevelChip level={progress.topics.get(suggested.id)?.level ?? 0} />
                {suggested.description && <p className="rule">{suggested.description}</p>}
                <button className="btn btn-primary btn-lg btn-block" onClick={play}>
                  {theme.start}
                  <Icon name="arrowRight" />
                </button>
                <p className="muted" style={{ fontSize: 15, fontWeight: 700 }}>
                  Albo wybierz dowolny temat na planszy.
                </p>
              </aside>
            )}
            <Challenges subjectId={subjectId} topics={topics} progress={progress} planIds={planIds} />
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Wyzwania: sprawdzian, test na start, trening bez końca, Błyskawica ──────

function Challenges({ subjectId, topics, progress, planIds }: { subjectId: string; topics: ParsedTopic[]; progress: Progress; planIds: string[] }) {
  const { profile, go } = useApp();
  const [modal, setModal] = useState<'test' | 'gen' | null>(null);
  const untouched = untouchedTopics(topics, progress).length;
  const gens = subjectId === 'mat' ? generatorsFor(gradeOf(profile)) : [];
  const quizOk = subjectId !== 'mat' && quizPool(profile.id, subjectId).length >= 5;
  const pairsOk = subjectId !== 'mat' && canPlayPairs({ kind: 'quiz', subjectId }, profile.id);
  const pairsBest = progress.pairsBest.get(`pairs:quiz:${subjectId}`);
  if (!topics.length) return null;
  return (
    <section className="card col challenges" style={{ gap: 10 }}>
      <h2 className="card-title" style={{ margin: 0 }}>
        Wyzwania
      </h2>
      <button className="challenge" onClick={() => setModal('test')}>
        <Icon name="test" size={28} />
        <span>
          <b>Sprawdzian</b>
          <small>Bez podpowiedzi, z oceną 1–6</small>
        </span>
      </button>
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
      {modal === 'test' && <TestSetup subjectId={subjectId} topics={topics} progress={progress} planIds={planIds} onClose={() => setModal(null)} />}
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
                    {g.description} · rekordy: {progress.sprintBest.get(g.id) ?? 0} w Błyskawicy
                    {progress.pairsBest.get(`pairs:${g.id}`) ? `, ${fmtTime(progress.pairsBest.get(`pairs:${g.id}`)!)} w Parach` : ''}
                  </div>
                </div>
                <button className="btn btn-sm" onClick={() => go(practice({ kind: 'gen', genId: g.id }))}>
                  Trening
                </button>
                <button className="btn btn-sm btn-primary" onClick={() => go({ name: 'sprint', game: { kind: 'gen', genId: g.id }, nonce: Date.now() })}>
                  <Icon name="zap" size={16} /> Błyskawica
                </button>
                <button className="btn btn-sm btn-primary" onClick={() => go({ name: 'pairs', game: { kind: 'gen', genId: g.id }, nonce: Date.now() })}>
                  <Icon name="clock" size={16} /> Pary
                </button>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </section>
  );
}

function TestSetup({ subjectId, topics, progress, planIds, onClose }: { subjectId: string; topics: ParsedTopic[]; progress: Progress; planIds: string[]; onClose: () => void }) {
  const { go } = useApp();
  const planned = topics.filter((t) => planIds.includes(t.id)).map((t) => t.id);
  const started = topics.filter((t) => (progress.topics.get(t.id)?.level ?? 0) > 0).map((t) => t.id);
  const [sel, setSel] = useState<string[]>(planned.length ? planned : started.length ? started : topics.map((t) => t.id));
  const [count, setCount] = useState(15);
  const available = topics.filter((t) => sel.includes(t.id)).reduce((a, t) => a + t.exercises.length, 0);
  const title = sel.length === 1 ? `Sprawdzian: ${topics.find((t) => t.id === sel[0])?.title}` : `Sprawdzian: ${subjectOf(subjectId).name}`;
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
              <span style={{ flex: 1 }}>{t.title}</span>
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

function DailyCard({ progress, theme }: { progress: Progress; theme: ThemeDef }) {
  const done = progress.quests.filter((q) => q.done).length;
  return (
    <section className="card col" style={{ gap: 12 }}>
      <h2 className="card-title" style={{ margin: 0 }}>
        Zadania na dziś
      </h2>
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
    </section>
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
