import { useCallback, useEffect, useRef, useState } from 'react';
import { generateExercises, generatorById } from '../content/generators';
import { subjectOf } from '../content/seed';
import { nowIso, store, uid } from '../data/store';
import { shuffle, SPRINT_PAID_PER_DAY, SPRINT_RECORD_BONUS } from '../engine';
import { playSound } from '../speech';
import { coinText, plural } from '../themes';
import { askConfirm } from './dialogs';
import { withFractions } from './exercises/Exercises';
import { useApp, type SprintGame } from './hooks';
import { Icon } from './icons';
import { snapshot } from './Practice';

/*
 * Pary na czas (jak „Match” w Quizlecie): 6 par rozsypanych na planszy — trzeba je jak
 * najszybciej połączyć. Zła para to 1 sekunda kary. Liczy się najlepszy czas.
 */

export const PAIRS_COUNT = 6;
const PENALTY_MS = 1000;

type Tile = { id: string; pair: number; text: string };

export const pairsKey = (g: SprintGame) => `pairs:${g.kind === 'gen' ? g.genId : `quiz:${g.subjectId}`}`;

export function pairsTitle(g: SprintGame): string {
  return g.kind === 'gen' ? generatorById(g.genId)?.title ?? 'Pary' : subjectOf(g.subjectId).name;
}

/**
 * Pary z zadań „pary” w tematach przedmiotu — pogrupowane po zadaniach. Pary z jednego zadania
 * są ułożone tak, żeby się nie myliły, więc bierzemy całe zadania (najmniej źródeł naraz).
 */
export function pairsPool(profileId: string, subjectId: string): [string, string][][] {
  const out: [string, string][][] = [];
  for (const t of store.topicsFor(profileId).filter((x) => x.subject === subjectId)) {
    for (const ex of t.exercises) if (ex.type === 'match') out.push(ex.pairs);
  }
  return out;
}

function pickPairs(groups: [string, string][][], n: number): [string, string][] {
  const left = new Set<string>();
  const right = new Set<string>();
  const out: [string, string][] = [];
  for (const [l, r] of shuffle(groups).flatMap((g) => shuffle(g))) {
    const lk = l.toLowerCase();
    const rk = r.toLowerCase();
    // Ten sam tekst nie może wystąpić dwa razy na planszy (ani po tej samej, ani po drugiej stronie).
    if (left.has(lk) || right.has(rk) || left.has(rk) || right.has(lk)) continue;
    left.add(lk);
    right.add(rk);
    out.push([l, r]);
    if (out.length === n) break;
  }
  return out;
}

export function canPlayPairs(game: SprintGame, profileId: string): boolean {
  if (game.kind === 'gen') return !!generatorById(game.genId);
  return pickPairs(pairsPool(profileId, game.subjectId), PAIRS_COUNT).length === PAIRS_COUNT;
}

function makeTiles(game: SprintGame, profileId: string): Tile[] {
  let pool: [string, string][][] = [];
  if (game.kind === 'gen') {
    const g = generatorById(game.genId);
    if (g)
      pool = generateExercises(g, 40).map((ex) => {
        const text = ex.parts.filter((p): p is string => typeof p === 'string').join('').replace(/=\s*$/, '').trim();
        const ans = (ex.parts.find((p) => Array.isArray(p)) as string[])[0];
        return [[text, ans]];
      });
  } else {
    pool = pairsPool(profileId, game.subjectId);
  }
  const pairs = pickPairs(pool, PAIRS_COUNT);
  return shuffle(pairs.flatMap(([l, r], i) => [
    { id: `${i}L`, pair: i, text: l },
    { id: `${i}R`, pair: i, text: r },
  ]));
}

export const fmtTime = (ms: number) => `${(ms / 1000).toFixed(1).replace('.', ',')} s`;

export function Pairs({ game }: { game: SprintGame }) {
  const { profile, theme, go } = useApp();
  const settings = store.settings;
  const key = pairsKey(game);
  const title = pairsTitle(game);
  const backTo = () => go({ name: 'subject', subjectId: game.kind === 'gen' ? 'mat' : game.subjectId });

  const before = useRef(snapshot(profile.id));
  const best = before.current.pairsBest.get(key) ?? null;
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro');
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<{ ms: number; coins: number; record: boolean } | null>(null);
  const startAt = useRef(0);
  const penalty = useRef(0);
  const mistakes = useRef(0);

  const start = () => {
    setTiles(makeTiles(game, profile.id));
    setMatched(new Set());
    setSelected(null);
    setWrong([]);
    penalty.current = 0;
    mistakes.current = 0;
    startAt.current = Date.now();
    setElapsed(0);
    setPhase('play');
  };

  const finish = useCallback(
    async (ms: number) => {
      const s = {
        id: uid(),
        profileId: profile.id,
        topicId: null,
        mode: 'pairs' as const,
        genId: key,
        startedAt: new Date(startAt.current).toISOString(),
        endedAt: nowIso(),
        activeSeconds: Math.round(ms / 1000),
        durationMs: ms,
        answered: PAIRS_COUNT + mistakes.current,
        correct: PAIRS_COUNT,
        completed: true,
      };
      await store.put('session', s);
      const after = snapshot(profile.id);
      setResult({ ms, coins: after.coinsEarned - before.current.coinsEarned, record: best === null || ms < best });
      setPhase('done');
      if (settings.sounds) playSound('done');
    },
    [best, key, profile.id, settings.sounds],
  );

  useEffect(() => {
    if (phase !== 'play') return;
    const t = setInterval(() => setElapsed(Date.now() - startAt.current + penalty.current), 100);
    return () => clearInterval(t);
  }, [phase]);

  const tap = (tile: Tile) => {
    if (matched.has(tile.pair) || wrong.length) return;
    if (!selected) return setSelected(tile.id);
    if (selected === tile.id) return setSelected(null);
    const other = tiles.find((t) => t.id === selected)!;
    if (other.pair === tile.pair) {
      const next = new Set(matched).add(tile.pair);
      setMatched(next);
      setSelected(null);
      if (settings.sounds) playSound('good');
      if (next.size === PAIRS_COUNT) void finish(Date.now() - startAt.current + penalty.current);
    } else {
      penalty.current += PENALTY_MS;
      mistakes.current++;
      setWrong([other.id, tile.id]);
      setSelected(null);
      if (settings.sounds) playSound('bad');
      setTimeout(() => setWrong([]), 450);
    }
  };

  const exit = async () => {
    if (phase === 'play' && !(await askConfirm('Przerwać grę? Wynik się nie zapisze.', { ok: 'Przerwij', cancel: 'Gram dalej' }))) return;
    backTo();
  };

  if (phase === 'intro') {
    return (
      <div className="center-screen">
        <div className="card col sprint-intro">
          <span className="sprint-badge pairs-badge" aria-hidden="true">
            <Icon name="clock" size={44} />
          </span>
          <div className="label">Pary na czas</div>
          <h1>{title}</h1>
          <p style={{ fontWeight: 700 }}>
            Połącz {PAIRS_COUNT} par jak najszybciej: stuknij jeden kafelek, potem pasujący do niego. Zła para to sekunda kary.
          </p>
          <div className="sprint-record">
            <Icon name="trophy" /> Twój rekord: <b>{best === null ? '—' : fmtTime(best)}</b>
          </div>
          <p className="muted" style={{ fontSize: 14, fontWeight: 700 }}>
            Nowy rekord: +{coinText(SPRINT_RECORD_BONUS, theme)}. Za ukończenie: +{coinText(5, theme)} (do {SPRINT_PAID_PER_DAY} razy dziennie).
          </p>
          <button className="btn btn-primary btn-lg btn-block" onClick={start}>
            Start! <Icon name="clock" />
          </button>
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
        <div className="label">Pary na czas · {title}</div>
        <h1>{result.record ? 'Nowy rekord!' : 'Wszystkie pary!'}</h1>
        <div className="summary-stats">
          <div className="card">
            <b style={{ fontFamily: 'var(--font-display)', fontSize: 36 }}>{fmtTime(result.ms)}</b>
            <div className="muted" style={{ fontWeight: 700 }}>
              Twój czas
            </div>
          </div>
          <div className="card">
            <b style={{ fontFamily: 'var(--font-display)', fontSize: 36 }}>{fmtTime(best === null ? result.ms : Math.min(best, result.ms))}</b>
            <div className="muted" style={{ fontWeight: 700 }}>
              rekord
            </div>
          </div>
          <div className="card">
            <b style={{ fontFamily: 'var(--font-display)', fontSize: 36 }}>+{result.coins}</b>
            <div className="muted" style={{ fontWeight: 700 }}>
              {plural(result.coins, theme.coin)}
            </div>
          </div>
        </div>
        {mistakes.current > 0 && (
          <p className="muted" style={{ fontWeight: 700 }}>
            Złe pary: {mistakes.current} (+{mistakes.current} s kary).
          </p>
        )}
        <div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-lg" onClick={() => go({ name: 'pairs', game, nonce: Date.now() })}>
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
    <div className="practice pairs-game">
      <div className="pr-top">
        <button className="btn icon-btn" onClick={exit} aria-label="Przerwij grę">
          <Icon name="x" />
        </button>
        <div className="bar pr-progress" role="progressbar" aria-valuenow={matched.size} aria-valuemin={0} aria-valuemax={PAIRS_COUNT} aria-label="Połączone pary">
          <span style={{ width: `${(matched.size / PAIRS_COUNT) * 100}%` }} />
        </div>
        <span className="sprint-secs" role="timer">
          {fmtTime(elapsed)}
        </span>
      </div>
      <div className="pr-body">
        <div className="pairs-grid">
          {tiles.map((t) => {
            const done = matched.has(t.pair);
            const cls = done ? 'done' : wrong.includes(t.id) ? 'wrong' : selected === t.id ? 'active' : '';
            return (
              <button key={t.id} className={`pair-tile ${cls}`} onClick={() => tap(t)} disabled={done} aria-pressed={selected === t.id}>
                {withFractions(t.text)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
