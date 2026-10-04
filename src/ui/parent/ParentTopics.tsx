import { useMemo, useState, type ReactNode } from 'react';
import { askConfirm } from '../dialogs';
import { SUBJECTS, subjectLang, subjectOf } from '../../content/seed';
import { gradeOf, nowIso, store, uid } from '../../data/store';
import { DSL_HELP, LESSON_HELP, parseDsl, parseLesson, TYPE_LABEL } from '../../dsl';
import { groupByUnit, planActive, setTopicState, topicState, unitLabel, type TopicState } from '../../engine';
import type { ParsedTopic, Topic, TopicSource } from '../../types';
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
  words?: string;
  unit?: string;
  lesson?: string;
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

const STATE_LABEL: Record<TopicState, string> = { now: 'Teraz', library: 'Biblioteka', done: 'Skończony' };

/**
 * Lista tematów: przedmiot → dział (zwijany) → temat. „Dla kogo” wybiera dziecko — widać wtedy tematy jego klasy
 * i stan każdego tematu u tego dziecka (Teraz / Biblioteka / Skończony); „Wszystkie tematy” to cała biblioteka rodziny.
 */
export function ParentTopics({ onEdit }: { onEdit: (s: EditorSeed) => void }) {
  useStoreVersion();
  const profiles = store.profiles();
  const [who, setWho] = useState<string>(profiles[0]?.id ?? 'all');
  const person = who === 'all' ? undefined : store.get('profile', who);
  const all = store.allTopics();
  const topics = person ? all.filter((t) => !t.grades?.length || t.grades.includes(gradeOf(person))) : all;
  const hidden = new Set(store.settings.hiddenBuiltins);
  const now = Date.now();
  /** Czy dziecko w ogóle widzi ten temat (nieukryty i z zadaniami) — tylko wtedy stan ma sens. */
  const visible = (t: ParsedTopic) => !(t.builtin && hidden.has(t.id)) && t.exercises.length > 0;

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
    const same = all.filter((x) => x.subject === subject && !x.builtin);
    const i = same.findIndex((x) => x.id === id);
    const other = same[i + dir];
    const a = store.get('topic', id);
    const b = other ? store.get('topic', other.id) : undefined;
    if (!a || !b) return;
    const at = nowIso();
    const aOrder = a.order === b.order ? b.order + dir : b.order;
    void store.put('topic', { ...a, order: aOrder, updatedAt: at });
    void store.put('topic', { ...b, order: a.order, updatedAt: at });
  };

  const setState = (ids: string[], state: TopicState) => {
    const p = person && store.get('profile', person.id);
    if (!p || !ids.length) return;
    const at = nowIso();
    void store.put('profile', { ...p, ...setTopicState(p, ids, state, at), updatedAt: at });
  };

  const plan = person?.plan && planActive(person.plan, now) ? person.plan : null;

  return (
    <>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <h1 style={{ flex: 1 }}>Tematy</h1>
        <button className="btn btn-primary" onClick={() => onEdit({ title: '', subject: 'pl', description: '', dsl: '', source: 'manual' })}>
          <Icon name="plus" size={20} /> Nowy temat
        </button>
      </div>
      <div className="who-pick" role="group" aria-label="Dla kogo">
        <span className="who-label">Dla kogo</span>
        {profiles.map((p) => (
          <button key={p.id} type="button" aria-pressed={who === p.id} onClick={() => setWho(p.id)}>
            {p.avatar} {p.name} · kl. {gradeOf(p)}
          </button>
        ))}
        <button type="button" aria-pressed={who === 'all'} onClick={() => setWho('all')}>
          Wszystkie tematy
        </button>
      </div>
      {person ? (
        <p className="muted">
          <b>Teraz</b> — temat jest w planie dziecka i stoi na górze jego ekranu startowego
          {plan ? ` (plan${plan.title ? ` „${plan.title}”` : ''}${plan.until ? `, termin ${new Date(plan.until + 'T12:00:00').toLocaleDateString('pl-PL')}` : ', bez terminu'})` : ''}. <b>Biblioteka</b> —
          zwykły temat na planszy swojego działu. <b>Skończony</b> — schodzi z planszy, ale zostaje w powtórkach, błędach i sprawdzianach.
        </p>
      ) : (
        <p className="muted">
          Tematy wbudowane możesz ukryć albo skopiować i zmienić. Własne tematy edytujesz w prostym formacie tekstowym — jedno zadanie w jednej linii. Żeby ustawić, co dziecko ćwiczy
          teraz, a co ma już za sobą, wybierz je u góry.
        </p>
      )}
      {SUBJECTS.filter((s) => topics.some((t) => t.subject === s.id)).map((s) => {
        const units = groupByUnit(topics.filter((t) => t.subject === s.id));
        return (
          <section key={s.id} className="card col" aria-label={s.name} style={{ gap: 10 }}>
            <h2 className="card-title" style={{ margin: 0 }}>
              {s.name}
            </h2>
            {units.map((u) => {
              const ids = u.topics.filter(visible).map((t) => t.id);
              const states = person ? ids.map((id) => topicState(person, id, now)) : [];
              const nowN = states.filter((x) => x === 'now').length;
              const doneN = states.filter((x) => x === 'done').length;
              const allDone = ids.length > 0 && doneN === ids.length;
              return (
                <UnitFold
                  key={`${who}:${s.id}:${u.unit}`}
                  // Otwarte są działy z tematami „teraz” oraz tematy bez działu (zwykle świeżo dodane przez rodzica).
                  open={nowN > 0 || !u.unit}
                  done={!!person && allDone}
                  title={unitLabel(u.unit)}
                  meta={
                    <>
                      <span className="muted">
                        {u.topics.length} {plural(u.topics.length, ['temat', 'tematy', 'tematów'])}
                      </span>
                      {nowN > 0 && <span className="pill now">teraz: {nowN}</span>}
                      {person && allDone ? <span className="pill">skończony</span> : doneN > 0 && <span className="pill">skończone: {doneN}</span>}
                    </>
                  }
                >
                  {person && ids.length > 0 && (
                    <div className="row" style={{ flexWrap: 'wrap' }}>
                      {allDone ? (
                        <button className="btn btn-sm" onClick={() => setState(ids, 'library')}>
                          <Icon name="repeat" size={16} /> Przywróć dział na planszę
                        </button>
                      ) : (
                        <button className="btn btn-sm" onClick={() => setState(ids, 'done')}>
                          <Icon name="check" size={16} /> Cały dział: skończony
                        </button>
                      )}
                    </div>
                  )}
                  {u.topics.map((t) => {
                    const isHidden = t.builtin && hidden.has(t.id);
                    const state = person && visible(t) ? topicState(person, t.id, now) : null;
                    return (
                      <div key={t.id} className="topic-item" style={{ opacity: isHidden ? 0.55 : 1 }}>
                        <div className="topic-item-head">
                          <b>{t.title}</b>
                          <div className="muted topic-item-meta">
                            {t.exercises.length} {plural(t.exercises.length, ['zadanie', 'zadania', 'zadań'])} · {gradesLabel(t.grades)} · {SOURCE_LABEL[t.source]}
                            {isHidden ? ' · ukryty dla ucznia' : ''}
                          </div>
                          {t.errors.length > 0 && (
                            <div className="pill bad">
                              {t.errors.length} {plural(t.errors.length, ['błąd', 'błędy', 'błędów'])} w treści
                            </div>
                          )}
                        </div>
                        {state && (
                          <div className="state-switch" role="group" aria-label={`Stan tematu: ${t.title}`}>
                            {(['now', 'library', 'done'] as const).map((x) => (
                              <button key={x} type="button" aria-pressed={state === x} onClick={() => state !== x && setState([t.id], x)}>
                                {STATE_LABEL[x]}
                              </button>
                            ))}
                          </div>
                        )}
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
                                  onEdit({ title: `${t.title} (moja wersja)`, subject: t.subject, description: t.description ?? '', guide: t.guide, words: t.words, unit: t.unit, lesson: t.lesson, dsl: t.dsl, source: 'manual', grades: t.grades })
                                }
                              >
                                <Icon name="copy" size={16} /> Kopiuj i zmień
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn btn-sm"
                                onClick={() => onEdit({ topicId: t.id, title: t.title, subject: t.subject, description: t.description ?? '', guide: t.guide, words: t.words, unit: t.unit, lesson: t.lesson, dsl: t.dsl, source: t.source, grades: t.grades })}
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
                      </div>
                    );
                  })}
                </UnitFold>
              );
            })}
          </section>
        );
      })}
    </>
  );
}

/** Zwijany dział. Stan otwarcia pamiętamy lokalnie — zmiana stanu tematu nie zamyka działu, w którym rodzic właśnie pracuje. */
export function UnitFold({ title, meta, open: initial, done, children }: { title: string; meta?: ReactNode; open: boolean; done?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(initial);
  return (
    <details className={`unit-fold ${done ? 'is-done' : ''}`} open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>
        <Icon name="chevronDown" size={20} className="fold-chev" />
        <b>{title}</b>
        {meta}
      </summary>
      <div className="col unit-fold-body">{children}</div>
    </details>
  );
}

export function TopicEditor({ seed, onClose }: { seed: EditorSeed; onClose: () => void }) {
  const [title, setTitle] = useState(seed.title);
  const [subject, setSubject] = useState(seed.subject);
  const [description, setDescription] = useState(seed.description);
  const [guide, setGuide] = useState(seed.guide ?? '');
  const [words, setWords] = useState(seed.words ?? '');
  const [unit, setUnit] = useState(seed.unit ?? '');
  const [lesson, setLesson] = useState(seed.lesson ?? '');
  const lessonErrors = useMemo(() => parseLesson(lesson)?.errors ?? [], [lesson]);
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
      words: words.trim() || undefined,
      unit: unit.trim() || undefined,
      lesson: lesson.trim() || undefined,
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
              <label className="field">
                <span>Dział (opcjonalnie) — tematy z tym samym działem są razem na planszy dziecka, np. „Ułamki zwykłe” albo „Unit 1”</span>
                <input className="input" value={unit} onChange={(e) => setUnit(e.target.value)} maxLength={30} placeholder="np. Ułamki zwykłe" list="ww-units" />
                <datalist id="ww-units">
                  {[...new Set(store.allTopics().filter((t) => t.subject === subject && t.unit).map((t) => t.unit!.trim()))].map((u) => (
                    <option key={u} value={u} />
                  ))}
                </datalist>
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
              <label className="field">
                <span>Lekcja (tryb nauki) — krótkie karty do przeczytania przed ćwiczeniami: najważniejsze, krok po kroku, tak / nie tak, zapamiętaj, pytania kontrolne</span>
                <textarea className="input" style={{ minHeight: 180, fontSize: 14 }} value={lesson} onChange={(e) => setLesson(e.target.value)} spellCheck={false} placeholder={LESSON_HELP} />
              </label>
              {lessonErrors.length > 0 && (
                <div className="note" role="alert">
                  <b>
                    Lekcja: {lessonErrors.length} {plural(lessonErrors.length, ['błąd', 'błędy', 'błędów'])}
                  </b>
                  {lessonErrors.slice(0, 5).map((e, i) => (
                    <div key={i}>
                      Linia {e.line}: {e.message}
                    </div>
                  ))}
                </div>
              )}
              {(subjectLang(subject) !== 'pl' || words) && (
                <label className="field">
                  <span>Słówka — po jednym w linii: wyraz = tłumaczenie (lista do nauki z wymową i podpowiedzi do słów w zdaniach)</span>
                  <textarea className="input" style={{ minHeight: 110 }} value={words} onChange={(e) => setWords(e.target.value)} spellCheck={false} placeholder={'wardrobe = szafa\nnext to = obok\ntrousers = spodnie'} />
                </label>
              )}
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
                <b>tekst:</b> Tytuł &gt;&gt; treść tekstu (akapity oddziel <code>//</code>) — czytanie ze zrozumieniem. Zadania pod tą linią są pytaniami do
                tekstu, aż do następnej linii <code>tekst:</code> albo <code>tekst: koniec</code>.
              </p>
              <p>
                Na końcu każdej linii możesz dodać wyjaśnienie po <code>!!</code> — dziecko zobaczy je po odpowiedzi. Przed nim może stać podpowiedź po{' '}
                <code>??</code> (np. tłumaczenie zdania) — dziecko zobaczy ją po stuknięciu „Podpowiedź”.
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
                <span className="type">
                  {TYPE_LABEL[ex.type]}
                  {ex.passage ? ` · tekst: ${ex.passage.title}` : ''}
                </span>
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
