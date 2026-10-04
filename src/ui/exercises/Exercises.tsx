import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import type { ChoiceExercise, DictationExercise, Exercise, FillExercise, Lang, MatchExercise, SortExercise, TapExercise } from '../../types';
import { dictationText, isFillAnswerCorrect, maskSpelling } from '../../dsl';
import { hasVoice, speak } from '../../speech';
import { plural } from '../../themes';
import { Icon } from '../icons';
import { seededOrder, type Answer } from './logic';

interface Props<E extends Exercise, A extends Answer> {
  ex: E;
  answer: A;
  setAnswer: (a: A) => void;
  reveal: boolean;
  hint: boolean;
  seed: string;
  onEnter?: () => void;
  /** Język treści zadania (angielski: głos angielski, klawisz apostrofu zamiast polskich liter). */
  lang?: Lang;
}

/** Zamienia zapis 3/4 na ułamek „piętrowy”. */
export function withFractions(text: string): React.ReactNode {
  const re = /(\d+)\/(\d+)/g;
  if (!re.test(text)) return text;
  re.lastIndex = 0;
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(<Fragment key={k++}>{text.slice(last, m.index)}</Fragment>);
    out.push(
      <span key={k++} className="frac" aria-label={`${m[1]} przez ${m[2]}`}>
        <span className="frac-n">{m[1]}</span>
        <span className="frac-d">{m[2]}</span>
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(<Fragment key={k++}>{text.slice(last)}</Fragment>);
  return out;
}

export function renderSentence(s: string) {
  const out: React.ReactNode[] = [];
  const re = /\{([^}]+)\}|_{2,}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(<Fragment key={k++}>{withFractions(s.slice(last, m.index))}</Fragment>);
    if (m[1]) out.push(<span key={k++} className="hl">{withFractions(m[1])}</span>);
    else out.push(<span key={k++} className="blank" aria-label="luka">&nbsp;</span>);
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push(<Fragment key={k++}>{withFractions(s.slice(last))}</Fragment>);
  return out;
}

export function ExerciseView(p: Props<Exercise, Answer>) {
  switch (p.ex.type) {
    case 'choice':
      return <Choice {...(p as unknown as Props<ChoiceExercise, number | null>)} />;
    case 'tap':
      return <Tap {...(p as unknown as Props<TapExercise, number[]>)} />;
    case 'sort':
      return <Sort {...(p as unknown as Props<SortExercise, (number | null)[]>)} />;
    case 'fill':
    case 'dictation':
      return <Fill {...(p as unknown as Props<FillExercise | DictationExercise, string[]>)} />;
    case 'match':
      return <Match {...(p as unknown as Props<MatchExercise, number[]>)} />;
  }
}

// ─── Wybór ───────────────────────────────────────────────────────────────────

function Choice({ ex, answer, setAnswer, reveal, hint, seed }: Props<ChoiceExercise, number | null>) {
  const order = useMemo(() => seededOrder(ex.options.length, seed), [ex.options.length, seed]);
  const hidden = hint && ex.options.length > 2 ? order.find((i) => i !== ex.correct && i !== answer) : undefined;
  return (
    <>
      {ex.sentence && <p className="sentence">{renderSentence(ex.sentence)}</p>}
      <div className="options" role="group" aria-label="Odpowiedzi">
        {order.map((i, k) => {
          const cls = reveal ? (i === ex.correct ? 'correct' : i === answer ? 'wrong' : '') : '';
          return (
            <button
              key={i}
              className={`opt ${cls} ${i === hidden ? 'hidden-opt' : ''}`}
              aria-pressed={answer === i}
              disabled={reveal || i === hidden}
              onClick={() => setAnswer(i)}
              aria-keyshortcuts={String(k + 1)}
            >
              {withFractions(ex.options[i])}
              {reveal && i === ex.correct && (
                <span className="mark good">
                  <Icon name="check" size={18} stroke={3.2} />
                </span>
              )}
              {reveal && i === answer && i !== ex.correct && (
                <span className="mark bad">
                  <Icon name="x" size={18} stroke={3.2} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

// ─── Klikanie słów ───────────────────────────────────────────────────────────

function Tap({ ex, answer, setAnswer, reveal, hint }: Props<TapExercise, number[]>) {
  const correct = new Set(ex.correct);
  const sel = new Set(answer);
  const toggle = (i: number) => {
    const n = new Set(sel);
    if (n.has(i)) n.delete(i);
    else n.add(i);
    setAnswer([...n].sort((a, b) => a - b));
  };
  return (
    <>
      {hint && (
        <p className="find-count">
          Szukasz {ex.correct.length} {plural(ex.correct.length, ['słowa', 'słów', 'słów'])}.
        </p>
      )}
      <div className="words">
        {ex.tokens.map((t, i) => {
          let cls = '';
          if (reveal) cls = correct.has(i) ? (sel.has(i) ? 'correct' : 'missed') : sel.has(i) ? 'wrong' : '';
          return (
            <button key={i} className={`word ${cls}`} aria-pressed={!reveal && sel.has(i)} disabled={reveal} onClick={() => toggle(i)}>
              {t}
            </button>
          );
        })}
      </div>
    </>
  );
}

// ─── Sortowanie ──────────────────────────────────────────────────────────────

interface DragState {
  i: number;
  x: number;
  y: number;
  sx: number;
  sy: number;
  moved: boolean;
  w: number;
  h: number;
}

function Sort({ ex, answer, setAnswer, reveal, seed }: Props<SortExercise, (number | null)[]>) {
  const order = useMemo(() => seededOrder(ex.items.length, seed), [ex.items.length, seed]);
  const [selected, setSelected] = useState<number | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [hover, setHover] = useState<number | 'bank' | null>(null);

  const place = (i: number, cat: number | null) => {
    const a = answer.slice();
    a[i] = cat;
    setAnswer(a);
    setSelected(null);
  };

  const targetAt = (x: number, y: number): number | 'bank' | null => {
    const el = document.elementFromPoint(x, y)?.closest('[data-drop]') as HTMLElement | null;
    if (!el) return null;
    const v = el.dataset.drop!;
    return v === 'bank' ? 'bank' : Number(v);
  };

  // Zwykłe stuknięcie: słowo z puli zostaje zaznaczone; stuknięcie słowa w koszyku, gdy coś jest
  // zaznaczone, wkłada zaznaczone słowo do tego koszyka; bez zaznaczenia słowo wraca do puli.
  const tapToken = (i: number) => {
    const cat = answer[i];
    if (cat !== null && selected !== null && selected !== i) place(selected, cat);
    else if (cat !== null) place(i, null);
    else setSelected(selected === i ? null : i);
  };

  const onDown = (e: React.PointerEvent<HTMLButtonElement>, i: number) => {
    if (reveal) return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ i, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: false, w: r.width, h: r.height });
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const moved = drag.moved || Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 8;
    setDrag({ ...drag, x: e.clientX, y: e.clientY, moved });
    if (moved) setHover(targetAt(e.clientX, e.clientY));
  };
  const onUp = (e: React.PointerEvent) => {
    if (!drag) return;
    const d = drag;
    setDrag(null);
    setHover(null);
    if (d.moved) {
      const t = targetAt(e.clientX, e.clientY);
      if (t === 'bank') place(d.i, null);
      else if (t !== null) place(d.i, t);
      return;
    }
    tapToken(d.i);
  };

  const token = (i: number) => {
    const placed = answer[i];
    let cls = '';
    if (reveal && placed !== null) cls = placed === ex.items[i].cat ? 'correct' : 'wrong';
    if (selected === i) cls += ' selected';
    if (drag?.i === i && drag.moved) cls += ' ghost';
    return (
      <button
        key={i}
        className={`token ${cls}`}
        onPointerDown={(e) => onDown(e, i)}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => {
          setDrag(null);
          setHover(null);
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            tapToken(i);
          }
        }}
        disabled={reveal}
        aria-pressed={selected === i}
      >
        {ex.items[i].text}
        {reveal && placed !== null && placed !== ex.items[i].cat && (
          <span style={{ fontSize: 14, marginLeft: 8, color: 'var(--bad)' }}>→ {ex.categories[ex.items[i].cat]}</span>
        )}
      </button>
    );
  };

  const inBank = order.filter((i) => answer[i] === null);
  return (
    <>
      <div className={`bank ${hover === 'bank' ? 'drop-hover' : ''}`} data-drop="bank">
        {inBank.length ? inBank.map(token) : <span className="basket-hint">Wszystkie słowa są w koszykach.</span>}
      </div>
      <div className="baskets">
        {ex.categories.map((c, ci) => (
          <div
            key={ci}
            role="button"
            tabIndex={reveal ? -1 : 0}
            aria-label={`Koszyk: ${c}${selected !== null ? '. Stuknij, aby włożyć zaznaczone słowo.' : ''}`}
            className={`basket ${hover === ci ? 'drop-hover' : ''} ${selected !== null ? 'target' : ''}`}
            data-drop={ci}
            onClick={() => selected !== null && !reveal && place(selected, ci)}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && selected !== null && !reveal) {
                e.preventDefault();
                place(selected, ci);
              }
            }}
          >
            <div className="basket-head">{c}</div>
            <div className="basket-body">
              {order.filter((i) => answer[i] === ci).map(token)}
              {selected !== null && <span className="basket-hint">stuknij tutaj</span>}
            </div>
          </div>
        ))}
      </div>
      {drag?.moved && (
        <div className="token dragging" style={{ left: drag.x - drag.w / 2, top: drag.y - drag.h / 2, width: drag.w, height: drag.h, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {ex.items[drag.i].text}
        </div>
      )}
    </>
  );
}

// ─── Luki ────────────────────────────────────────────────────────────────────

const PL_LETTERS = ['ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż'];
const isMathAnswer = (a: string) => /^[-−]?[\d\s.,/]+$/.test(a);
const isFracGap = (g: string[]) => g.some((a) => /^\d+\/\d+$/.test(a)) && g.every((a) => /^\d+(\/\d+)?$/.test(a));
const coarsePointer = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;

type Slot = { gap: number; part: 'x' | 'n' | 'd' };

/** Głosy w przeglądarce ładują się asynchronicznie — odświeżamy, gdy się pojawią. */
function useVoice(lang: Lang): boolean {
  const [ok, setOk] = useState(() => hasVoice(lang));
  useEffect(() => {
    if (ok || typeof speechSynthesis === 'undefined') return;
    const on = () => setOk(hasVoice(lang));
    speechSynthesis.addEventListener('voiceschanged', on);
    const t = setTimeout(on, 1500);
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', on);
      clearTimeout(t);
    };
  }, [ok, lang]);
  return ok;
}

function Listen({ ex, voice, lang }: { ex: DictationExercise; voice: boolean; lang: Lang }) {
  const text = dictationText(ex.parts);
  useEffect(() => {
    // Próba odczytu od razu (na iPadzie może wymagać stuknięcia — wtedy działa przycisk).
    const t = setTimeout(() => speak(text, undefined, lang), 250);
    return () => clearTimeout(t);
  }, [text, lang]);
  return (
    <div className="listen">
      <button type="button" className="btn btn-primary btn-lg listen-btn" onClick={() => speak(text, undefined, lang)}>
        <Icon name="volume" size={30} /> Posłuchaj
      </button>
      <button type="button" className="btn" onClick={() => speak(text, 0.6, lang)}>
        Wolniej
      </button>
      {!voice && (
        <p className="muted listen-note">
          {lang === 'en'
            ? 'To urządzenie nie ma angielskiego głosu — w lukach widać wyraz z ukrytymi samogłoskami.'
            : 'To urządzenie nie ma polskiego głosu — w lukach widać wyraz z ukrytymi trudnymi literami.'}
        </p>
      )}
    </div>
  );
}

function Fill({ ex, answer, setAnswer, reveal, hint, onEnter, lang = 'pl' }: Props<FillExercise | DictationExercise, string[]>) {
  const dictation = ex.type === 'dictation';
  const voice = useVoice(lang);
  const maskAlways = dictation && !voice;
  const gaps = ex.parts.filter((p): p is string[] => Array.isArray(p));
  const mathy = !dictation && gaps.every((g) => g.every(isMathAnswer));
  const hasComma = gaps.some((g) => g.some((a) => a.includes(',')));
  const hasSlash = gaps.some((g, i) => !isFracGap(g) && g.some((a) => a.includes('/'))) && !gaps.every(isFracGap);
  const slotOrder: Slot[] = gaps.flatMap((g, i): Slot[] => (isFracGap(g) ? [{ gap: i, part: 'n' }, { gap: i, part: 'd' }] : [{ gap: i, part: 'x' }]));
  const refs = useRef<Record<string, HTMLInputElement | null>>({});
  const focus = useRef<Slot>(slotOrder[0]);
  const key = (sl: Slot) => `${sl.gap}${sl.part}`;
  const virtualOnly = mathy && coarsePointer();

  const getVal = (sl: Slot): string => {
    const v = answer[sl.gap] ?? '';
    if (sl.part === 'x') return v;
    const [n, d] = v.split('/');
    return sl.part === 'n' ? n ?? '' : d ?? '';
  };
  const setVal = (sl: Slot, val: string) => {
    const a = answer.slice();
    if (sl.part === 'x') a[sl.gap] = val;
    else {
      const [n = '', d = ''] = (a[sl.gap] ?? '').split('/');
      const nn = sl.part === 'n' ? val : n;
      const dd = sl.part === 'd' ? val : d;
      a[sl.gap] = dd ? `${nn}/${dd}` : nn;
    }
    setAnswer(a);
  };
  const focusSlot = (sl: Slot | undefined) => {
    if (!sl) return;
    focus.current = sl;
    const el = refs.current[key(sl)];
    el?.focus();
  };
  const nextSlot = (sl: Slot) => slotOrder[slotOrder.findIndex((x) => key(x) === key(sl)) + 1];

  const press = (k: string) => {
    const sl = focus.current;
    const el = refs.current[key(sl)];
    const v = getVal(sl);
    const start = el?.selectionStart ?? v.length;
    const end = el?.selectionEnd ?? v.length;
    let nv: string;
    let caret: number;
    if (k === '⌫') {
      if (start !== end) {
        nv = v.slice(0, start) + v.slice(end);
        caret = start;
      } else {
        nv = v.slice(0, Math.max(0, start - 1)) + v.slice(start);
        caret = Math.max(0, start - 1);
      }
    } else {
      nv = v.slice(0, start) + k + v.slice(end);
      caret = start + k.length;
    }
    setVal(sl, nv);
    requestAnimationFrame(() => {
      const e2 = refs.current[key(sl)];
      if (!e2) return;
      e2.focus();
      try {
        e2.setSelectionRange(caret, caret);
      } catch {
        /* niektóre pola nie wspierają zaznaczenia */
      }
    });
  };

  const input = (sl: Slot, accepted: string[], width: number, extraClass = '', placeholder = '') => (
    <input
      key={key(sl)}
      ref={(el) => {
        refs.current[key(sl)] = el;
      }}
      className={`gap ${extraClass}`}
      value={getVal(sl)}
      onChange={(e) => setVal(sl, sl.part === 'x' ? e.target.value : e.target.value.replace(/[^\d]/g, ''))}
      onFocus={() => (focus.current = sl)}
      onKeyDown={(e) => {
        if (reveal) return; // po sprawdzeniu Enter przechodzi dalej (obsługa w ćwiczeniu)
        if (e.key === '/' && sl.part === 'n') {
          e.preventDefault();
          focusSlot(nextSlot(sl));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const nx = nextSlot(sl);
          if (nx && !getVal(nx)) focusSlot(nx);
          else onEnter?.();
        }
      }}
      readOnly={reveal}
      inputMode={virtualOnly ? 'none' : mathy ? (hasSlash || hasComma ? 'text' : 'numeric') : 'text'}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      aria-label={sl.part === 'n' ? `Licznik, luka ${sl.gap + 1}` : sl.part === 'd' ? `Mianownik, luka ${sl.gap + 1}` : `Luka ${sl.gap + 1}`}
      placeholder={placeholder}
      style={{ width: `calc(${width}ch + 26px)` }}
      data-accepted={accepted.length}
    />
  );

  let gi = -1;
  return (
    <>
      {ex.type === 'dictation' && <Listen ex={ex} voice={voice} lang={lang} />}
      <p className={`fill-text ${dictation ? 'dictation-text' : ''}`}>
        {ex.parts.map((p, k) => {
          // „ // ” w tekście zadania zaczyna nową linię (np. kolejne kroki dzielenia pisemnego).
          if (!Array.isArray(p))
            return (
              <Fragment key={k}>
                {p.split(' // ').map((piece, n) => (
                  <Fragment key={n}>
                    {n > 0 && <br />}
                    {withFractions(piece)}
                  </Fragment>
                ))}
              </Fragment>
            );
          gi++;
          const i = gi;
          const ok = reveal ? isFillAnswerCorrect(answer[i] ?? '', p) : null;
          const cls = ok === true ? 'correct' : ok === false ? 'wrong' : '';
          if (isFracGap(p)) {
            const [cn, cd] = p.find((a) => a.includes('/'))!.split('/');
            return (
              <Fragment key={k}>
                {reveal && ok === false && <span className="fix">{withFractions(p[0])}</span>}
                <span className={`frac-gap ${cls}`} role="group" aria-label={`Ułamek, luka ${i + 1}`}>
                  {input({ gap: i, part: 'n' }, p, Math.max(2, cn.length + 1), cls, hint ? cn.slice(0, 1) : '')}
                  <span className="frac-line" aria-hidden="true" />
                  {input({ gap: i, part: 'd' }, p, Math.max(2, cd.length + 1), cls, hint ? cd.slice(0, 1) : '')}
                </span>
              </Fragment>
            );
          }
          return (
            <Fragment key={k}>
              {reveal && ok === false && <span className="fix">{withFractions(p[0])}</span>}
              {input(
                { gap: i, part: 'x' },
                p,
                dictation ? Math.max(8, p[0].length + 3) : Math.max(3, Math.max(...p.map((a) => a.length)) + 1),
                cls,
                dictation ? (hint || maskAlways ? maskSpelling(p[0], lang) : '') : hint ? p[0].slice(0, 1) + '…' : '',
              )}
            </Fragment>
          );
        })}
      </p>
      {!reveal && mathy && (
        <div className="keypad" aria-label="Klawiatura liczbowa">
          {['7', '8', '9', '4', '5', '6', '1', '2', '3'].map((d) => (
            <button key={d} type="button" onPointerDown={(e) => e.preventDefault()} onClick={() => press(d)}>
              {d}
            </button>
          ))}
          {hasComma || hasSlash ? (
            <button type="button" onPointerDown={(e) => e.preventDefault()} onClick={() => press(hasComma ? ',' : '/')} aria-label={hasComma ? 'Przecinek' : 'Kreska ułamkowa'}>
              {hasComma ? ',' : '/'}
            </button>
          ) : slotOrder.length > 1 ? (
            <button type="button" onPointerDown={(e) => e.preventDefault()} onClick={() => focusSlot(nextSlot(focus.current) ?? slotOrder[0])} aria-label="Następne pole">
              <Icon name="arrowRight" size={26} />
            </button>
          ) : (
            <span />
          )}
          <button type="button" onPointerDown={(e) => e.preventDefault()} onClick={() => press('0')}>
            0
          </button>
          <button type="button" className="key-back" onPointerDown={(e) => e.preventDefault()} onClick={() => press('⌫')} aria-label="Usuń">
            ⌫
          </button>
          {slotOrder.length > 1 && (hasComma || hasSlash) && (
            <button type="button" className="key-wide" onPointerDown={(e) => e.preventDefault()} onClick={() => focusSlot(nextSlot(focus.current) ?? slotOrder[0])} aria-label="Następne pole">
              Następne pole <Icon name="arrowRight" size={22} />
            </button>
          )}
        </div>
      )}
      {!reveal && !mathy && lang === 'en' && (
        <div className="pl-keys-wrap">
          <span className="pl-keys-label">Apostrof (jak w isn&apos;t) — stuknij tutaj, a wpisze się w okienko:</span>
          <div className="pl-keys" aria-label="Apostrof">
            <button type="button" onPointerDown={(e) => e.preventDefault()} onClick={() => press("'")} aria-label="Wstaw apostrof">
              &apos;
            </button>
          </div>
        </div>
      )}
      {!reveal && !mathy && lang !== 'en' && (
        <div className="pl-keys-wrap">
          <span className="pl-keys-label">Nie ma tej litery na klawiaturze? Stuknij tutaj, a wpisze się w okienko:</span>
          <div className="pl-keys" aria-label="Polskie litery">
            {PL_LETTERS.map((ch) => (
              <button key={ch} type="button" onPointerDown={(e) => e.preventDefault()} onClick={() => press(ch)} aria-label={`Wstaw ${ch}`}>
                {ch}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Pary ────────────────────────────────────────────────────────────────────

function Match({ ex, answer, setAnswer, reveal, seed }: Props<MatchExercise, number[]>) {
  const right = useMemo(() => seededOrder(ex.pairs.length, seed), [ex.pairs.length, seed]);
  const [activeL, setActiveL] = useState<number | null>(null);
  const [activeR, setActiveR] = useState<number | null>(null);
  const pairOfRight = (r: number) => answer.findIndex((v) => v === r);

  const link = (l: number, r: number) => {
    const a = answer.map((v) => (v === r ? -1 : v));
    a[l] = r;
    setAnswer(a);
    setActiveL(null);
    setActiveR(null);
  };
  const clickL = (l: number) => {
    if (answer[l] >= 0) {
      const a = answer.slice();
      a[l] = -1;
      setAnswer(a);
      return;
    }
    if (activeR !== null) link(l, activeR);
    else setActiveL(activeL === l ? null : l);
  };
  const clickR = (r: number) => {
    const owner = pairOfRight(r);
    if (owner >= 0) {
      const a = answer.slice();
      a[owner] = -1;
      setAnswer(a);
      return;
    }
    if (activeL !== null) link(activeL, r);
    else setActiveR(activeR === r ? null : r);
  };

  return (
    <>
      <div className="match">
        <div className="match-col">
          {ex.pairs.map(([l], i) => {
            const paired = answer[i] >= 0;
            const res = reveal ? (answer[i] === i ? 'correct' : 'wrong') : '';
            return (
              <button key={i} className={`match-item ${paired ? `paired pair-${i % 6}` : ''} ${activeL === i ? 'active' : ''} ${res}`} disabled={reveal} onClick={() => clickL(i)}>
                {withFractions(l)}
              </button>
            );
          })}
        </div>
        <div className="match-col">
          {right.map((r) => {
            const owner = pairOfRight(r);
            const res = reveal && owner >= 0 ? (owner === r ? 'correct' : 'wrong') : '';
            return (
              <button key={r} className={`match-item ${owner >= 0 ? `paired pair-${owner % 6}` : ''} ${activeR === r ? 'active' : ''} ${res}`} disabled={reveal} onClick={() => clickR(r)}>
                {withFractions(ex.pairs[r][1])}
              </button>
            );
          })}
        </div>
      </div>
      {reveal && answer.some((v, i) => v !== i) && (
        <div className="hint-box">
          <Icon name="check" />
          <span>
            Poprawne pary:{' '}
            {ex.pairs.map(([l, r], i) => (
              <Fragment key={i}>
                {i > 0 && ' · '}
                <b>{l}</b> – {r}
              </Fragment>
            ))}
          </span>
        </div>
      )}
    </>
  );
}
