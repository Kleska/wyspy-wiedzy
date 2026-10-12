import { subjectOf } from '../content/seed';
import { store } from '../data/store';
import { groupByUnit, planTopicIds, splitDone, suggestTopic, unitLabel } from '../engine';
import { LevelChip } from './bits';
import { useApp, useProgress } from './hooks';
import { Icon } from './icons';
import { Challenges } from './SubjectExtras';
import { TopBar } from './TopBar';

/** Kolory i bohater pozostają osobiste, kolejność i nazwy czynności są wspólne. */
export function SubjectScreen({ subjectId, unit: unitFromLink }: { subjectId: string; unit?: string }) {
  const { profile, go, openTopic } = useApp();
  const progress = useProgress(profile.id)!;
  const subject = subjectOf(subjectId);
  const every = store.topicsFor(profile.id).filter((t) => t.subject === subjectId);
  const { active, done } = splitDone(every, profile, Date.now());
  const planIds = planTopicIds(profile, Date.now());
  const units = groupByUnit(active);
  const suggestedAll = suggestTopic(active, progress, planIds);
  const unitSel = unitFromLink ?? suggestedAll?.unit?.trim() ?? '';
  const unit = units.find((u) => u.unit === unitSel)?.unit ?? units[0]?.unit ?? '';
  const topics = units.length ? active.filter((t) => (t.unit?.trim() ?? '') === unit) : active;
  const suggested = suggestTopic(topics, progress, planIds);
  return (
    <>
      <TopBar back={() => go({ name: 'home' })} />
      <main className="subject-page clear-subject" id="main-content">
        <header className="subject-head" data-subject={subjectId}>
          <span className="subject-badge" aria-hidden="true">
            {subject.short}
          </span>
          <div>
            <span className="label">Wybierz temat</span>
            <h1>{subject.name}</h1>
          </div>
        </header>
        {units.some((u) => u.unit) && (
          <div className="unit-chips" role="group" aria-label="Dział">
            <span className="label">Dział</span>
            {units.map((u) => (
              <button key={u.unit} type="button" aria-pressed={u.unit === unit} onClick={() => go({ name: 'subject', subjectId, unit: u.unit })}>
                {unitLabel(u.unit)}
                <small>{u.topics.length}</small>
              </button>
            ))}
          </div>
        )}
        <section className="card topic-list" aria-label="Tematy">
          {!topics.length && (
            <p>{done.length ? 'Wszystkie tematy są skończone. Możesz do nich wrócić poniżej.' : 'Rodzic może dodać tematy w swoim panelu.'}</p>
          )}
          {topics.map((t, i) => (
            <button key={t.id} className={`clear-topic${t.id === suggested?.id ? ' recommended' : ''}`} onClick={() => openTopic(t.id)}>
              <span className="clear-topic-number" aria-hidden="true">
                {i + 1}
              </span>
              <span className="clear-topic-text">
                {t.id === suggested?.id && <small>{planIds.includes(t.id) ? 'Z planu rodzica' : 'Polecany kolejny krok'}</small>}
                <b>{t.title}</b>
                <LevelChip small level={progress.topics.get(t.id)?.level ?? 0} />
              </span>
              <Icon name="arrowRight" size={22} />
            </button>
          ))}
        </section>
        {done.length > 0 && (
          <details className="card done-topics">
            <summary>
              <Icon name="check" size={22} />
              <b>Skończone · {done.length}</b>
              <Icon name="chevronDown" size={20} />
            </summary>
            <div className="col">
              {done.map((t) => (
                <button key={t.id} className="done-topic" onClick={() => openTopic(t.id)}>
                  <span className="done-topic-title">{t.title}</span>
                  <LevelChip small level={progress.topics.get(t.id)?.level ?? 0} />
                </button>
              ))}
            </div>
          </details>
        )}
        <details className="card clear-details subject-more">
          <summary>Więcej: sprawdziany i dodatkowe treningi</summary>
          <Challenges
            subjectId={subjectId}
            topics={topics}
            allTopics={every}
            doneTopics={done}
            scope={unit || undefined}
            progress={progress}
            planIds={planIds}
          />
        </details>
      </main>
    </>
  );
}
