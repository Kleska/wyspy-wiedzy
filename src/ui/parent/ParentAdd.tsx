import { useRef, useState } from 'react';
import { aiMode, chatPrompt, generateWithAi, imageToBase64, parsePastedAnswer, type AiRequest } from '../../ai';
import { SUBJECTS, subjectOf } from '../../content/seed';
import { store } from '../../data/store';
import { TYPE_LABEL } from '../../dsl';
import type { ExerciseType, TopicSource } from '../../types';
import { Icon } from '../icons';
import type { EditorSeed } from './ParentTopics';

type Mode = 'text' | 'photo' | 'paste';

const TYPES: ExerciseType[] = ['choice', 'tap', 'sort', 'fill', 'match'];
const TYPE_WORD: Record<ExerciseType, string> = { choice: 'wybierz', tap: 'kliknij', sort: 'sortuj', fill: 'wpisz', match: 'pary' };

export function ParentAdd({ pin, onResult }: { pin: string; onResult: (s: EditorSeed) => void }) {
  const [mode, setMode] = useState<Mode>('photo');
  const [subject, setSubject] = useState('pl');
  const [grade, setGrade] = useState(() => store.list('profile')[0]?.grade ?? 3);
  const [count, setCount] = useState(12);
  const [types, setTypes] = useState<ExerciseType[]>([]);
  const [request, setRequest] = useState('');
  const [photos, setPhotos] = useState<{ mediaType: string; data: string; preview: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [pasted, setPasted] = useState('');
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const ai = aiMode();

  const req = (): AiRequest => ({
    mode: mode === 'photo' ? 'photo' : 'text',
    request,
    subject: subjectOf(subject).name,
    grade,
    count,
    types: types.map((t) => TYPE_WORD[t]),
    images: mode === 'photo' ? photos.map(({ mediaType, data }) => ({ mediaType, data })) : undefined,
  });

  const addPhotos = async (files: FileList | null) => {
    if (!files) return;
    setErr('');
    try {
      const imgs = await Promise.all([...files].slice(0, 4 - photos.length).map(imageToBase64));
      setPhotos((p) => [...p, ...imgs].slice(0, 4));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const generate = async () => {
    setErr('');
    if (mode === 'photo' && photos.length === 0) return setErr('Dodaj zdjęcie strony.');
    if (mode === 'text' && !request.trim()) return setErr('Opisz, czego mają dotyczyć zadania.');
    setBusy(true);
    try {
      const r = await generateWithAi(req(), pin);
      const source: TopicSource = mode === 'photo' ? 'photo' : 'ai';
      onResult({
        title: r.title,
        subject,
        description: r.description,
        dsl: r.dsl,
        source,
        grades: [grade],
        note: 'Sprawdź zadania przed zapisaniem — AI może się pomylić. Popraw albo usuń linie, które Ci nie pasują.',
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const copyPrompt = async () => {
    const text = chatPrompt({ ...req(), mode: photos.length || mode === 'photo' ? 'photo' : 'text', images: undefined });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setPasted(text);
      setErr('Nie udało się skopiować automatycznie — polecenie jest w polu niżej, skopiuj je ręcznie.');
    }
  };

  const usePasted = () => {
    const r = parsePastedAnswer(pasted);
    if (!r.dsl) return setErr('Nie znalazłem zadań w wklejonym tekście. Linie powinny zaczynać się od „wybierz:”, „kliknij:” itd.');
    onResult({ title: r.title || 'Nowy temat', subject, description: r.description, dsl: r.dsl, source: 'import', grades: [grade], note: 'Sprawdź zadania przed zapisaniem.' });
  };

  return (
    <>
      <h1>Dodaj zadania</h1>
      <div className="tabs" role="tablist">
        {(
          [
            ['photo', 'Ze zdjęcia książki'],
            ['text', 'Z opisu (AI)'],
            ['paste', 'Bez klucza: przez czat z Claude'],
          ] as [Mode, string][]
        ).map(([id, label]) => (
          <button key={id} role="tab" className="tab" aria-selected={mode === id} onClick={() => setMode(id)}>
            {label}
          </button>
        ))}
      </div>

      {mode !== 'paste' && ai === 'none' && (
        <div className="note">
          <b>AI nie jest jeszcze włączone.</b> Masz dwie drogi: (1) wdroż funkcję w chmurze (instrukcja w README, krok „AI”) albo (2) wpisz klucz API w
          Ustawieniach — wtedy AI działa tylko na tym urządzeniu. Bez klucza użyj zakładki „Bez klucza: przez czat z Claude”.
        </div>
      )}

      <section className="card col" style={{ gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          <label className="field">
            <span>Przedmiot</span>
            <select className="select" value={subject} onChange={(e) => setSubject(e.target.value)}>
              {SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Klasa</span>
            <select className="select" value={grade} onChange={(e) => setGrade(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Liczba zadań</span>
            <input className="input" type="number" min={3} max={30} value={count} onChange={(e) => setCount(Math.min(30, Math.max(3, Number(e.target.value) || 12)))} />
          </label>
        </div>

        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
          <span>Typy zadań (puste = mieszane)</span>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            {TYPES.map((t) => (
              <label key={t} className="pill" style={{ padding: '8px 12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={types.includes(t)} onChange={(e) => setTypes((cur) => (e.target.checked ? [...cur, t] : cur.filter((x) => x !== t)))} />{' '}
                {TYPE_LABEL[t]}
              </label>
            ))}
          </div>
        </fieldset>

        {(mode === 'photo' || mode === 'paste') && (
          <div className="field">
            <span>{mode === 'photo' ? 'Zdjęcia stron (do 4)' : 'Zdjęcie (opcjonalnie — dołączysz je w czacie z Claude)'}</span>
            {mode === 'photo' && (
              <>
                <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple hidden onChange={(e) => addPhotos(e.target.files)} />
                <div className="row" style={{ flexWrap: 'wrap' }}>
                  <button className="btn" onClick={() => fileRef.current?.click()} disabled={photos.length >= 4}>
                    <Icon name="camera" size={20} /> Zrób zdjęcie / wybierz plik
                  </button>
                  {photos.length > 0 && (
                    <button className="btn btn-sm" onClick={() => setPhotos([])}>
                      Wyczyść
                    </button>
                  )}
                </div>
                {photos.length > 0 && (
                  <div className="photo-thumbs">
                    {photos.map((p, i) => (
                      <img key={i} src={p.preview} alt={`Zdjęcie ${i + 1}`} />
                    ))}
                  </div>
                )}
                <p className="muted" style={{ fontSize: 13 }}>
                  Zdjęcie jest pomniejszane na urządzeniu i wysyłane tylko do wygenerowania zadań. Nie jest nigdzie zapisywane.
                </p>
              </>
            )}
          </div>
        )}

        <label className="field">
          <span>{mode === 'text' ? 'Czego mają dotyczyć zadania?' : 'Dodatkowe uwagi (opcjonalnie)'}</span>
          <textarea
            className="input"
            style={{ minHeight: 90 }}
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder={
              mode === 'text'
                ? 'np. Rozpoznawanie rzeczownika, czasownika i przymiotnika. Syn myli przymiotnik z rzeczownikiem. Zdania o zwierzętach i sporcie.'
                : 'np. Skup się na ćwiczeniu 3 ze strony — czasowniki w czasie przeszłym.'
            }
          />
        </label>

        {mode !== 'paste' ? (
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={generate} disabled={busy || ai === 'none'}>
              <Icon name="sparkles" size={20} /> {busy ? 'Generuję… (do minuty)' : 'Wygeneruj zadania'}
            </button>
            <span className="muted" style={{ fontSize: 13 }}>
              {ai === 'cloud' ? 'AI przez chmurę (klucz na serwerze).' : ai === 'direct' ? 'AI bezpośrednio z tego urządzenia.' : ''}
            </span>
          </div>
        ) : (
          <div className="col" style={{ gap: 12 }}>
            <div className="note">
              1. Kliknij „Skopiuj polecenie”. 2. Otwórz czat z Claude, wklej polecenie i (jeśli chcesz) dołącz zdjęcie strony. 3. Skopiuj odpowiedź Claude i wklej ją
              poniżej. Nie potrzebujesz klucza API — wystarczy zwykłe konto Claude.
            </div>
            <div className="row">
              <button className="btn" onClick={copyPrompt}>
                <Icon name="copy" size={20} /> {copied ? 'Skopiowano!' : 'Skopiuj polecenie'}
              </button>
            </div>
            <label className="field">
              <span>Wklej odpowiedź Claude</span>
              <textarea className="textarea" value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder={'TYTUŁ: …\nZASADA: …\nwybierz: …'} />
            </label>
            <div className="row">
              <button className="btn btn-primary" onClick={usePasted} disabled={!pasted.trim()}>
                Dalej: sprawdź i zapisz
              </button>
            </div>
          </div>
        )}
        {err && (
          <p className="error" role="alert">
            {err}
          </p>
        )}
      </section>

      <section className="card col" style={{ gap: 8 }}>
        <h2 className="card-title" style={{ margin: 0 }}>
          Ręcznie
        </h2>
        <p className="muted">Wolisz wpisać zadania sam? Otwórz edytor — każde zadanie to jedna linia tekstu.</p>
        <div>
          <button className="btn" onClick={() => onResult({ title: '', subject, description: '', dsl: '', source: 'manual', grades: [grade] })}>
            <Icon name="pencil" size={20} /> Otwórz edytor
          </button>
        </div>
      </section>
    </>
  );
}
