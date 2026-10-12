import { SUBJECTS } from '../content/seed';
import { store } from '../data/store';
import { splitDone } from '../engine';
import { plural } from '../themes';
import { DiagnosticCard, QuizCard } from './HomeCards';
import { ChildProgress } from './ChildProgress';
import { GamesScreen } from './GamesScreen';
import { TodayCard } from './TodayCard';
import { ReviewCard } from './ReviewCard';
import { useApp, useProgress, type Screen } from './hooks';
import { Icon } from './icons';
import { TopBar } from './TopBar';

export function SubjectCards() {
  const { profile, go } = useApp();
  const topics = store.topicsFor(profile.id);
  const subjects = SUBJECTS.filter((s) => topics.some((t) => t.subject === s.id));
  return (
    <section className="col">
      <h2 className="section-title">Co dziś ćwiczymy?</h2>
      {!subjects.length && <div className="card">Rodzic może dodać tematy dla klasy {profile.grade ?? 3} w swoim panelu.</div>}
      <div className="subject-grid simple-subjects">
        {subjects.map((s) => {
          const n = topics.filter((t) => t.subject === s.id).length;
          return (
            <button key={s.id} className="card subject-big" data-subject={s.id} onClick={() => go({ name: 'subject', subjectId: s.id })}>
              <span className="subject-badge" aria-hidden="true">
                {s.short}
              </span>
              <span className="subject-body">
                <span className="subject-name">{s.name}</span>
                <span className="subject-meta">
                  {n} {plural(n, ['temat', 'tematy', 'tematów'])}
                </span>
              </span>
              <Icon name="arrowRight" size={22} className="subject-go" />
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function Home({ section }: { section?: Extract<Screen, { name: 'home' }>['section'] }) {
  const { profile } = useApp();
  const progress = useProgress(profile.id)!;
  const topics = store.topicsFor(profile.id);
  const { active } = splitDone(topics, profile, Date.now());
  const goal = store.settingsFor(profile.id).dailyGoalMinutes;
  const mins = Math.floor(progress.today.seconds / 60);
  const ratio = Math.min(100, (progress.today.seconds / (goal * 60)) * 100);
  return (
    <>
      <TopBar />
      <main className="start clear-start" id="main-content">
        {!section && (
          <>
            <section className="today-greeting">
              <div>
                <span className="label">Mały krok każdego dnia</span>
                <h1>Cześć, {profile.name}!</h1>
              </div>
              <div className="today-goal">
                <span>
                  <Icon name="clock" size={18} /> Dziś {mins} / {goal} min
                </span>
                <div className="bar" role="progressbar" aria-label="Dzisiejsza nauka" aria-valuenow={Math.round(ratio)} aria-valuemin={0} aria-valuemax={100}>
                  <span style={{ width: `${ratio}%` }} />
                </div>
              </div>
            </section>
            <TodayCard progress={progress} topics={active} />
            <QuizCard progress={progress} />
            <SubjectCards />
            <ReviewCard compact />
          </>
        )}
        {section === 'subjects' && (
          <>
            <header className="clear-page-head">
              <span className="label">Wybierz swój kolejny krok</span>
              <h1>Nauka i powtórki</h1>
            </header>
            <SubjectCards />
            <ReviewCard />
            <DiagnosticCard progress={progress} topics={active} wide={false} />
          </>
        )}
        {section === 'games' && <GamesScreen />}
        {section === 'progress' && <ChildProgress />}
      </main>
    </>
  );
}
