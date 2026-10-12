import { subjectOf } from '../content/seed';
import { trainerTopicIds } from '../content/generators';
import { store } from '../data/store';
import { daysUntil, GRADE_NAMES, planActive, planExamCount, planStatus, recentTopicId, suggestTopic, type Progress } from '../engine';
import type { ParsedTopic } from '../types';
import { practice, useApp, type Screen } from './hooks';
import { Icon } from './icons';
import { LevelChip } from './bits';
import { TrainerButtons } from './Trainers';

/** Jeden polecany krok. Pozostałe możliwości są dostępne po rozwinięciu planu. */
export function TodayCard({ progress, topics }: { progress: Progress; topics: ParsedTopic[] }) {
  const { profile, go, openTopic } = useApp();
  const now = Date.now();
  const plan = planActive(profile.plan, now) ? profile.plan : null;
  const planned = plan ? store.topicsFor(profile.id).filter((t) => plan.topicIds.includes(t.id)) : [];
  const lessons = planned.filter((t) => t.lesson?.trim());
  const nextLesson = lessons.find((t) => !progress.lessonsDone.has(t.id));
  const status =
    plan && planned.length
      ? planStatus(
          plan,
          planned.map((t) => t.id),
          progress,
        )
      : null;
  const recent = recentTopicId({
    profileId: profile.id,
    sessions: store.list('session'),
    now,
    since: profile.resetAt,
    trainerTopics: trainerTopicIds,
    allowed: (id) => topics.some((t) => t.id === id),
  });
  const topic = planned.length ? suggestTopic(planned, progress, plan!.topicIds) : (topics.find((t) => t.id === recent) ?? suggestTopic(topics, progress));
  const lesson = nextLesson ?? (!planned.length && topic?.lesson?.trim() && !progress.lessonsDone.has(topic.id) ? topic : undefined);
  const examReady = !!status && status.fluent === planned.length && !status.confirmed && !lesson;
  const n = Math.min(store.settings.sessionLength, topic?.exercises.length ?? 0);
  const examScreen: Screen | null = planned.length
    ? practice({
        kind: 'test',
        topicIds: planned.map((t) => t.id),
        title: plan?.title ? `Próbny: ${plan.title}` : 'Sprawdzian próbny',
        subjectId: planned[0].subject,
        count: planExamCount(planned.length),
      })
    : null;
  const action = lesson
    ? {
        title: `Poznaj temat: ${lesson.title}`,
        sub: 'Krok po kroku, z przykładami',
        screen: { name: 'learn', topicId: lesson.id, nonce: now, from: 'home' } as Screen,
      }
    : examReady && examScreen
      ? { title: 'Sprawdzian próbny', sub: 'Sprawdź, co pamiętasz bez podpowiedzi', screen: examScreen }
      : topic
        ? { title: topic.title, sub: `${subjectOf(topic.subject).name} · ${n} zadań`, screen: practice({ kind: 'topic', topicId: topic.id, home: true }) }
        : null;
  if (!action)
    return (
      <section className="card today-card">
        <h2>Wybierz przedmiot i zacznij naukę</h2>
        <p className="muted">Twoje kolejne ćwiczenie pojawi się tutaj.</p>
      </section>
    );
  const days = plan?.until ? daysUntil(plan.until, now) : null;
  const when = days === null ? '' : days <= 0 ? 'termin dziś' : days === 1 ? 'termin jutro' : `termin za ${days} dni`;
  return (
    <section className="card today-card" aria-label="Twoje zadanie na dziś">
      <div className="today-eyebrow">
        <span className="label">Twoje zadanie na dziś</span>
        {planned.length > 0 && <span className="pill">Plan od rodzica{when ? ` · ${when}` : ''}</span>}
      </div>
      <div className="today-main">
        <span className="today-icon" aria-hidden="true">
          <Icon name={lesson ? 'book' : examReady ? 'test' : 'pencil'} size={32} />
        </span>
        <div>
          <h2>{action.title}</h2>
          <p className="muted">{action.sub}</p>
        </div>
      </div>
      {status?.confirmed && (
        <p className="note good">
          <Icon name="check" size={18} /> Plan zaliczony. Możesz dalej utrwalać materiał.
        </p>
      )}
      <button className="btn btn-primary btn-lg today-start" onClick={() => go(action.screen)}>
        Zaczynamy <Icon name="arrowRight" />
      </button>
      {topic && (
        <button className="link-btn today-details" onClick={() => openTopic(topic.id)}>
          Zobacz temat i inne możliwości
        </button>
      )}
      {planned.length > 0 && (
        <details className="clear-details plan-card" role="region" aria-label="Plan od rodzica">
          <summary>
            Cały plan{plan?.title ? `: ${plan.title}` : ''} · {planned.length} {planned.length === 1 ? 'temat' : planned.length < 5 ? 'tematy' : 'tematów'}
          </summary>
          <div className="col">
            <p className="muted">Poznaj temat → poćwicz → sprawdź się. Zaliczonych tematów nie musisz zaczynać od zera.</p>
            <ol className="plan-steps" aria-label="Kolejność nauki">
              {lessons.length > 0 && (
                <li className={nextLesson ? 'now' : 'done'}>
                  <b>1</b>
                  <span>
                    Nauka
                    <small>
                      {lessons.filter((t) => progress.lessonsDone.has(t.id)).length}/{lessons.length} lekcji
                    </small>
                  </span>
                </li>
              )}
              <li className={status?.fluent === planned.length ? 'done' : !lesson ? 'now' : ''}>
                <b>{lessons.length ? 2 : 1}</b>
                <span>
                  Ćwiczenia
                  <small>
                    {status?.fluent ?? 0}/{planned.length} na poziomie „Biegły”
                  </small>
                </span>
              </li>
              <li className={status?.confirmed ? 'done' : examReady ? 'now' : ''}>
                <b>{lessons.length ? 3 : 2}</b>
                <span>
                  Sprawdzian próbny<small>{planExamCount(planned.length)} pytań</small>
                </span>
              </li>
            </ol>
            <div className="plan-list">
              {planned.map((t) => (
                <button key={t.id} className="plan-topic" onClick={() => openTopic(t.id)}>
                  <span className="plan-topic-title">{t.title}</span>
                  <LevelChip small level={progress.topics.get(t.id)?.level ?? 0} />
                </button>
              ))}
            </div>
            <TrainerButtons topics={planned} home />
            <p className={status?.confirmed ? 'plan-done' : 'plan-check'}>
              {status?.lastExam
                ? `Sprawdzian próbny: ${status.lastExam.grade} (${GRADE_NAMES[status.lastExam.grade]}), ${status.lastExam.correct}/${status.lastExam.total}.`
                : 'Ocena 5 lub 6 potwierdzi, że pamiętasz materiał.'}
            </p>
            {lessons.length > 0 && (
              <button
                className="btn"
                onClick={() =>
                  go({
                    name: 'sheet',
                    topicIds: lessons.map((t) => t.id),
                    title: `Powtórka przed sprawdzianem${plan?.title ? `: ${plan.title}` : ''}`,
                    from: 'home',
                  })
                }
              >
                Powtórka przed sprawdzianem
              </button>
            )}
            {examScreen && (
              <button className="btn" onClick={() => go(examScreen)}>
                Sprawdzian próbny
              </button>
            )}
          </div>
        </details>
      )}
    </section>
  );
}
