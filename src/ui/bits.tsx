import { useEffect, useState } from 'react';
import { parseWords, passageParagraphs } from '../dsl';
import { divisionLayout, lessonDivision } from '../longdiv';
import { LEVEL_NAMES, type TopicLevel } from '../engine';
import type { Lang, Passage } from '../types';
import { speak } from '../speech';
import { withFractions } from './exercises/Exercises';
import { Icon } from './icons';
import { DivisionGrid } from './LongDivision';

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="btn icon-btn" onClick={onClose} aria-label="Zamknij">
            <Icon name="x" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Poziom tematu jako kolorowa plakietka. */
export function LevelChip({ level, small }: { level: TopicLevel; small?: boolean }) {
  return (
    <span className={`level-chip lv-${level} ${small ? 'small' : ''}`} title="Poziom tematu">
      {LEVEL_NAMES[level]}
    </span>
  );
}

/** Pasek z 4 kreskami: Próbowany → Znany → Biegły → Opanowany. */
export function LevelSteps({ level }: { level: TopicLevel }) {
  return (
    <span className="level-steps" aria-label={`Poziom: ${LEVEL_NAMES[level]}`}>
      {[1, 2, 3, 4].map((l) => (
        <span key={l} className={l <= level ? 'on' : ''} />
      ))}
    </span>
  );
}

/** Ściąga: każda linia osobno, „Przykład:” i „Sposób:” wyróżnione. */
export function GuideText({ text }: { text: string }) {
  return (
    <div className="guide">
      {text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l, i) => {
          // „słupek: 936 : 4” — gotowy zapis dzielenia pisemnego zamiast tekstu.
          const div = lessonDivision(l);
          if (div) return <DivisionGrid key={i} layout={divisionLayout(div[0], div[1])} />;
          const m = l.match(/^(Przykład|Sposób|Uwaga|Wyjątki?|Sztuczka)\s*:\s*(.*)$/);
          return (
            <p key={i} className={m ? 'guide-ex' : ''}>
              {m ? (
                <>
                  <b>{m[1]}:</b> {withFractions(m[2])}
                </>
              ) : (
                withFractions(l)
              )}
            </p>
          );
        })}
    </div>
  );
}

export function GuideCard({ title, description, guide, lang = 'pl' }: { title?: string; description?: string; guide?: string; lang?: Lang }) {
  const text = guide || description;
  if (!text) return null;
  // Ściąga do języka obcego miesza dwa języki — jeden głos przeczytałby ją niezrozumiale.
  const canRead = lang === 'pl';
  return (
    <div className="guide-card">
      <div className="guide-head">
        <Icon name="book" />
        <b>{title ?? 'Ściąga'}</b>
        <span className="spacer" />
        {canRead && (
          <button className="btn icon-btn btn-sm" onClick={() => speak(text.split(/\r?\n/).filter((l) => !lessonDivision(l)).join('. '))} aria-label="Przeczytaj ściągę na głos">
            <Icon name="volume" size={20} />
          </button>
        )}
      </div>
      <GuideText text={text} />
    </div>
  );
}

/**
 * Słówka do nauki: wyraz, tłumaczenie i wymowa (głośnik). „Sprawdź się” ukrywa tłumaczenia —
 * dziecko mówi znaczenie z pamięci i stuka w wiersz, żeby sprawdzić.
 */
export function WordList({ words, lang = 'en', quiz = true }: { words: [string, string][]; lang?: Lang; quiz?: boolean }) {
  const [hide, setHide] = useState(false);
  const [shown, setShown] = useState<Set<number>>(new Set());
  if (!words.length) return null;
  return (
    <div className="word-list">
      {quiz && (
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => {
            setHide((h) => !h);
            setShown(new Set());
          }}
        >
          <Icon name={hide ? 'book' : 'target'} size={18} /> {hide ? 'Pokaż tłumaczenia' : 'Sprawdź się: ukryj tłumaczenia'}
        </button>
      )}
      <ul>
        {words.map(([w, t], i) => {
          const open = !hide || shown.has(i);
          return (
            <li key={`${w}:${i}`}>
              <button type="button" className="btn icon-btn btn-sm" onClick={() => speak(w, 0.85, lang)} aria-label={`Posłuchaj: ${w}`}>
                <Icon name="volume" size={18} />
              </button>
              <b lang={lang}>{w}</b>
              {open ? (
                <span className="word-pl">{t}</span>
              ) : (
                <button type="button" className="word-reveal" onClick={() => setShown((cur) => new Set(cur).add(i))} aria-label={`Pokaż tłumaczenie: ${w}`}>
                  pokaż
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Rozwijana lista słówek tematu (karta tematu, ściąga po błędzie). */
export function WordsDetails({ words, lang, open }: { words?: string; lang?: Lang; open?: boolean }) {
  const list = parseWords(words);
  if (!list.length) return null;
  return (
    <details className="guide-details words-details" open={open}>
      <summary>
        <Icon name="volume" size={20} /> Słówka ({list.length})
      </summary>
      <WordList words={list} lang={lang ?? 'en'} />
    </details>
  );
}

/** Tekst do czytania ze zrozumieniem — nad pytaniem, z czytaniem na głos. */
export function PassageCard({ passage, defaultOpen, lang = 'pl', words }: { passage: Passage; defaultOpen: boolean; lang?: Lang; words?: [string, string][] }) {
  const paras = passageParagraphs(passage);
  return (
    <details className="passage" open={defaultOpen}>
      <summary>
        <Icon name="book" size={20} /> <span className="passage-title">{passage.title}</span>
        <span className="passage-toggle muted">{defaultOpen ? '' : '(pokaż tekst)'}</span>
      </summary>
      <div className="passage-body">
        {paras.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <button type="button" className="btn btn-sm" onClick={() => speak(`${passage.title}. ${paras.join(' ')}`, undefined, lang)}>
          <Icon name="volume" size={18} /> Posłuchaj tekstu
        </button>
        {words && words.length > 0 && (
          <details className="passage-words">
            <summary>Słówka z tekstu ({words.length})</summary>
            <WordList words={words} lang={lang} quiz={false} />
          </details>
        )}
      </div>
    </details>
  );
}

export function GuideModal({
  topicTitle,
  description,
  guide,
  words,
  lang,
  onClose,
}: {
  topicTitle: string;
  description?: string;
  guide?: string;
  words?: string;
  lang?: Lang;
  onClose: () => void;
}) {
  return (
    <Modal title={`Ściąga: ${topicTitle}`} onClose={onClose}>
      <GuideCard description={description} guide={guide} title="Przypomnij sobie" lang={lang} />
      <WordsDetails words={words} lang={lang} />
      <button className="btn btn-primary btn-lg btn-block" onClick={onClose}>
        Wracam do zadania
      </button>
    </Modal>
  );
}
