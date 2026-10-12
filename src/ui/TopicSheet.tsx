import { useState } from 'react';
import { subjectLang, subjectOf } from '../content/seed';
import { store } from '../data/store';
import { LEVEL_NAMES, topicState } from '../engine';
import { plural } from '../themes';
import { GuideCard, LevelChip, Modal, WordsDetails } from './bits';
import { practice, useApp, useProgress } from './hooks';
import { Icon } from './icons';
import { TrainerButtons } from './Trainers';

export { Modal };

export function TopicSheet({ topicId, onClose, from = 'subject' }: { topicId: string; onClose: () => void; from?: 'home' | 'subject' }) {
  const { profile, go } = useApp();
  const progress = useProgress(profile.id)!;
  const [guideOpen, setGuideOpen] = useState(false);
  const topic = store.topicsFor(profile.id).find((t) => t.id === topicId);
  if (!topic) return null;
  const s = progress.topics.get(topic.id);
  const n = Math.min(store.settings.sessionLength, topic.exercises.length);
  const testN = Math.min(10, topic.exercises.length);
  const state = topicState(profile, topic.id, Date.now());
  const hasLesson = !!topic.lesson?.trim();
  const canLearn = hasLesson || !!(topic.guide || topic.description || topic.words);
  return (
    <Modal title={topic.title} onClose={onClose}>
      <p className="muted">
        {subjectOf(topic.subject).name}
        {topic.unit ? ` · ${topic.unit}` : ''}
        {state === 'now' ? ' · w planie od rodzica' : state === 'done' ? ' · skończony' : ''}
      </p>
      <LevelChip level={s?.level ?? 0} small />
      <div className="topic-choices">
        {canLearn && (
          <button
            className={`topic-choice${hasLesson && !progress.lessonsDone.has(topic.id) ? ' suggested' : ''}`}
            onClick={() => (hasLesson ? go({ name: 'learn', topicId: topic.id, nonce: Date.now(), from }) : setGuideOpen((open) => !open))}
            aria-expanded={hasLesson ? undefined : guideOpen}
          >
            <Icon name="book" size={28} />
            <b>Poznaj temat</b>
            <span>{hasLesson ? 'Krok po kroku, z przykładami' : 'Krótka zasada i przykłady'}</span>
          </button>
        )}
        <button
          className={`topic-choice${!hasLesson || progress.lessonsDone.has(topic.id) ? ' suggested' : ''}`}
          onClick={() => go(practice({ kind: 'topic', topicId: topic.id, home: from === 'home' }))}
        >
          <Icon name="pencil" size={28} />
          <b>Ćwicz</b>
          <span>
            {n} {plural(n, ['zadanie', 'zadania', 'zadań'])} · z podpowiedziami
          </span>
        </button>
      </div>
      {guideOpen && (
        <section className="col" aria-label="Wyjaśnienie tematu">
          <GuideCard description={topic.description} guide={topic.guide} lang={subjectLang(topic.subject)} />
          <WordsDetails words={topic.words} lang={subjectLang(topic.subject)} open />
        </section>
      )}
      <details className="clear-details topic-more">
        <summary>Więcej: ściąga, trening i sprawdzian</summary>
        <div className="col">
          <GuideCard description={topic.description} guide={topic.guide} lang={subjectLang(topic.subject)} />
          <WordsDetails words={topic.words} lang={subjectLang(topic.subject)} />
          <TrainerButtons topics={[topic]} home={from === 'home'} />
          {testN >= 5 && (
            <button
              className="btn btn-block"
              onClick={() => go(practice({ kind: 'test', topicIds: [topic.id], title: `Sprawdzian: ${topic.title}`, subjectId: topic.subject, count: testN }))}
            >
              <Icon name="test" /> Sprawdzian z tego tematu ({testN} pytań)
            </button>
          )}
          <p className="muted">
            Opanowane: {Math.round((s?.mastery ?? 0) * 100)}% · do powtórki: {s?.dueCount ?? 0}
          </p>
          <p className="muted">Poziomy: {LEVEL_NAMES.slice(1).join(' → ')}. Rosną, gdy pamiętasz odpowiedzi także w kolejnych dniach.</p>
        </div>
      </details>
    </Modal>
  );
}
