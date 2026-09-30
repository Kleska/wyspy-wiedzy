import { useEffect, useMemo, useState } from 'react';
import { subjectOf } from '../content/seed';
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

export function Home() {
  const { profile, theme, go, openTopic } = useApp();
  const progress = useProgress(profile.id)!;
  const topics = store.topics();
  const subjects = useMemo(() => [...new Set(topics.map((t) => t.subject))], [topics]);
  const [subject, setSubject] = useState<string>(() => subjects[0] ?? 'pl');
  const current = subjects.includes(subject) ? subject : subjects[0];
  const inSubject = topics.filter((t) => t.subject === current);
  const suggested = suggestTopic(topics, progress);
  const suggestedHere = suggestTopic(inSubject, progress);
  const reviewN = reviewCount(topics, progress);

  const startSuggested = () => suggested && go({ name: 'practice', topicId: suggested.id, nonce: Date.now() });

  const board = (() => {
    switch (theme.layout) {
      case 'map':
        return (
          <>
            <SubjectTabs subjects={subjects} current={current} onPick={setSubject} label={(id) => subjectOf(id).island} />
            <MapBoard topics={inSubject} progress={progress} nextId={suggestedHere?.id} onOpen={openTopic} theme={theme} />
          </>
        );
      case 'route':
        return (
          <>
            {suggested && (
              <section className="card panel flight-plan">
                <div className="label" style={{ color: 'var(--accent)' }}>
                  Plan lotu na dziś
                </div>
                <h2>Cześć, {profile.name}! Gotowy do startu?</h2>
                <div className="row" style={{ flexWrap: 'wrap' }}>
                  <button className="btn btn-primary btn-lg" onClick={startSuggested}>
                    Startuj: {suggested.title}
                    <Icon name="arrowRight" />
                  </button>
                </div>
              </section>
            )}
            <section className="card route-card">
              <h2 className="card-title">Trasa: {subjectOf(current).name}</h2>
              <div className="route-scroll">
                <div className="route">
                  {inSubject.map((t, i) => {
                    const s = progress.topics.get(t.id);
                    const ns = nodeState(t, progress, suggestedHere?.id);
                    return (
                      <button key={t.id} className={`stop ${ns}`} onClick={() => openTopic(t.id)}>
                        <span className="dot">{ns === 'next' ? <Icon name="plane" /> : ns === 'done' ? <Icon name="check" stroke={3} /> : i + 1}</span>
                        <span className="stop-label">{t.title}</span>
                        <Stars n={s?.stars ?? 0} size={14} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
            <div className="subject-cards">
              {subjects.map((id) => {
                const sub = subjectOf(id);
                const ts = topics.filter((t) => t.subject === id);
                const m = ts.length ? ts.reduce((a, t) => a + (progress.topics.get(t.id)?.mastery ?? 0), 0) / ts.length : 0;
                return (
                  <button key={id} className="card subject-card" aria-pressed={id === current} onClick={() => setSubject(id)}>
                    <span className="row">
                      <span className="subject-code">{sub.short}</span>
                      <b style={{ fontSize: 17 }}>{sub.name}</b>
                    </span>
                    <span className="bar" style={{ height: 8 }}>
                      <span style={{ width: pct(m), background: '#1d6fb8' }} />
                    </span>
                    <span className="muted" style={{ fontSize: 13, fontWeight: 700 }}>
                      {pct(m)} trasy
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        );
      case 'grid':
        return (
          <>
            {subjects.map((id, wi) => {
              const ts = topics.filter((t) => t.subject === id);
              const next = suggestTopic(ts, progress);
              const stars = ts.reduce((a, t) => a + (progress.topics.get(t.id)?.stars ?? 0), 0);
              return (
                <section key={id} className="card world">
                  <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <h2>
                      ŚWIAT {wi + 1} · {subjectOf(id).name.toUpperCase()}
                    </h2>
                    <span className="muted" style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>
                      ★ {stars}/{ts.length * 3}
                    </span>
                  </div>
                  <div className="tiles">
                    {ts.map((t, i) => {
                      const s = progress.topics.get(t.id);
                      const ns = nodeState(t, progress, next?.id);
                      return (
                        <button key={t.id} className={`tile ${ns === 'next' ? 'next' : ''} ${ns === 'fresh' ? 'fresh' : ''}`} onClick={() => openTopic(t.id)}>
                          <span className="tile-num">
                            {wi + 1}-{i + 1}
                          </span>
                          <span className="tile-title">{t.title}</span>
                          {ns === 'next' ? <span className="play">{theme.start}</span> : <Stars n={s?.stars ?? 0} size={16} />}
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </>
        );
      case 'list':
        return (
          <>
            {subjects.map((id) => (
              <section key={id} className="card" style={{ marginBottom: 18 }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <h2 className="card-title" style={{ margin: 0 }}>
                    {subjectOf(id).name}
                  </h2>
                  <span className="muted" style={{ fontSize: 14 }}>
                    opanowanie
                  </span>
                </div>
                <div className="plan-list">
                  {topics
                    .filter((t) => t.subject === id)
                    .map((t) => {
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
            ))}
          </>
        );
    }
  })();

  return (
    <>
      <TopBar />
      <div className="home">
        <main>
          {topics.length === 0 ? (
            <div className="card map-empty">Nie ma jeszcze tematów. Poproś rodzica, żeby dodał je w panelu rodzica.</div>
          ) : (
            board
          )}
        </main>
        <aside className="side">
          <HelloCard progress={progress} onPlay={startSuggested} suggested={suggested} />
          <DailyCard progress={progress} theme={theme} />
          <section className="card">
            <h2 className="card-title">Powtórka</h2>
            <p className="muted" style={{ fontWeight: 700, marginBottom: 12 }}>
              {reviewN > 0
                ? `${reviewN} ${plural(reviewN, ['zadanie czeka', 'zadania czekają', 'zadań czeka'])} na powtórkę. Powtórki pomagają zapamiętać na dłużej.`
                : 'Wszystko powtórzone. Nowe powtórki pojawią się jutro.'}
            </p>
            <button className="btn btn-block" disabled={reviewN === 0} onClick={() => go({ name: 'practice', topicId: null, nonce: Date.now() })}>
              <Icon name="repeat" />
              Powtórz
            </button>
          </section>
        </aside>
      </div>
    </>
  );
}

function SubjectTabs({ subjects, current, onPick, label }: { subjects: string[]; current: string; onPick: (id: string) => void; label: (id: string) => string }) {
  if (subjects.length < 2) return null;
  return (
    <div className="subject-tabs" role="group" aria-label="Przedmioty">
      {subjects.map((id) => (
        <button key={id} className="subject-tab" aria-pressed={id === current} onClick={() => onPick(id)}>
          {label(id)}
        </button>
      ))}
    </div>
  );
}

function MapBoard({
  topics,
  progress,
  nextId,
  onOpen,
  theme,
}: {
  topics: ParsedTopic[];
  progress: Progress;
  nextId?: string;
  onOpen: (id: string) => void;
  theme: ThemeDef;
}) {
  const W = 360;
  const STEP = 150;
  const TOP = 90;
  const vw = useWindowWidth();
  const inner = Math.min(440, vw - 24) - 44;
  const amp = Math.max(16, Math.min(88, inner / 2 - 92));
  const pts = topics.map((_, i) => ({ x: W / 2 + Math.sin(i * 1.15) * amp, y: TOP + i * STEP }));
  const H = TOP + Math.max(0, topics.length - 1) * STEP + 130;
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
                  <Stars n={s?.stars ?? 0} size={16} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function HelloCard({ progress, onPlay, suggested }: { progress: Progress; onPlay: () => void; suggested: ParsedTopic | null }) {
  const { profile, theme } = useApp();
  const inLevel = progress.xp - progress.levelFloor;
  const need = progress.levelNext - progress.levelFloor;
  const stars = [...progress.topics.values()].reduce((a, t) => a + t.stars, 0);
  return (
    <section className="card hello-card">
      <div className="hello-row">
        <span className="avatar avatar-lg">{profile.avatar}</span>
        <div>
          <div className="hello-name">
            {theme.hello}, {profile.name}!
          </div>
          <div className="muted" style={{ fontWeight: 800, fontSize: 14 }}>
            {theme.levelLabel(progress.level)} · {inLevel} / {need} XP
          </div>
        </div>
      </div>
      <div className="bar" aria-label="Postęp poziomu">
        <span style={{ width: `${Math.round((inLevel / need) * 100)}%` }} />
      </div>
      <div className="stat-tiles">
        <div className="stat-tile">
          <Icon name="flame" size={22} style={{ color: '#e8662c' }} />
          <b>{progress.streak}</b>
          <small>{plural(progress.streak, ['dzień', 'dni', 'dni'])} z rzędu</small>
        </div>
        <div className="stat-tile">
          <Icon name="coin" size={22} style={{ color: 'var(--gold)' }} />
          <b>{progress.coins}</b>
          <small>{plural(progress.coins, theme.coin)}</small>
        </div>
        <div className="stat-tile">
          <Icon name="star" size={22} fill="var(--gold)" stroke={1.4} style={{ color: 'var(--gold)' }} />
          <b>{stars}</b>
          <small>{plural(stars, ['gwiazdka', 'gwiazdki', 'gwiazdek'])}</small>
        </div>
      </div>
      {suggested && theme.layout !== 'route' && (
        <button className="btn btn-primary btn-lg btn-block" onClick={onPlay}>
          {theme.start} {suggested.title}
        </button>
      )}
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
          <b style={{ fontFamily: 'var(--font-display)', fontSize: 19 }}>Skrzynia dnia</b>
          <span className="muted" style={{ fontWeight: 700, fontSize: 14 }}>
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
