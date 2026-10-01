import { useMemo, useState } from 'react';
import { allMulExercises } from '../content/generators';
import { store } from '../data/store';
import { factKey, factsSummary, multiplicationMap, weakestFacts, type FactState, type FactStatus } from '../engine';
import { plural } from '../themes';
import type { Exercise } from '../types';
import { practice, useApp, useStoreVersion } from './hooks';
import { Icon } from './icons';
import { TopBar } from './TopBar';

let mulCache: { topicId: string; ex: Exercise }[] | null = null;

/** Stan tabliczki mnożenia dla osoby (przelicza się po każdej nowej odpowiedzi). */
export function useTimesMap(profileId: string): Map<string, FactState> {
  const v = useStoreVersion();
  return useMemo(() => {
    mulCache ??= allMulExercises();
    const sources = [...mulCache, ...store.allTopics().flatMap((t) => t.exercises.map((ex) => ({ topicId: t.id, ex })))];
    return multiplicationMap({ profileId, attempts: store.list('attempt'), sources, since: store.get('profile', profileId)?.resetAt });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v, profileId]);
}

const STATUS_LABEL: Record<FactStatus, string> = {
  known: 'umiesz na pamięć',
  learning: 'w trakcie nauki',
  weak: 'do poprawy',
  none: 'jeszcze niećwiczone',
};

/** Siatka 10 × 10: zielone = umiesz (wynik odkryty), żółte = uczysz się, czerwone = do poprawy. */
export function TimesGrid({ map, onPick, picked, mini }: { map: Map<string, FactState>; onPick?: (f: FactState, a: number, b: number) => void; picked?: string; mini?: boolean }) {
  const nums = Array.from({ length: 10 }, (_, i) => i + 1);
  return (
    <div className={`times-grid ${mini ? 'mini' : ''}`} role={mini ? 'img' : 'grid'} aria-label="Mapa tabliczki mnożenia">
      <span className="tg-corner">·</span>
      {nums.map((n) => (
        <span key={`h${n}`} className="tg-head">
          {n}
        </span>
      ))}
      {nums.map((r) => (
        <div key={r} className="tg-row" role="row">
          <span className="tg-head">{r}</span>
          {nums.map((c) => {
            const f = map.get(factKey(r, c))!;
            const show = f.status === 'known' || f.status === 'learning';
            const label = `${r} · ${c}${show ? ` = ${r * c}` : ''}: ${STATUS_LABEL[f.status]}`;
            return mini ? (
              <span key={c} className={`tg-cell ${f.status}`} />
            ) : (
              <button key={c} type="button" className={`tg-cell ${f.status} ${picked === `${r}x${c}` ? 'picked' : ''}`} onClick={() => onPick?.(f, r, c)} aria-label={label} title={label}>
                {show ? r * c : f.status === 'weak' ? '!' : ''}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function TimesLegend() {
  return (
    <div className="tg-legend">
      <span>
        <i className="tg-cell known" /> umiesz na pamięć
      </span>
      <span>
        <i className="tg-cell learning" /> w trakcie nauki
      </span>
      <span>
        <i className="tg-cell weak" /> do poprawy
      </span>
      <span>
        <i className="tg-cell none" /> jeszcze niećwiczone
      </span>
    </div>
  );
}

export function TimesTable() {
  const { profile, go } = useApp();
  const map = useTimesMap(profile.id);
  const sum = factsSummary(map);
  const [pick, setPick] = useState<{ f: FactState; a: number; b: number } | null>(null);
  const n = Math.min(store.settings.sessionLength, 12);
  return (
    <>
      <TopBar back={() => go({ name: 'home' })} />
      <div className="page times-page">
        <div className="page-head">
          <h1>Tabliczka mnożenia</h1>
          <span className="chip">
            <Icon name="check" size={18} stroke={3} /> {sum.known} / {sum.total}
          </span>
        </div>
        <p style={{ fontWeight: 700 }}>
          Umiesz na pamięć <b>{sum.label(sum.known)}</b> z {sum.total}. Działanie robi się zielone, gdy dwa razy z rzędu odpowiesz dobrze i szybko. Zacznij od
          czerwonych pól!
        </p>
        <section className="card times-card">
          <TimesGrid map={map} picked={pick ? `${pick.a}x${pick.b}` : undefined} onPick={(f, a, b) => setPick({ f, a, b })} />
          <TimesLegend />
          {pick && (
            <p className="tg-info" role="status">
              <b>
                {pick.a} · {pick.b}
                {pick.f.status === 'known' || pick.f.status === 'learning' ? ` = ${pick.a * pick.b}` : ''}
              </b>{' '}
              — {STATUS_LABEL[pick.f.status]}
              {pick.f.right + pick.f.wrong > 0 &&
                ` (dobrze: ${pick.f.right} ${plural(pick.f.right, ['raz', 'razy', 'razy'])}, źle: ${pick.f.wrong} ${plural(pick.f.wrong, ['raz', 'razy', 'razy'])})`}
            </p>
          )}
        </section>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => go(practice({ kind: 'gen', genId: 'mul', facts: weakestFacts(map, n) }))}>
            <Icon name="target" /> Ćwicz najsłabsze ({n})
          </button>
          <button className="btn btn-lg" onClick={() => go({ name: 'sprint', game: { kind: 'gen', genId: 'mul' }, nonce: Date.now() })}>
            <Icon name="zap" /> Błyskawica
          </button>
          <button className="btn btn-lg" onClick={() => go({ name: 'pairs', game: { kind: 'gen', genId: 'mul' }, nonce: Date.now() })}>
            <Icon name="clock" /> Pary na czas
          </button>
        </div>
      </div>
    </>
  );
}
