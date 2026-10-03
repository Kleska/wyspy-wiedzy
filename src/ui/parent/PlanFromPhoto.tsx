import { useMemo, useRef, useState } from 'react';
import { aiMode, chatPlanPrompt, generatePlanWithAi, imageToBase64, parsePastedPlan, type AiPlanRequest, type AiPlanResult } from '../../ai';
import { SUBJECTS, subjectOf } from '../../content/seed';
import { gradeOf, nowIso, store, uid } from '../../data/store';
import { parseDsl } from '../../dsl';
import { dateKey } from '../../engine';
import { plural } from '../../themes';
import type { Profile, Topic } from '../../types';
import { Icon } from '../icons';

/*
 * Sprawdzian w szkole → zdjęcie zakresu → gotowy plan: AI dobiera pasujące tematy z aplikacji,
 * układa jeden nowy temat dla brakujących części i ustawia plan z terminem.
 * Bez klucza API działa przez zwykły czat z Claude (skopiuj polecenie → wklej odpowiedź).
 */
export function PlanFromPhoto({ p, pin, onPlanSaved }: { p: Profile; pin: string; onPlanSaved?: () => void }) {
  const grade = gradeOf(p);
  const [subject, setSubject] = useState('pl');
  const [until, setUntil] = useState('');
  const [request, setRequest] = useState('');
  const [photos, setPhotos] = useState<{ mediaType: string; data: string; preview: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [pasted, setPasted] = useState('');
  const [copied, setCopied] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [result, setResult] = useState<AiPlanResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const ai = aiMode();

  const subjectTopics = store.topicsFor(p.id).filter((t) => t.subject === subject);
  const existing = subjectTopics.map((t) => ({ id: t.id, title: t.title }));
  const req = (): AiPlanRequest => ({
    mode: 'plan',
    request,
    subject: subjectOf(subject).name,
    grade,
    existing,
    images: photos.map(({ mediaType, data }) => ({ mediaType, data })),
  });

  const addPhotos = async (files: FileList | null) => {
    if (!files) return;
    setErr('');
    try {
      const imgs = await Promise.all([...files].slice(0, 4 - photos.length).map(imageToBase64));
      setPhotos((cur) => [...cur, ...imgs].slice(0, 4));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const generate = async () => {
    setErr('');
    if (!photos.length && !request.trim()) return setErr('Dodaj zdjęcie zakresu albo opisz go w polu tekstowym.');
    setBusy(true);
    try {
      setResult(await generatePlanWithAi(req(), pin));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const copyPrompt = async () => {
    const text = chatPlanPrompt({ ...req(), images: undefined });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setPromptText(text);
      setErr('Nie udało się skopiować automatycznie — zaznacz polecenie w polu poniżej i skopiuj je ręcznie.');
    }
  };

  const usePasted = () => {
    setErr('');
    const r = parsePastedPlan(pasted, existing);
    if (!r.existingTopicIds.length && !r.topic) return setErr('Nie znalazłem planu w odpowiedzi. Sprawdź, czy są linie „PLAN:”, „ISTNIEJĄCE:” albo zadania.');
    setResult(r);
  };

  if (result) {
    return (
      <PlanReview
        key={result.planTitle + result.existingTopicIds.join()}
        p={p}
        result={result}
        subject={subject}
        until={until}
        onCancel={() => setResult(null)}
        onSaved={(m) => {
          onPlanSaved?.();
          setResult(null);
          setPhotos([]);
          setRequest('');
          setPasted('');
          setMsg(m);
          setTimeout(() => setMsg(''), 4000);
        }}
      />
    );
  }

  return (
    <section className="card col" style={{ gap: 12 }}>
      <h2 className="card-title" style={{ margin: 0 }}>
        <Icon name="camera" size={22} /> Sprawdzian w szkole? Zrób zdjęcie zakresu
      </h2>
      <p className="muted" style={{ fontSize: 14 }}>
        Zdjęcie kartki od nauczyciela, wpisu w zeszycie albo wiadomości z dziennika. Aplikacja dobierze pasujące tematy, ułoży zadania z tego, czego jeszcze nie ma,
        i ustawi plan z terminem — {p.name} zobaczy go na ekranie startowym razem ze sprawdzianem próbnym.
      </p>
      {msg && (
        <div className="note" role="status">
          {msg}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
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
          <span>Data sprawdzianu</span>
          <input className="input" type="date" value={until} min={dateKey(Date.now())} onChange={(e) => setUntil(e.target.value)} aria-label="Data sprawdzianu" />
        </label>
      </div>
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
          {photos.map((ph, i) => (
            <img key={i} src={ph.preview} alt={`Zdjęcie ${i + 1}`} />
          ))}
        </div>
      )}
      <label className="field">
        <span>Albo opisz zakres (opcjonalnie)</span>
        <textarea
          className="input"
          style={{ minHeight: 70 }}
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          placeholder="np. Sprawdzian z części mowy: rzeczownik, czasownik, przymiotnik, czasy czasownika."
        />
      </label>
      {ai !== 'none' ? (
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={generate} disabled={busy}>
            <Icon name="sparkles" size={20} /> {busy ? 'Przygotowuję plan… (może potrwać do minuty)' : 'Przygotuj plan'}
          </button>
        </div>
      ) : (
        <div className="note">AI nie jest włączone na tym urządzeniu — użyj sposobu przez czat z Claude poniżej (bez klucza API).</div>
      )}
      <details open={ai === 'none'}>
        <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Bez klucza: przez czat z Claude</summary>
        <div className="col" style={{ gap: 10, marginTop: 10 }}>
          <div className="note">
            1. Kliknij „Skopiuj polecenie”. 2. Otwórz czat z Claude, wklej polecenie i dołącz zdjęcie zakresu. 3. Skopiuj odpowiedź Claude i wklej ją poniżej.
          </div>
          <div className="row">
            <button className="btn" onClick={copyPrompt}>
              <Icon name="copy" size={20} /> {copied ? 'Skopiowano!' : 'Skopiuj polecenie'}
            </button>
          </div>
          {promptText && (
            <label className="field">
              <span>Polecenie do skopiowania</span>
              <textarea className="textarea" readOnly value={promptText} style={{ minHeight: 120 }} />
            </label>
          )}
          <label className="field">
            <span>Wklej odpowiedź Claude</span>
            <textarea className="textarea" value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder={'PLAN: …\nZAKRES: …\nISTNIEJĄCE: …\nTYTUŁ: …'} aria-label="Odpowiedź Claude z planem" />
          </label>
          <div className="row">
            <button className="btn btn-primary" onClick={usePasted} disabled={!pasted.trim()}>
              Dalej: sprawdź plan
            </button>
          </div>
        </div>
      </details>
      {err && (
        <p className="error" role="alert">
          {err}
        </p>
      )}
    </section>
  );
}

function PlanReview({
  p,
  result,
  subject,
  until: untilInit,
  onCancel,
  onSaved,
}: {
  p: Profile;
  result: AiPlanResult;
  subject: string;
  until: string;
  onCancel: () => void;
  onSaved: (msg: string) => void;
}) {
  const subjectTopics = store.topicsFor(p.id).filter((t) => t.subject === subject);
  const [title, setTitle] = useState(result.planTitle);
  const [until, setUntil] = useState(untilInit);
  const [sel, setSel] = useState<string[]>(result.existingTopicIds);
  const [addNew, setAddNew] = useState(!!result.topic);
  const parsed = useMemo(() => (result.topic ? parseDsl(result.topic.dsl) : null), [result.topic]);
  const [err, setErr] = useState('');

  const save = async () => {
    setErr('');
    const ids = [...sel];
    if (addNew && result.topic && parsed?.exercises.length) {
      const now = nowIso();
      const maxOrder = Math.max(100, ...store.allTopics().filter((t) => t.subject === subject).map((t) => t.order));
      const topic: Topic = {
        id: `t-${uid()}`,
        subject,
        title: result.topic.title.trim() || title,
        description: result.topic.description.trim() || undefined,
        guide: result.topic.guide?.trim() || undefined,
        order: maxOrder + 10,
        source: 'photo',
        grades: [gradeOf(p)],
        dsl: result.topic.dsl.trim(),
        createdAt: now,
        updatedAt: now,
      };
      await store.put('topic', topic);
      ids.push(topic.id);
    }
    if (!ids.length) return setErr('Zaznacz co najmniej jeden temat.');
    await store.put('profile', { ...p, plan: { topicIds: ids, until: until || undefined, title: title.trim() || undefined, setAt: nowIso() }, planAt: nowIso(), updatedAt: nowIso() });
    onSaved(`Plan „${title.trim() || 'Sprawdzian'}” gotowy: ${ids.length} ${plural(ids.length, ['temat', 'tematy', 'tematów'])}. ${p.name} zobaczy go na ekranie startowym.`);
  };

  return (
    <section className="card col plan-review" style={{ gap: 12 }}>
      <h2 className="card-title" style={{ margin: 0 }}>
        Sprawdź plan przed zapisaniem
      </h2>
      {result.scope && (
        <p style={{ fontWeight: 700 }}>
          Odczytany zakres: <span className="muted">{result.scope}</span>
        </p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <label className="field">
          <span>Nazwa planu</span>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} aria-label="Nazwa planu" />
        </label>
        <label className="field">
          <span>Data sprawdzianu</span>
          <input className="input" type="date" value={until} min={dateKey(Date.now())} onChange={(e) => setUntil(e.target.value)} aria-label="Data sprawdzianu w planie" />
        </label>
      </div>
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <span>Tematy z aplikacji (zaznaczone pasują do zakresu)</span>
        <div className="col" style={{ gap: 6 }}>
          {subjectTopics.map((t) => (
            <label key={t.id} className="check-row">
              <input type="checkbox" checked={sel.includes(t.id)} onChange={(e) => setSel((cur) => (e.target.checked ? [...cur, t.id] : cur.filter((x) => x !== t.id)))} />
              <span style={{ flex: 1 }}>{t.title}</span>
              {result.existingTopicIds.includes(t.id) && <span className="pill good">pasuje</span>}
            </label>
          ))}
        </div>
      </fieldset>
      {result.topic && parsed && (
        <div className="new-topic-box">
          <label className="check-row">
            <input type="checkbox" checked={addNew} onChange={(e) => setAddNew(e.target.checked)} />
            <span style={{ flex: 1 }}>
              <b>Nowy temat: {result.topic.title}</b> — {parsed.exercises.length} {plural(parsed.exercises.length, ['zadanie', 'zadania', 'zadań'])}
              {parsed.errors.length > 0 && (
                <span className="pill bad" style={{ marginLeft: 6 }}>
                  {parsed.errors.length} {plural(parsed.errors.length, ['linia z błędem (pominięta)', 'linie z błędem (pominięte)', 'linii z błędem (pominiętych)'])}
                </span>
              )}
            </span>
          </label>
          <ul className="new-topic-list">
            {parsed.exercises.slice(0, 4).map((ex) => (
              <li key={ex.id}>{ex.prompt}</li>
            ))}
            {parsed.exercises.length > 4 && <li className="muted">…i jeszcze {parsed.exercises.length - 4} (możesz je poprawić później w zakładce „Tematy”)</li>}
          </ul>
        </div>
      )}
      <p className="muted" style={{ fontSize: 13 }}>
        AI może się pomylić — po zapisaniu nowy temat znajdziesz w zakładce „Tematy”, gdzie możesz poprawić zadania.
      </p>
      {err && (
        <p className="error" role="alert">
          {err}
        </p>
      )}
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={save}>
          <Icon name="pin" size={18} /> Zapisz plan
        </button>
        <button className="btn" onClick={onCancel}>
          Wróć
        </button>
      </div>
    </section>
  );
}
