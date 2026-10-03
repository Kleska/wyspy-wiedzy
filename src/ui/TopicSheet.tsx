import { subjectLang, subjectOf } from '../content/seed';
import { store } from '../data/store';
import { LEVEL_NAMES } from '../engine';
import { plural } from '../themes';
import { GuideCard, LevelChip, LevelSteps, Modal, WordsDetails } from './bits';
import { practice, useApp, useProgress } from './hooks';
import { Icon, Stars } from './icons';

export { Modal };

export function TopicSheet({ topicId, onClose }: { topicId: string; onClose: () => void }) {
  const { profile, theme, go } = useApp();
  const progress = useProgress(profile.id)!;
  const topic = store.topicsFor(profile.id).find((t) => t.id === topicId);
  if (!topic) return null;
  const s = progress.topics.get(topic.id);
  const level = s?.level ?? 0;
  const n = Math.min(store.settings.sessionLength, topic.exercises.length);
  const testN = Math.min(10, topic.exercises.length);
  const inPlan = !!profile.plan?.topicIds.includes(topic.id);
  const hasLesson = !!topic.lesson?.trim();
  const lessonDone = !!progress?.lessonsDone.has(topic.id);
  return (
    <Modal title={topic.title} onClose={onClose}>
      <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <span className="label">
          {subjectOf(topic.subject).name}
          {topic.unit ? ` · ${topic.unit}` : ''}
          {inPlan ? ' · w planie od rodzica' : ''}
        </span>
        <Stars n={s?.stars ?? 0} size={26} />
      </div>
      <div className="level-line">
        <LevelChip level={level} />
        <LevelSteps level={level} />
        {s?.placed && <span className="muted" style={{ fontSize: 14, fontWeight: 700 }}>zaliczony testem</span>}
      </div>
      {level === 0 ? (
        <GuideCard description={topic.description} guide={topic.guide} lang={subjectLang(topic.subject)} />
      ) : (
        (topic.guide || topic.description) && (
          <details className="guide-details">
            <summary>
              <Icon name="book" size={20} /> Ściąga
            </summary>
            <GuideCard description={topic.description} guide={topic.guide} lang={subjectLang(topic.subject)} />
          </details>
        )
      )}
      <WordsDetails words={topic.words} lang={subjectLang(topic.subject)} />
      <div className="stat-tiles">
        <div className="stat-tile">
          <b>{Math.round((s?.mastery ?? 0) * 100)}%</b>
          <small>opanowane</small>
        </div>
        <div className="stat-tile">
          <b>{s?.newCount ?? topic.exercises.length}</b>
          <small>{plural(s?.newCount ?? topic.exercises.length, ['nowe', 'nowe', 'nowych'])}</small>
        </div>
        <div className="stat-tile">
          <b>{s?.dueCount ?? 0}</b>
          <small>do powtórki</small>
        </div>
      </div>
      <p className="muted" style={{ fontWeight: 700, fontSize: 14 }}>
        Poziomy: {LEVEL_NAMES.slice(1).join(' → ')}. Rosną, gdy odpowiadasz dobrze kilka dni z rzędu, a spadają, gdy coś się zapomina.
      </p>
      {hasLesson && (
        <button className={`btn btn-lg btn-block ${lessonDone ? '' : 'btn-primary'}`} onClick={() => go({ name: 'learn', topicId: topic.id, nonce: Date.now(), from: 'subject' })}>
          <Icon name="book" /> {lessonDone ? 'Powtórz lekcję' : 'Nauka: poznaj temat krok po kroku'}
        </button>
      )}
      <button className={`btn btn-lg btn-block ${hasLesson && !lessonDone ? '' : 'btn-primary'}`} onClick={() => go(practice({ kind: 'topic', topicId: topic.id }))}>
        {theme.start} ({n} {plural(n, ['zadanie', 'zadania', 'zadań'])})
      </button>
      {testN >= 5 && (
        <button
          className="btn btn-block"
          onClick={() => go(practice({ kind: 'test', topicIds: [topic.id], title: `Sprawdzian: ${topic.title}`, subjectId: topic.subject, count: testN }))}
        >
          <Icon name="test" /> Sprawdzian z tego tematu ({testN} pytań)
        </button>
      )}
    </Modal>
  );
}
