import { useState } from 'react';
import { generatorsFor } from '../content/generators';
import { chapterExamFor } from '../content/chapterExams';
import { subjectOf } from '../content/seed';
import { gradeOf } from '../data/store';
import { untouchedTopics, type Progress } from '../engine';
import { plural } from '../themes';
import type { ParsedTopic } from '../types';
import { LevelChip, Modal } from './bits';
import { practice, useApp } from './hooks';
import { Icon } from './icons';
import { canPlayPairs, fmtTime } from './Pairs';
import { quizPool } from './Sprint';

export function Challenges({
  subjectId,
  topics,
  allTopics,
  doneTopics,
  scope,
  progress,
  planIds,
}: {
  subjectId: string;
  /** Tematy widoczne na planszy (wybrany dział) — z nich jest sprawdzian. */
  topics: ParsedTopic[];
  /** Wszystkie tematy przedmiotu z planszy — test na start obejmuje cały przedmiot. */
  allTopics: ParsedTopic[];
  /** Tematy skończone — można je dobrać do sprawdzianu. */
  doneTopics: ParsedTopic[];
  /** Nazwa rozdziału, jeśli przedmiot jest podzielony na rozdziały. */
  scope?: string;
  progress: Progress;
  planIds: string[];
}) {
  const { profile, go } = useApp();
  const [modal, setModal] = useState<'test' | 'gen' | null>(null);
  const untouched = untouchedTopics(allTopics, progress).length;
  const gens = subjectId === 'mat' ? generatorsFor(gradeOf(profile)) : [];
  const quizOk = subjectId !== 'mat' && quizPool(profile.id, subjectId).length >= 5;
  const pairsOk = subjectId !== 'mat' && canPlayPairs({ kind: 'quiz', subjectId }, profile.id);
  const pairsBest = progress.pairsBest.get(`pairs:quiz:${subjectId}`);
  if (!topics.length && !doneTopics.length) return null;
  return (
    <section className="card col challenges" style={{ gap: 10 }}>
      <h2 className="card-title" style={{ margin: 0 }}>
        Wyzwania
      </h2>
      <button className="challenge" onClick={() => setModal('test')}>
        <Icon name="test" size={28} />
        <span>
          <b>Sprawdzian{scope ? `: ${scope}` : ''}</b>
          <small>Bez podpowiedzi, z oceną 1–6</small>
        </span>
      </button>
      {topics.some((t) => t.lesson?.trim()) && (
        <button
          className="challenge"
          onClick={() =>
            go({
              name: 'sheet',
              topicIds: topics.filter((t) => t.lesson?.trim()).map((t) => t.id),
              title: `Powtórka: ${scope ?? subjectOf(subjectId).name}`,
              from: 'subject',
              subjectId,
            })
          }
        >
          <Icon name="book" size={28} />
          <span>
            <b>Powtórka{scope ? `: ${scope}` : ''}</b>
            <small>Najważniejsze rzeczy na jednej stronie</small>
          </span>
        </button>
      )}
      {untouched >= 2 && (
        <button className="challenge" onClick={() => go(practice({ kind: 'diagnostic', subjectId }))}>
          <Icon name="compass" size={28} />
          <span>
            <b>Test na start</b>
            <small>
              Sprawdź, co już umiesz ({Math.min(untouched, 8) * 3} {plural(Math.min(untouched, 8) * 3, ['pytanie', 'pytania', 'pytań'])})
            </small>
          </span>
        </button>
      )}
      {gens.some((g) => g.id === 'mul') && (
        <button className="challenge" onClick={() => go({ name: 'times' })}>
          <Icon name="target" size={28} />
          <span>
            <b>Mapa tabliczki mnożenia</b>
            <small>Zobacz, które działania już umiesz</small>
          </span>
        </button>
      )}
      {gens.length > 0 && (
        <button className="challenge" onClick={() => setModal('gen')}>
          <Icon name="infinity" size={28} />
          <span>
            <b>Trening bez końca i mini-gry</b>
            <small>Zawsze nowe liczby · Błyskawica · Pary na czas</small>
          </span>
        </button>
      )}
      {quizOk && (
        <button className="challenge" onClick={() => go({ name: 'sprint', game: { kind: 'quiz', subjectId }, nonce: Date.now() })}>
          <Icon name="zap" size={28} />
          <span>
            <b>Błyskawica</b>
            <small>60 sekund szybkich pytań · rekord: {progress.sprintBest.get(`quiz:${subjectId}`) ?? 0}</small>
          </span>
        </button>
      )}
      {pairsOk && (
        <button className="challenge" onClick={() => go({ name: 'pairs', game: { kind: 'quiz', subjectId }, nonce: Date.now() })}>
          <Icon name="clock" size={28} />
          <span>
            <b>Pary na czas</b>
            <small>Połącz 6 par jak najszybciej · rekord: {pairsBest ? fmtTime(pairsBest) : '—'}</small>
          </span>
        </button>
      )}
      {modal === 'test' && (
        <TestSetup
          subjectId={subjectId}
          topics={topics}
          doneTopics={doneTopics}
          scope={scope}
          progress={progress}
          planIds={planIds}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'gen' && (
        <Modal title="Trening bez końca i mini-gry" onClose={() => setModal(null)}>
          <p className="muted" style={{ fontWeight: 700 }}>
            Za każdym razem nowe zadania. Trening — spokojnie, z podpowiedzią. Błyskawica — 60 sekund na rekord. Pary na czas — połącz 6 par jak najszybciej.
          </p>
          <div className="col" style={{ gap: 10 }}>
            {gens.map((g) => (
              <div key={g.id} className="gen-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b>{g.title}</b>
                  <div className="muted" style={{ fontSize: 14, fontWeight: 700 }}>
                    {g.description}
                    {!g.slow && ` · rekordy: ${progress.sprintBest.get(g.id) ?? 0} w Błyskawicy`}
                    {!g.slow && progress.pairsBest.get(`pairs:${g.id}`) ? `, ${fmtTime(progress.pairsBest.get(`pairs:${g.id}`)!)} w Parach` : ''}
                  </div>
                </div>
                <button className="btn btn-sm" onClick={() => go(practice({ kind: 'gen', genId: g.id }))}>
                  Trening
                </button>
                {!g.slow && (
                  <>
                    <button className="btn btn-sm btn-primary" onClick={() => go({ name: 'sprint', game: { kind: 'gen', genId: g.id }, nonce: Date.now() })}>
                      <Icon name="zap" size={16} /> Błyskawica
                    </button>
                    <button className="btn btn-sm btn-primary" onClick={() => go({ name: 'pairs', game: { kind: 'gen', genId: g.id }, nonce: Date.now() })}>
                      <Icon name="clock" size={16} /> Pary
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </Modal>
      )}
    </section>
  );
}

function TestSetup({
  subjectId,
  topics: boardTopics,
  doneTopics,
  scope,
  progress,
  planIds,
  onClose,
}: {
  subjectId: string;
  topics: ParsedTopic[];
  /** Skończone tematy bieżącego działu pozostają dostępne do sprawdzianu. */
  doneTopics: ParsedTopic[];
  scope?: string;
  progress: Progress;
  planIds: string[];
  onClose: () => void;
}) {
  const { go } = useApp();
  const topics = [...boardTopics, ...doneTopics.filter((t) => !scope || (t.unit?.trim() ?? '') === scope)];
  const doneIds = new Set(doneTopics.map((t) => t.id));
  const chapterExam = chapterExamFor(subjectId, topics);
  const planned = topics.filter((t) => planIds.includes(t.id)).map((t) => t.id);
  const started = boardTopics.filter((t) => (progress.topics.get(t.id)?.level ?? 0) > 0).map((t) => t.id);
  const [sel, setSel] = useState<string[]>(chapterExam ? topics.map((t) => t.id) : planned.length ? planned : started.length ? started : (boardTopics.length ? boardTopics : topics).map((t) => t.id));
  const chapterCount = chapterExam ? chapterExam.topicCount * chapterExam.perTopic : undefined;
  const [count, setCount] = useState(chapterCount ?? 15);
  const [variantId, setVariantId] = useState(chapterExam?.variants[0].id ?? 'A');
  const selectedChapter = count === chapterCount ? chapterExamFor(subjectId, topics.filter((t) => sel.includes(t.id))) : undefined;
  const selectedVariant = selectedChapter?.variants.find((v) => v.id === variantId) ?? selectedChapter?.variants[0];
  const available = topics.filter((t) => sel.includes(t.id)).reduce((a, t) => a + t.exercises.length, 0);
  const title =
    sel.length === 1 ? `Sprawdzian: ${topics.find((t) => t.id === sel[0])?.title}` : `Sprawdzian: ${subjectOf(subjectId).name}${scope ? `, ${scope}` : ''}`;
  return (
    <Modal title="Sprawdzian" onClose={onClose}>
      <p className="muted" style={{ fontWeight: 700 }}>
        Jak w szkole: bez podpowiedzi i bez poprawek. Na końcu ocena i lista błędów do poprawy.
      </p>
      <div className="field">
        <span>Z jakich tematów?</span>
        <div className="col" style={{ gap: 6 }}>
          {topics.map((t) => (
            <label key={t.id} className="check-row">
              <input
                type="checkbox"
                checked={sel.includes(t.id)}
                onChange={(e) => setSel((cur) => (e.target.checked ? [...cur, t.id] : cur.filter((x) => x !== t.id)))}
              />
              <span style={{ flex: 1 }}>
                {t.title}
                {doneIds.has(t.id) && <small className="muted"> · skończony</small>}
              </span>
              <LevelChip level={progress.topics.get(t.id)?.level ?? 0} small />
            </label>
          ))}
        </div>
      </div>
      <div className="field">
        <span>Ile pytań?</span>
        <div className="grade-grid count-grid" role="group" aria-label="Liczba pytań">
          {(chapterCount ? [10, 15, 20, chapterCount] : [10, 15, 20]).map((n) => (
            <button key={n} type="button" aria-pressed={count === n} onClick={() => setCount(n)}>
              {n}
            </button>
          ))}
        </div>
      </div>
      {selectedChapter && <p className="muted">Pełny rozdział: po {selectedChapter.perTopic} pytania z każdego z {selectedChapter.topicCount} tematów.</p>}
      {selectedChapter && selectedChapter.variants.length > 1 && (
        <div className="field">
          <span>Wersja sprawdzianu</span>
          <div className="grade-grid count-grid" role="group" aria-label="Wariant sprawdzianu">
            {selectedChapter.variants.map((variant) => (
              <button key={variant.id} type="button" aria-pressed={selectedVariant?.id === variant.id} onClick={() => setVariantId(variant.id)}>
                {variant.label}
              </button>
            ))}
          </div>
          <small className="muted">Te same umiejętności, inne zadania. Krótsze testy losują pytania z wybranych tematów.</small>
        </div>
      )}
      <button
        className="btn btn-primary btn-lg btn-block"
        disabled={sel.length === 0}
        onClick={() => go(practice({ kind: 'test', topicIds: sel,
          title: `${title}${selectedVariant && (chapterExam?.variants.length ?? 0) > 1 ? ` — ${selectedVariant.label}` : ''}`,
          subjectId, ...(scope ? { unit: scope } : {}), count: Math.min(count, available),
          ...(selectedVariant ? { items: selectedVariant.items.map((item) => ({ ...item })) } : {}) }))}
      >
        <Icon name="test" /> Zaczynam sprawdzian
      </button>
    </Modal>
  );
}
