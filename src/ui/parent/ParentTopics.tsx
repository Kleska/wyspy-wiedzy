import { useMemo, useState } from 'react';
import { askConfirm } from '../dialogs';
import { SUBJECTS, subjectOf } from '../../content/seed';
import { nowIso, store, uid } from '../../data/store';
import { DSL_HELP, parseDsl, TYPE_LABEL } from '../../dsl';
import type { Topic, TopicSource } from '../../types';
import { plural } from '../../themes';
import { exerciseSummary } from '../exercises/logic';
import { GRADES } from '../Onboarding';
import { useStoreVersion } from '../hooks';
import { Icon } from '../icons';

export interface EditorSeed {
  topicId?: string;
  title: string;
  subject: string;
  description: string;
  guide?: string;
  dsl: string;
  source: TopicSource;
  grades?: number[];
  note?: string;
}

export function gradesLabel(g?: number[]): string {
  if (!g?.length) return 'wszystkie klasy';
  return `kl. ${[...g].sort((a, b) => a - b).join(', ')}`;
}

const SOURCE_LABEL: Record<TopicSource, string> = {
  builtin: 'wbudowany',
  manual: 'ręcznie',
  ai: 'AI',
  photo: 'ze zdjęcia',
  import: 'import',
};

export function ParentTopics({ onEdit }: { onEdit: (s: EditorSeed) => void }) {
  useStoreVersion();
  const topics = store.allTopics();
  const hidden = new Set(store.settings.hiddenBuiltins);

  const toggleHidden = (id: string) => {
    const h = new Set(hidden);
    if (h.has(id)) h.delete(id);
    else h.add(id);
    void store.saveSettings({ hiddenBuiltins: [...h] });
  };

  const remove = async (id: string) => {
    const t = store.get('topic', id);
    if (!t || !(await askConfirm(`Usunąć temat „${t.title}”? Postępy w nim przestaną się liczyć.`, { ok: 'Usuń', danger: true }))) return;
    void store.put('topic', { ...t, deleted: true, updatedAt: nowIso() });
  };

  const move = (id: string, subject: string, dir: -1 | 1) => {
    const same = topics.filter((x) => x.subject === subject && !x.builtin);
    const i = same.findIndex((x) => x.id === id);
    const other = same[i + dir];
    const a = store.get('topic', id);
    const b = other ? store.get('topic', other.id) : undefined;
    if (!a || !b) return;
    const now = nowIso();
    const aOrder = a.order === b.order ? b.order + dir : b.order;
    void store.put('topic', { ...a, order: aOrder, updatedAt: now });
    void store.put('topic', { ...b, order: a.order, updatedAt: now });
  };

  return (
    <>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <h1 style={{ flex: 1 }}>Tematy</h1>
        <button className="btn btn-primary" onClick={() => onEdit({ title: '', subject: 'pl', description: '', dsl: '', source: 'manual' })}>
          <Icon name="plus" size={20} /> Nowy temat
        </button>
      </div>
      <p className="muted">
        Tematy wbudowane możesz ukryć albo skopiować i zmienić. Własne tematy edytujesz w prostym formacie tekstowym — jedno zadanie w jednej linii.
      </p>
      {SUBJECTS.filter((s) => topics.some((t) => t.subject === s.id)).map((s) => (
        <section key={s.id} className="card">
          <h2 className="card-title">{s.name}</h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Temat</th>
                  <th>Zadań</th>
                  <th>Klasa</th>
                  <th>Źródło</th>
                  <th>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {topics
                  .filter((t) => t.subject === s.id)
                  .map((t) => (
                    <tr key={t.id} style={{ opacity: t.builtin && hidden.has(t.id) ? 0.5 : 1 }}>
                      <td>
                        <b>{t.title}</b>
                        {t.errors.length > 0 && <div className="pill bad">{t.errors.length} {plural(t.errors.length, ['błąd', 'błędy', 'błędów'])} w treści</div>}
                        {t.builtin && hidden.has(t.id) && <div className="muted" style={{ fontSize: 12 }}>ukryty dla ucznia</div>}
                      </td>
                      <td>{t.exercises.length}</td>
                      <td>{gradesLabel(t.grades)}</td>
                      <td>
                        <span className="pill">{SOURCE_LABEL[t.source]}</span>
                      </td>
                      <td>
                        <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
                          {t.builtin ? (
                            <>
                              <button className="btn btn-sm" onClick={() => toggleHidden(t.id)}>
                                <Icon name={hidden.has(t.id) ? 'eye' : 'eyeOff'} size={16} />
                                {hidden.has(t.id) ? 'Pokaż' : 'Ukryj'}
                              </button>
                              <button
                                className="btn btn-sm"
                                onClick={() =>
                                  onEdit({ title: `${t.title} (moja wersja)`, subject: t.subject, description: t.description ?? '', guide: t.guide, dsl: t.dsl, source: 'manual', grades: t.grades })
                                }
                              >
                                <Icon name="copy" size={16} /> Kopiuj i zmień
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn btn-sm"
                                onClick={() => onEdit({ topicId: t.id, title: t.title, subject: t.subject, description: t.description ?? '', guide: t.guide, dsl: t.dsl, source: t.source, grades: t.grades })}
                              >
                                <Icon name="pencil" size={16} /> Edytuj
                              </button>
                              <button className="btn btn-sm" onClick={() => move(t.id, t.subject, -1)} aria-label="Przesuń wyżej">
                                ↑
                              </button>
                              <button className="btn btn-sm" onClick={() => move(t.id, t.subject, 1)} aria-label="Przesuń niżej">
                                ↓
                              </button>
                              <button className="btn btn-sm btn-danger" onClick={() => remove(t.id)}>
                                <Icon name="trash" size={16} /> Usuń
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </>
  );
}

export function TopicEditor({ seed, onClose }: { seed: EditorSeed; onClose: () => void }) {
  const [title, setTitle] = useState(seed.title);
  const [subject, setSubject] = useState(seed.subject);
  const [description, setDescription] = useState(seed.description);
  const [guide, setGuide] = useState(seed.guide ?? '');
  const [grades, setGrades] = useState<number[]>(seed.grades ?? [...new Set(store.profiles().map((p) => p.grade ?? 3))]);
  const [dsl, setDsl] = useState(seed.dsl);
  const [target, setTarget] = useState<string>(seed.topicId ?? 'new');
  const [err, setErr] = useState('');
  const parsed = useMemo(() => parseDsl(dsl), [dsl]);
  const familyTopics = store.list('topic').filter((t) => !t.deleted && t.id !== seed.topicId);
  const isNewFromOutside = !seed.topicId;

  const save = async () => {
    setErr('');
    if (parsed.exercises.length === 0) return setErr('Dodaj co najmniej jedno poprawne zadanie.');
    if (parsed.errors.length && !(await askConfirm(`Linie z błędami (${parsed.errors.length}) zostaną pominięte przez aplikację. Zapisać mimo to?`, { ok: 'Zapisz' }))) return;
    const now = nowIso();
    if (target !== 'new' && target !== seed.topicId) {
      const t = store.get('topic', target);
      if (!t) return setErr('Nie znaleziono tematu.');
      await store.put('topic', { ...t, dsl: `${t.dsl.trim()}\n${dsl.trim()}`, updatedAt: now });
      onClose();
      return;
    }
    if (!title.trim()) return setErr('Podaj tytuł tematu.');
    const existing = seed.topicId ? store.get('topic', seed.topicId) : undefined;
    const maxOrder = Math.max(100, ...store.allTopics().filter((t) => t.subject === subject).map((t) => t.order));
    const topic: Topic = {
      id: existing?.id ?? `t-${uid()}`,
      subject,
      title: title.trim(),
      description: description.trim() || undefined,
      guide: guide.trim() || undefined,
      order: existing?.subject === subject ? existing.order : maxOrder + 10,
      source: existing?.source ?? seed.source,
      grades: grades.length ? [...grades].sort((a, b) => a - b) : undefined,
      dsl: dsl.trim(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await store.put('topic', topic);
    onClose();
  };

  return (
    <>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <button className="btn btn-sm" onClick={onClose}>
          <Icon name="chevronLeft" size={18} /> Wróć
        </button>
        <h1 style={{ flex: 1 }}>{seed.topicId ? 'Edycja tematu' : 'Nowy temat'}</h1>
        <button className="btn btn-primary" onClick={save}>
          <Icon name="check" size={20} /> Zapisz
        </button>
      </div>
      {seed.note && <div className="note">{seed.note}</div>}
      {err && (
        <p className="error" role="alert">
          {err}
        </p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18, alignItems: 'start' }}>
        <section className="card col" style={{ gap: 14 }}>
          {isNewFromOutside && familyTopics.length > 0 && (
            <label className="field">
              <span>Zapisz jako</span>
              <select className="select" value={target} onChange={(e) => setTarget(e.target.value)}>
                <option value="new">Nowy temat</option>
                {familyTopics.map((t) => (
                  <option key={t.id} value={t.id}>
                    Dopisz do: {t.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          {target === 'new' || target === seed.topicId ? (
            <>
              <label className="field">
                <span>Tytuł</span>
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} placeholder="np. Czasownik — czas przeszły" />
              </label>
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
              <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
                <span>Dla klasy (nic nie zaznaczone = dla wszystkich)</span>
                <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
                  {GRADES.map((g) => (
                    <label key={g} className="pill" style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 14 }}>
                      <input type="checkbox" checked={grades.includes(g)} onChange={(e) => setGrades((cur) => (e.target.checked ? [...cur, g] : cur.filter((x) => x !== g)))} /> {g}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="field">
                <span>Zasada dla dziecka — 1–2 zdania (pokazuje się jako podpowiedź)</span>
                <textarea className="input" style={{ minHeight: 70 }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="np. Czasownik mówi, co ktoś robi. Pytamy: co robi?" />
              </label>
              <label className="field">
                <span>Ściąga — dłuższe wyjaśnienie z przykładami (dziecko widzi ją przed tematem i po błędzie)</span>
                <textarea
                  className="input"
                  style={{ minHeight: 110 }}
                  value={guide}
                  onChange={(e) => setGuide(e.target.value)}
                  placeholder={'Każda myśl w nowej linii, np.\nCzasownik mówi, co ktoś robi.\nPytamy: co robi?\nPrzykład: Mama piecze ciasto. Co robi? Piecze.'}
                />
              </label>
            </>
          ) : null}
          <label className="field">
            <span>Zadania — jedno w linii</span>
            <textarea className="textarea" style={{ minHeight: 320 }} value={dsl} onChange={(e) => setDsl(e.target.value)} spellCheck={false} placeholder={DSL_HELP} />
          </label>
          <details>
            <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Jak zapisywać zadania?</summary>
            <div className="note" style={{ marginTop: 10 }}>
              <p>
                <b>wybierz:</b> polecenie | *dobra | zła | zła — gwiazdka oznacza dobrą odpowiedź. Opcjonalnie zdanie po <code>&gt;&gt;</code>, w nim{' '}
                <code>{'{wyróżnienie}'}</code> albo luka <code>___</code>.
              </p>
              <p>
                <b>kliknij:</b> polecenie &gt;&gt; zdanie z *dobrymi* słowami w gwiazdkach.
              </p>
              <p>
                <b>sortuj:</b> polecenie &gt;&gt; grupa = słowo, słowo ; grupa = słowo, słowo
              </p>
              <p>
                <b>wpisz:</b> polecenie &gt;&gt; tekst z luką [odpowiedź|inna dobra odpowiedź]
              </p>
              <p>
                <b>pary:</b> polecenie &gt;&gt; lewa = prawa ; lewa = prawa
              </p>
              <p>
                <b>dyktando:</b> polecenie &gt;&gt; zdanie z wyrazem do wpisania w [nawiasie] — aplikacja przeczyta zdanie na głos.
              </p>
              <p>
                Na końcu każdej linii możesz dodać wyjaśnienie po <code>!!</code> — dziecko zobaczy je po odpowiedzi.
              </p>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, marginTop: 8 }}>{DSL_HELP}</pre>
              <button className="btn btn-sm" onClick={() => setDsl((d) => (d.trim() ? d.trim() + '\n' : '') + DSL_HELP.split('\n').slice(1).join('\n'))}>
                Wstaw przykłady
              </button>
            </div>
          </details>
        </section>

        <section className="card col" style={{ gap: 10 }}>
          <h2 className="card-title" style={{ margin: 0 }}>
            Podgląd: {parsed.exercises.length} {plural(parsed.exercises.length, ['zadanie', 'zadania', 'zadań'])}
            {parsed.errors.length > 0 && <span className="pill bad" style={{ marginLeft: 8 }}>{parsed.errors.length} {plural(parsed.errors.length, ['błąd', 'błędy', 'błędów'])}</span>}
          </h2>
          <div className="dsl-preview">
            {parsed.errors.map((e) => (
              <div key={`e${e.line}`} className="dsl-item dsl-err">
                <span className="type">Linia {e.line} — błąd</span>
                <b>{e.message}</b>
                <code style={{ fontSize: 12, wordBreak: 'break-word' }}>{e.text}</code>
              </div>
            ))}
            {parsed.exercises.map((ex) => (
              <div key={ex.id} className="dsl-item">
                <span className="type">{TYPE_LABEL[ex.type]}</span>
                <b>{ex.prompt}</b>
                <span>{exerciseSummary(ex)}</span>
                {ex.explain && <span className="muted">Wyjaśnienie: {ex.explain}</span>}
              </div>
            ))}
          </div>
          <p className="muted" style={{ fontSize: 13 }}>
            Przedmiot: {subjectOf(subject).name}. Zmiana treści zadania resetuje postęp tylko tego jednego zadania.
          </p>
        </section>
      </div>
    </>
  );
}
