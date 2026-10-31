import { useState } from 'react';
import { GREECE_COMPARISON, GREECE_DATES, GREECE_FLASHCARDS, HISTORY_CHAPTER2, HISTORY_GREECE5 } from '../content/historyGreece5';
import { chapterExamFor } from '../content/chapterExams';
import type { ParsedTopic } from '../types';
import { practice, useApp } from './hooks';
import './history-chapter.css';

/** Narzędzia jednego rozdziału; nie dopisują ocen ani punktów za odsłonięcie fiszki. */
export function HistoryChapterTools({ topics }: { topics: ParsedTopic[] }) {
  const { go } = useApp();
  const [view, setView] = useState<'cards' | 'dates' | 'compare'>('cards');
  const [card, setCard] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const exam = chapterExamFor('his', topics);
  const first = topics.find((t) => t.id === HISTORY_GREECE5[0].id);
  const recap = topics.find((t) => t.id === HISTORY_GREECE5[HISTORY_GREECE5.length - 1].id);
  const move = (n: number) => { setCard(n); setRevealed(false); };
  return <section className="card greece-tools" aria-label="Pomoc w nauce starożytnej Grecji">
    <div>
      <span className="label">Rozdział 2 · Starożytna Grecja</span>
      <h2>Najpierw zrozum, potem sprawdź</h2>
      <p>Jeden temat naraz: krótka lekcja → ćwiczenia → sprawdzian. Jutro wróć do tego, co było trudne.</p>
    </div>
    <div className="greece-actions">
      {first && <button className="btn btn-primary" onClick={() => go({ name: 'learn', topicId: first.id, nonce: Date.now(), from: 'subject' })}>Zacznij naukę</button>}
      {recap && <button className="btn" onClick={() => go({ name: 'sheet', topicIds: [recap.id], title: 'Ściąga: starożytna Grecja', from: 'subject', subjectId: 'his' })}>Ściąga rozdziału</button>}
      {exam?.variants.map((v) => <button className="btn" key={v.id} onClick={() => go(practice({ kind: 'test', subjectId: 'his', unit: HISTORY_CHAPTER2, title: `Starożytna Grecja — ${v.label}`, topicIds: topics.map((t) => t.id), count: v.items.length, items: v.items.map((item) => ({ ...item })) }))}>Sprawdzian {v.id} · {v.items.length} pytania</button>)}
    </div>
    <details className="greece-recall">
      <summary>Przypomnij sobie: fiszki, daty, Ateny a Sparta</summary>
      <div className="greece-views" role="group" aria-label="Sposób powtórki">
        <button className="btn btn-sm" aria-pressed={view === 'cards'} onClick={() => setView('cards')}>Fiszki</button>
        <button className="btn btn-sm" aria-pressed={view === 'dates'} onClick={() => setView('dates')}>Oś czasu</button>
        <button className="btn btn-sm" aria-pressed={view === 'compare'} onClick={() => setView('compare')}>Ateny a Sparta</button>
      </div>
      {view === 'cards' && <div className="greece-flashcard" aria-label="Fiszki do samodzielnej powtórki">
        <p className="muted">Powiedz odpowiedź własnymi słowami. Dopiero potem ją odsłoń. Fiszki nie są oceniane.</p>
        <small>Fiszka {card + 1} z {GREECE_FLASHCARDS.length}</small>
        <h3>{GREECE_FLASHCARDS[card][0]}</h3>
        {revealed ? <p className="greece-card-answer" role="status">{GREECE_FLASHCARDS[card][1]}</p> : <button className="btn btn-primary" onClick={() => setRevealed(true)}>Pokaż odpowiedź</button>}
        <div className="greece-actions">
          <button className="btn btn-sm" disabled={card === 0} onClick={() => move(card - 1)}>Poprzednia fiszka</button>
          <button className="btn btn-sm" onClick={() => move(card === GREECE_FLASHCARDS.length - 1 ? 0 : card + 1)}>{card === GREECE_FLASHCARDS.length - 1 ? 'Od początku' : 'Następna fiszka'}</button>
        </div>
      </div>}
      {view === 'dates' && <div className="greece-timeline">
        <p>Od dawniej do później. <b>Przed naszą erą większa liczba oznacza wcześniejszy rok.</b> Okresy oznaczone wiekiem mogą obejmować kilka punktowych dat.</p>
        <ol>{GREECE_DATES.map(([date, event]) => <li key={date}><b>{date}</b><span>{event}</span></li>)}</ol>
      </div>}
      {view === 'compare' && <div className="greece-compare">
        <p>Oba miasta były greckimi polis. Łączyły je język i wierzenia, różniły się organizacją życia.</p>
        <table><caption>Ateny i Sparta — najważniejsze różnice</caption><thead><tr><th scope="col">Co porównuję?</th><th scope="col">Ateny</th><th scope="col">Sparta</th></tr></thead>
          <tbody>{GREECE_COMPARISON.map(([feature, athens, sparta]) => <tr key={feature}><th scope="row">{feature}</th><td>{athens}</td><td>{sparta}</td></tr>)}</tbody></table>
      </div>}
    </details>
  </section>;
}
