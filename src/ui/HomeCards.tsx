import { useState, type ReactNode } from 'react';
import { generatorsFor } from '../content/generators';
import { SUBJECTS } from '../content/seed';
import { gradeOf, nowIso, store } from '../data/store';
import {
  addDays,
  dateKey,
  daysUntil,
  factsSummary,
  familyGoalProgress,
  GRADE_NAMES,
  hideQuizzes,
  isQuizHidden,
  quizStates,
  sessionMistakes,
  untouchedTopics,
  WEEK_BONUS,
  weekStart,
  type Progress,
} from '../engine';
import { coinText, plural, type ThemeDef } from '../themes';
import type { ParsedTopic } from '../types';
import { Modal } from './bits';
import { practice, useApp } from './hooks';
import { Icon, type IconName } from './icons';
import { MistakeList, mistakeRows } from './Mistakes';
import { canPlayPairs, fmtTime } from './Pairs';
import { quizPool } from './Sprint';
import { TimesGrid, useTimesMap } from './TimesTable';

const pct = (x: number) => `${Math.round(x * 100)}%`;

export function Fold({
  icon,
  title,
  meta,
  wide,
  className,
  children,
}: {
  icon: IconName;
  title: string;
  meta?: string;
  wide: boolean;
  className?: string;
  children: ReactNode;
}) {
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

export function QuizCard({ progress }: { progress: Progress }) {
  const { profile, go } = useApp();
  const topics = store.topicsFor(profile.id);
  const now = Date.now();
  // Która napisana kartkówka ma otwarty przegląd błędów.
  const [review, setReview] = useState<string | null>(null);
  const attempts = store.list('attempt');
  const items = quizStates(profile.quizzes, progress)
    .map((q) => ({ ...q, topics: topics.filter((t) => q.quiz.topicIds.includes(t.id)) }))
    // Napisana kartkówka zostaje na ekranie przez tydzień (chyba że dziecko albo rodzic ją schowa), potem wynik jest już tylko w panelu rodzica.
    .filter((q) => q.topics.length > 0 && (!q.result || (now - q.result.at < 7 * 86_400_000 && !isQuizHidden(profile, q.quiz.id, 'child'))));
  if (!items.length) return null;
  const written = items.filter((q) => q.result).map((q) => q.quiz.id);
  // Chowanie zapisujemy na aktualnej wersji osoby ze store (outbox pamięta wersję sprzed zmiany).
  const hide = (ids: string[]) => {
    const cur = store.get('profile', profile.id);
    if (cur) void store.put('profile', { ...cur, ...hideQuizzes(cur, ids, 'child', true, nowIso()), updatedAt: nowIso() });
  };
  return (
    <section className="card quiz-card" aria-label="Kartkówki od rodzica">
      <div className="plan-head">
        <span className="plan-icon" aria-hidden="true">
          <Icon name="test" size={26} />
        </span>
        <div style={{ flex: '1 1 150px', minWidth: 0 }}>
          <div className="label">Od rodzica</div>
          <h2 className="plan-title">{items.length === 1 ? 'Kartkówka' : 'Kartkówki'}</h2>
        </div>
        {written.length >= 2 && (
          <button className="btn btn-sm" onClick={() => hide(written)}>
            <Icon name="eyeOff" size={16} /> Schowaj napisane
          </button>
        )}
      </div>
      {items.map(({ quiz, result, topics: ts }) => {
        // Kartkówka z konkretnych zadań (np. z błędów) ma tyle pytań, ile z tych zadań jeszcze istnieje.
        const own = quiz.items?.filter((it) => ts.some((t) => t.id === it.topicId && t.exercises.some((e) => e.id === it.exerciseId)));
        const n = own
          ? Math.min(quiz.count, own.length)
          : Math.min(
              quiz.count,
              ts.reduce((a, t) => a + t.exercises.length, 0),
            );
        if (!result && n === 0) return null;
        const wrong = result ? mistakeRows(sessionMistakes(result.sessionId, attempts), topics) : [];
        const days = quiz.until ? daysUntil(quiz.until, now) : null;
        const when =
          days === null ? '' : days < 0 ? ' · termin minął' : days === 0 ? ' · termin dziś' : days === 1 ? ' · termin jutro' : ` · termin za ${days} dni`;
        return (
          <div key={quiz.id} className={`quiz-row ${result ? 'done' : ''}`}>
            {result && (
              <button className="quiz-hide" onClick={() => hide([quiz.id])} aria-label={`Schowaj kartkówkę: ${quiz.title}`} title="Schowaj">
                <Icon name="x" size={18} stroke={2.6} />
              </button>
            )}
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
                  go(
                    practice({
                      kind: 'test',
                      topicIds: ts.map((t) => t.id),
                      title: `Kartkówka: ${quiz.title}`,
                      subjectId: ts[0].subject,
                      count: n,
                      quizId: quiz.id,
                      ...(own ? { items: own } : {}),
                    }),
                  )
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

export function TimesCard({ wide }: { wide: boolean }) {
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

export function MiniGamesCard({ progress, wide }: { progress: Progress; wide: boolean }) {
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
      onClick: () => go({ name: 'sprint', game: { kind: 'gen', genId: g.id, home: true }, nonce: Date.now() }),
    });
    items.push({
      key: 'pg',
      icon: 'clock',
      title: `Pary na czas: ${g.title}`,
      sub: `6 par · rekord: ${pb ? fmtTime(pb) : '—'}`,
      onClick: () => go({ name: 'pairs', game: { kind: 'gen', genId: g.id, home: true }, nonce: Date.now() }),
    });
  }
  for (const s of SUBJECTS.filter((x) => x.id !== 'mat')) {
    if (quizPool(profile.id, s.id).length >= 5)
      items.push({
        key: `sq${s.id}`,
        icon: 'zap',
        title: `Błyskawica: ${s.name}`,
        sub: `60 sekund · rekord: ${progress.sprintBest.get(`quiz:${s.id}`) ?? 0}`,
        onClick: () => go({ name: 'sprint', game: { kind: 'quiz', subjectId: s.id, home: true }, nonce: Date.now() }),
      });
    if (canPlayPairs({ kind: 'quiz', subjectId: s.id }, profile.id)) {
      const pb = progress.pairsBest.get(`pairs:quiz:${s.id}`);
      items.push({
        key: `pq${s.id}`,
        icon: 'clock',
        title: `Pary na czas: ${s.name}`,
        sub: `6 par · rekord: ${pb ? fmtTime(pb) : '—'}`,
        onClick: () => go({ name: 'pairs', game: { kind: 'quiz', subjectId: s.id, home: true }, nonce: Date.now() }),
      });
    }
  }
  if (!items.length) return null;
  return (
    <Fold icon="zap" title="Mini-gry" wide={wide} className="challenges">
      <p className="muted" style={{ fontWeight: 700, fontSize: 14 }}>
        Szybkie gry na rekord. Więcej gier jest w każdym przedmiocie, w karcie „Wyzwania”.
      </p>
      {items.map((it) => (
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

export function WeekCard({ progress, theme, wide }: { progress: Progress; theme: ThemeDef; wide: boolean }) {
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
              <span className="week-dot">
                {st === 'on' ? <Icon name="check" size={16} stroke={3.2} /> : st === 'frozen' ? <Icon name="snowflake" size={16} /> : ''}
              </span>
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
      <p style={{ fontWeight: 800, fontSize: 15 }}>
        {w.done ? `Zrobione! +${coinText(WEEK_BONUS, theme)}` : `Nagroda za cały tydzień: +${coinText(WEEK_BONUS, theme)}`}
      </p>
    </Fold>
  );
}

export function FamilyCard({ wide }: { wide: boolean }) {
  const goal = store.settings.familyGoal;
  if (!goal) return null;
  const profiles = store.profiles();
  const fp = familyGoalProgress(
    goal,
    store.list('attempt'),
    store.list('session'),
    profiles.map((p) => p.id),
  );
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

export function DiagnosticCard({ progress, topics, wide }: { progress: Progress; topics: ParsedTopic[]; wide: boolean }) {
  const { go } = useApp();
  const options = SUBJECTS.map((s) => ({
    s,
    n: untouchedTopics(
      topics.filter((t) => t.subject === s.id),
      progress,
    ).length,
  })).filter((x) => x.n >= 3);
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

export function HelloCard({ progress }: { progress: Progress }) {
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

export function DailyCard({ progress, theme, wide }: { progress: Progress; theme: ThemeDef; wide: boolean }) {
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
