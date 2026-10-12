import { store } from '../data/store';
import { mistakesToFix, reviewCount } from '../engine';
import { practice, useApp, useProgress } from './hooks';
import { Icon } from './icons';

export function ReviewCard({ compact = false }: { compact?: boolean }) {
  const { profile, go } = useApp();
  const progress = useProgress(profile.id)!;
  const topics = store.topicsFor(profile.id);
  const reviewN = reviewCount(topics, progress);
  const mistakes = mistakesToFix({ profileId: profile.id, attempts: store.list('attempt'), topics, now: Date.now(), since: profile.resetAt });
  if (compact && !reviewN && !mistakes.length) return null;
  return (
    <section className="card review-card" aria-label="Utrwal wiedzę">
      <div>
        <h2>Utrwal wiedzę</h2>
        <p className="muted">
          {reviewN || mistakes.length ? 'Krótka powtórka pomaga zapamiętać na dłużej.' : 'Na razie nie ma zadań do powtórki. Zacznij nowy temat.'}
        </p>
      </div>
      <div className="review-actions">
        {reviewN > 0 && (
          <button className="btn" onClick={() => go(practice({ kind: 'review' }))}>
            <Icon name="repeat" /> Powtórz ({reviewN})
          </button>
        )}
        {mistakes.length > 0 && (
          <button
            className="btn"
            onClick={() =>
              go(
                practice({
                  kind: 'fix',
                  items: mistakes.slice(0, store.settings.sessionLength).map(({ topicId, exerciseId }) => ({ topicId, exerciseId })),
                  subjectId: null,
                }),
              )
            }
          >
            <Icon name="pencil" /> Popraw moje błędy ({Math.min(mistakes.length, store.settings.sessionLength)})
          </button>
        )}
      </div>
    </section>
  );
}
