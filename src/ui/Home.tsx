import { useEffect, useState } from 'react';
import { SUBJECTS, subjectOf } from '../content/seed';
import { store } from '../data/store';
import { reviewCount, suggestTopic, type Progress } from '../engine';
import { coinText, plural, type ThemeDef } from '../themes';
import type { ParsedTopic } from '../types';
import { useApp, useProgress } from './hooks';
import { Icon, Stars } from './icons';
import { TopBar } from './TopBar';

type NodeState = 'next' | 'done' | 'started' | 'fresh';

function nodeState(t: ParsedTopic, p: Progress, nextId: string | undefined): NodeState {
  if (t.id === nextId) return 'next';
  const s = p.topics.get(t.id);
  if ((s?.stars ?? 0) >= 1) return 'done';
  if ((s?.seen ?? 0) > 0) return 'started';
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

  return (
    <>
      <TopBar />
      <div className="start">
        <HelloCard progress={progress} />

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
            <button className="btn btn-lg btn-block" disabled={reviewN === 0} onClick={() => go({ name: 'practice', topicId: null, nonce: Date.now() })}>
              <Icon name="repeat" />
              Powtórz
            </button>
          </section>
          <DailyCard progress={progress} theme={theme} />
        </div>
      </div>
    </>
  );
}

// ─── Ekran przedmiotu: plansza w stylu motywu ─────────────────────────────────

export function SubjectScreen({ subjectId }: { subjectId: string }) {
  const { profile, theme, go, openTopic } = useApp();
  const progress = useProgress(profile.id)!;
  const subject = subjectOf(subjectId);
  const topics = store.topicsFor(profile.id).filter((t) => t.subject === subjectId);
  const suggested = suggestTopic(topics, progress);
  const st = subjectStats(topics, progress);
  const play = () => suggested && go({ name: 'practice', topicId: suggested.id, nonce: Date.now() });

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
                      <div className="t-title">{t.title}</div>
                      <div className="t-meta">
                        {s?.dueCount ? `${s.dueCount} do powtórki · ` : ''}
                        {s?.newCount ? `${s.newCount} nowych · ` : ''}
                        {t.exercises.length} zadań
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
        <header className="subject-head">
          <span className="subject-badge" aria-hidden="true">
            {subject.short}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1>{theme.layout === 'map' ? subject.island : theme.layout === 'grid' ? `ŚWIAT: ${subject.name.toUpperCase()}` : subject.name}</h1>
            <div className="subject-meta">
              {pct(st.mastery)} opanowane · {st.stars} / {st.maxStars} gwiazdek
            </div>
          </div>
        </header>
        <div className="subject-layout">
          <main className="subject-board">{topics.length ? board : <div className="card">Brak tematów w tym przedmiocie.</div>}</main>
          {suggested && (
            <aside className="card col next-card">
              <div className="label">Teraz polecamy</div>
              <h2 style={{ fontSize: 26 }}>{suggested.title}</h2>
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
        </div>
      </div>
    </>
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
                  <button className={`node-btn ${ns}`} onClick={() => onOpen(t.id)} aria-label={`${t.title}, ${s?.stars ?? 0} gwiazdek`}>
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
      <div className="stat-tiles">
        <div className="stat-tile">
          <Icon name="flame" size={24} style={{ color: '#e8662c' }} />
          <b>{progress.streak}</b>
          <small>{plural(progress.streak, ['dzień', 'dni', 'dni'])} z rzędu</small>
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
