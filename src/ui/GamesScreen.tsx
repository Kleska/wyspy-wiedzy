import { generatorsFor } from '../content/generators';
import { gradeOf } from '../data/store';
import { MiniGamesCard } from './HomeCards';
import { practice, useApp, useProgress } from './hooks';
import { Icon } from './icons';

export function GamesScreen() {
  const { profile, go } = useApp();
  const progress = useProgress(profile.id)!;
  const gens = generatorsFor(gradeOf(profile));
  return (
    <>
      <header className="clear-page-head">
        <span className="label">Zabawa, która utrwala wiedzę</span>
        <h1>Gry i treningi</h1>
        <p className="muted">Ćwicz spokojnie albo spróbuj pobić swój rekord.</p>
      </header>
      <MiniGamesCard progress={progress} wide />
      {gens.length > 0 && (
        <section className="card col">
          <h2>Trening z nowymi liczbami</h2>
          <p className="muted">Każda seria ma nowe zadania. Możesz korzystać z podpowiedzi.</p>
          {gens.map((g) => (
            <details className="clear-details" key={g.id}>
              <summary>{g.title}</summary>
              <div className="col">
                <p className="muted">{g.description}</p>
                <div className="review-actions">
                  <button className="btn" onClick={() => go(practice({ kind: 'gen', genId: g.id, from: 'games' }))}>
                    Ćwicz
                  </button>
                  {!g.slow && (
                    <>
                      <button className="btn" onClick={() => go({ name: 'sprint', game: { kind: 'gen', genId: g.id, home: true }, nonce: Date.now() })}>
                        <Icon name="zap" /> Błyskawica
                      </button>
                      <button className="btn" onClick={() => go({ name: 'pairs', game: { kind: 'gen', genId: g.id, home: true }, nonce: Date.now() })}>
                        <Icon name="clock" /> Pary na czas
                      </button>
                    </>
                  )}
                </div>
              </div>
            </details>
          ))}
        </section>
      )}
    </>
  );
}
