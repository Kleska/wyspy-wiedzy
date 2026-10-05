import { useState } from 'react';
import { subjectName } from '../../content/seed';
import { nowIso, store } from '../../data/store';
import { decideReports, isGeneratedTopic, openReports, REPORT_REASONS } from '../../engine';
import { plural } from '../../themes';
import type { ExerciseReport, Profile } from '../../types';
import { withFractions } from '../exercises/Exercises';
import { correctText, questionText } from '../exercises/logic';
import { Icon } from '../icons';
import type { EditorSeed } from './ParentTopics';

interface Row {
  p: Profile;
  r: ExerciseReport;
}

/** Zapis decyzji przez aktualny profil ze store — tak jak wymaga synchronizacja. */
async function decide(which: Parameters<typeof decideReports>[1], decision: 'off' | 'ok', onlyProfile?: string) {
  const at = nowIso();
  for (const p of store.profiles()) {
    if (onlyProfile && p.id !== onlyProfile) continue;
    const patch = decideReports(p, which, decision, at);
    if (patch) await store.put('profile', { ...p, ...patch, updatedAt: at });
  }
}

/** Wyłącza zadanie u wszystkich dzieci i zamyka wszystkie czekające zgłoszenia tego zadania. */
export async function disableExercise(exerciseId: string) {
  const off = new Set(store.settings.disabledExercises ?? []);
  off.add(exerciseId);
  await store.saveSettings({ disabledExercises: [...off] });
  await decide({ exerciseId }, 'off');
}

/** Włącza zadanie z powrotem; zgłoszenia zamknięte wyłączeniem zostają jako „zadanie jest dobre”. */
export async function enableExercise(exerciseId: string) {
  await store.saveSettings({ disabledExercises: (store.settings.disabledExercises ?? []).filter((id) => id !== exerciseId) });
  await decide({ exerciseId, from: 'off' }, 'ok');
}

/** Tekst zgłoszeń do wklejenia w czacie z Claude — zadania wbudowane poprawia się w kodzie, nie w panelu. */
export function reportsText(rows: Row[]): string {
  const lines = rows.map(({ p, r }, i) => {
    const t = store.allTopics().find((x) => x.id === r.topicId);
    const subject = t ? subjectName(t.subject) : isGeneratedTopic(r.topicId) ? 'Trening bez końca' : '';
    return [
      `${i + 1}. ${[subject, r.topic].filter(Boolean).join(' · ')}`,
      `   Zgłasza: ${r.byParent ? 'rodzic' : p.name} (kl. ${p.grade ?? 3}), ${new Date(r.at).toLocaleDateString('pl-PL')} — ${REPORT_REASONS[r.reason].parent}`,
      `   Zadanie: ${r.question}`,
      `   Poprawna w aplikacji: ${r.correct}`,
      ...(r.given ? [`   Odpowiedź dziecka: ${r.given}`] : []),
      `   (temat ${r.topicId}, zadanie ${r.exerciseId})`,
    ].join('\n');
  });
  return `Zgłoszenia błędów w zadaniach — Wyspy Wiedzy\n\n${lines.join('\n\n')}\n`;
}

/**
 * Zgłoszenia „to zadanie ma błąd” czekające na decyzję rodzica. Stoją na górze panelu, nad każdą zakładką.
 * Rodzic wyłącza zadanie (znika u wszystkich dzieci) albo uznaje je za dobre.
 */
export function ReportsNotice({ onEdit }: { onEdit: (seed: EditorSeed) => void }) {
  const [copied, setCopied] = useState(false);
  const rows: Row[] = store
    .profiles()
    .flatMap((p) => openReports(p).map((r) => ({ p, r })))
    .sort((a, b) => b.r.at.localeCompare(a.r.at));
  if (!rows.length) return null;
  const topics = store.allTopics();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reportsText(rows));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };
  return (
    <section className="card col notice-card reports" aria-label="Zgłoszone zadania" style={{ gap: 12 }}>
      <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
        <b className="row" style={{ gap: 8, flex: '1 1 200px' }}>
          <Icon name="flag" size={20} /> Zgłoszone zadania ({rows.length})
        </b>
        <button className="btn btn-sm" onClick={copy}>
          <Icon name={copied ? 'check' : 'copy'} size={16} /> {copied ? 'Skopiowano' : 'Skopiuj zgłoszenia'}
        </button>
      </div>
      <p className="muted" style={{ fontSize: 14 }}>
        Wyłączone zadanie znika z ćwiczeń i sprawdzianów u wszystkich dzieci (włączysz je z powrotem na dole zakładki Tematy). Zadania wbudowane poprawia się w kodzie
        aplikacji — skopiuj zgłoszenia i wklej je w czacie z Claude.
      </p>
      {rows.map(({ p, r }) => {
        const topic = topics.find((t) => t.id === r.topicId);
        const generated = isGeneratedTopic(r.topicId);
        const exists = !!topic?.exercises.some((e) => e.id === r.exerciseId);
        return (
          <div key={r.id} className="report-row">
            <div className="report-head">
              <span>
                {p.avatar} {r.byParent ? 'Rodzic' : p.name}
                {r.byParent ? ` (błędy: ${p.name})` : ''} · {new Date(r.at).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
              </span>
              <span className="pill">{REPORT_REASONS[r.reason].parent}</span>
            </div>
            <div className="report-q">
              {withFractions(r.question)}
              <span className="muted"> · {r.topic}</span>
            </div>
            <div>
              <span className="pill good">Poprawnie w aplikacji</span> {withFractions(r.correct)}
            </div>
            {r.given && (
              <div>
                <span className="pill bad">Odpowiedź dziecka</span> {withFractions(r.given)}
              </div>
            )}
            {generated && <p className="muted report-note">To zadanie z losowanymi liczbami — nie da się go wyłączyć. Jeśli wynik jest zły, skopiuj zgłoszenie i wklej je w czacie z Claude.</p>}
            {!generated && !exists && <p className="muted report-note">Tego zadania nie ma już w temacie (zmieniono treść albo jest wyłączone).</p>}
            <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
              {!generated && exists && (
                <button className="btn btn-primary btn-sm" onClick={() => void disableExercise(r.exerciseId)}>
                  <Icon name="eyeOff" size={16} /> Wyłącz zadanie
                </button>
              )}
              {topic && !topic.builtin && exists && (
                <button
                  className="btn btn-sm"
                  onClick={() =>
                    onEdit({
                      topicId: topic.id,
                      title: topic.title,
                      subject: topic.subject,
                      description: topic.description ?? '',
                      guide: topic.guide,
                      words: topic.words,
                      unit: topic.unit,
                      lesson: topic.lesson,
                      dsl: topic.dsl,
                      source: topic.source,
                      grades: topic.grades,
                    })
                  }
                >
                  <Icon name="pencil" size={16} /> Popraw w temacie
                </button>
              )}
              <button className="btn btn-sm" onClick={() => void decide({ ids: [r.id] }, 'ok', p.id)}>
                <Icon name="check" size={16} /> {generated || !exists ? 'Zamknij zgłoszenie' : 'Zadanie jest dobre'}
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );
}

/** Lista zadań wyłączonych przez rodzica — na dole zakładki Tematy; stąd można je włączyć z powrotem. */
export function DisabledExercises() {
  const rows = store.disabledExercises();
  if (!rows.length) return null;
  return (
    <details className="card disabled-ex">
      <summary>
        <Icon name="chevronDown" size={20} className="fold-chev" />
        <b>Wyłączone zadania</b>
        <span className="muted">
          {rows.length} {plural(rows.length, ['zadanie', 'zadania', 'zadań'])}
        </span>
      </summary>
      <div className="col" style={{ gap: 10, marginTop: 8 }}>
        <p className="muted" style={{ fontSize: 14 }}>
          Tych zadań dzieci nie dostają w ćwiczeniach, powtórkach ani na sprawdzianach.
        </p>
        {rows.map(({ topic, ex }) => (
          <div key={`${topic.id}:${ex.id}`} className="report-row">
            <div className="report-q">
              {withFractions(`${ex.prompt} ${questionText(ex)}`.trim())}
              <span className="muted"> · {topic.title}</span>
            </div>
            <div>
              <span className="pill good">Poprawnie w aplikacji</span> {withFractions(correctText(ex))}
            </div>
            <div>
              <button className="btn btn-sm" onClick={() => void enableExercise(ex.id)}>
                <Icon name="eye" size={16} /> Włącz z powrotem
              </button>
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}
