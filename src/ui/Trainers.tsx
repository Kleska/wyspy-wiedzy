import { trainersFor, type Generator } from '../content/generators';
import { gradeOf } from '../data/store';
import type { ParsedTopic } from '../types';
import { practice, useApp } from './hooks';
import { Icon } from './icons';

/**
 * Przyciski „Nowe liczby bez końca” dla tematów, które mają swój trening (np. słupki do dzielenia pisemnego).
 * Pokazujemy je tam, gdzie temat jest „teraz”: w karcie planu i polecanego tematu oraz w karcie samego tematu —
 * zamiast osobnych kart na ekranie startowym. Trening pomocniczy (`aux`) wspólny dla kilku tematów stoi raz, na końcu.
 */
export function TrainerButtons({ topics, home }: { topics: ParsedTopic[]; /** Po serii wracamy na ekran startowy. */ home?: boolean }) {
  const { profile, go } = useApp();
  const grade = gradeOf(profile);
  // Ten sam trening przypięty do kilku tematów (np. tabliczka mnożenia) pokazujemy raz — przy pierwszym z nich.
  const seen = new Set<string>();
  const aux = new Map<string, Generator>();
  const groups = topics
    .map((t) => {
      const gens = trainersFor(t.id, grade);
      for (const x of gens) if (x.aux) aux.set(x.id, x);
      const main = gens.filter((x) => !x.aux && !seen.has(x.id));
      for (const x of main) seen.add(x.id);
      return { t, main };
    })
    .filter((g) => g.main.length);
  if (!groups.length && !aux.size) return null;
  const start = (genId: string) => go(practice({ kind: 'gen', genId, home }));
  return (
    <div className="trainers" role="group" aria-label="Nowe liczby bez końca">
      <div className="trainers-head">
        <Icon name="infinity" size={22} />
        <b>Nowe liczby bez końca</b>
      </div>
      <div className="trainer-kinds">
        {groups.map(({ t, main }) => {
          return (
            <div key={t.id} className="trainer-kind">
              {groups.length > 1 && <b className="trainer-kind-name">{t.title}</b>}
              <div className="trainer-kind-btns">
                {main.map((g) => (
                  <button key={g.id} className="btn btn-primary" onClick={() => start(g.id)} aria-label={`Trening: ${g.title}`}>
                    {g.short ?? g.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {[...aux.values()].map((g) => (
        <button key={g.id} className="btn btn-sm trainer-aux" onClick={() => start(g.id)} aria-label={`Trening: ${g.title}`}>
          <Icon name="check" size={16} /> {g.short ?? g.title}
        </button>
      ))}
    </div>
  );
}
