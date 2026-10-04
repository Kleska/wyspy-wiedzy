import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { divisionCheck, divisionEntry, divisionInputs, divisionLayout, type DivCellKind, type DivLayout } from '../longdiv';
import { multiplicationEntry, multiplicationLayout } from '../longmul';
import { Icon } from './icons';

/**
 * Zapis dzielenia pisemnego („słupek”). `frame` — ile kroków już widać (klatka z `layout.frames`);
 * bez `frame` rysuje całe gotowe rozwiązanie, bez podświetleń.
 */
export function DivisionGrid({ layout, frame }: { layout: DivLayout; frame?: number }) {
  const lastFrame = layout.frames.length - 1;
  const at = frame ?? lastFrame;
  const f = frame === undefined ? undefined : layout.frames[at];
  const n = layout.digits.length;
  const ruleRows = new Set(layout.rules.map((r) => r.row));
  // Zapis rośnie w dół razem z krokami (jak na kartce) — nie rezerwujemy z góry miejsca na cały słupek.
  const shown = Math.max(2, ...layout.cells.filter((c) => c.from <= at).map((c) => c.row), ...layout.rules.filter((r) => r.from <= at).map((r) => r.row));
  const rows = Array.from({ length: shown + 1 }, (_, r) => (ruleRows.has(r) ? '5px' : '1.42em')).join(' ');
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Nowy znak ma być widoczny nad stopką — na telefonie długi słupek nie mieści się na ekranie.
    if (frame !== undefined && frame > 0) box.current?.querySelector('.fresh')?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, [frame]);
  return (
    <div
      ref={box}
      className="ldiv"
      role="img"
      aria-label={`Dzielenie pisemne: ${layout.dividend} podzielić przez ${layout.divisor}`}
      style={{ gridTemplateColumns: `repeat(${n + 1}, 1.12em) auto`, gridTemplateRows: rows }}
    >
      {layout.cells
        .filter((c) => c.from <= at)
        .map((c, i) => {
          const inPart = f?.part && c.row === f.part.row && c.col >= f.part.colFrom && c.col <= f.part.colTo;
          const fresh = frame !== undefined && c.from === at && at > 0;
          return (
            <span
              key={i}
              className={`ldiv-c ldiv-${c.kind}${c.muted ? ' muted' : ''}${inPart ? ' part' : ''}${fresh ? ' fresh' : ''}`}
              style={{ gridRow: c.row + 1, gridColumn: c.col + 2 }}
            >
              {c.ch}
            </span>
          );
        })}
      {layout.rules
        .filter((r) => r.from <= at)
        .map((r, i) => (
          <span key={`r${i}`} className="ldiv-rule" style={{ gridRow: r.row + 1, gridColumn: `${r.colFrom + 2} / ${r.colTo + 3}` }} />
        ))}
      <span className="ldiv-side" style={{ gridRow: 3, gridColumn: n + 2 }}>
        : {layout.divisor}
      </span>
      {layout.remainder > 0 && at >= lastFrame && (
        <span className="ldiv-side ldiv-rem" style={{ gridRow: 1, gridColumn: n + 2 }}>
          r {layout.remainder}
        </span>
      )}
    </div>
  );
}

/** Słupek z opisem bieżącego kroku — krokami steruje ekran (lekcja) przez `frame`. */
export function DivisionSteps({ a, b, frame }: { a: number; b: number; frame: number }) {
  const layout = useMemo(() => divisionLayout(a, b), [a, b]);
  const at = Math.min(frame, layout.frames.length - 1);
  return (
    <div className="ldiv-steps">
      <p className="ldiv-text" aria-live="polite">
        <span className="ldiv-count">
          Krok {at + 1} z {layout.frames.length}
        </span>
        {layout.frames[at].text}
      </p>
      <DivisionGrid layout={layout} frame={at} />
    </div>
  );
}

/** Po odpowiedzi w zadaniu „Oblicz pisemnie”: gotowy słupek do porównania z kartką, na życzenie krok po kroku. */
export function DivisionSolution({ a, b }: { a: number; b: number }) {
  const layout = useMemo(() => divisionLayout(a, b), [a, b]);
  const [frame, setFrame] = useState<number | null>(null);
  const last = layout.frames.length - 1;
  return (
    <section className="ldiv-solution" aria-label="Rozwiązanie w słupku">
      <div className="ldiv-head">
        <b>Tak wygląda słupek</b>
        <span className="muted">Porównaj ze swoim zapisem.</span>
      </div>
      {frame !== null && (
        <p className="ldiv-text" aria-live="polite">
          <span className="ldiv-count">
            Krok {frame + 1} z {layout.frames.length}
          </span>
          {layout.frames[frame].text}
        </p>
      )}
      <DivisionGrid layout={layout} frame={frame ?? undefined} />
      {frame === null ? (
        <>
          <p className="ldiv-check">Sprawdzenie: {divisionCheck(layout)}</p>
          <button className="btn btn-sm" onClick={() => setFrame(0)}>
            <Icon name="repeat" size={16} /> Pokaż krok po kroku
          </button>
        </>
      ) : (
        <>
          <div className="row">
            <button className="btn btn-sm" onClick={() => setFrame(Math.max(0, frame - 1))} disabled={frame === 0}>
              <Icon name="chevronLeft" size={16} /> Wstecz
            </button>
            {frame < last ? (
              <button className="btn btn-sm btn-primary" onClick={() => setFrame(frame + 1)}>
                Następny krok <Icon name="arrowRight" size={16} />
              </button>
            ) : (
              <button className="btn btn-sm" onClick={() => setFrame(null)}>
                Pokaż całość
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}

const KIND_LABEL: Record<DivCellKind, string> = { quotient: 'Wynik', product: 'Iloczyn', rest: 'Reszta', brought: 'Spisana cyfra', dividend: 'Dzielna', minus: 'Minus' };

interface GridStatic {
  row: number;
  col: number;
  ch: string;
  cls: string;
}

interface GridInput {
  row: number;
  col: number;
  /** Poprawna cyfra. */
  ch: string;
  cls: string;
  /** Nazwa kratki dla czytnika ekranu, np. „Wynik”. */
  label: string;
  optional?: boolean;
}

/**
 * Działanie pisemne z kratkami do wypełnienia — jak karta pracy: liczby z zadania, znaki i kreski są wydrukowane,
 * dziecko wpisuje cyfry. Kratkę wybiera się stuknięciem; po wpisaniu cyfry zaznaczenie samo przechodzi do następnej
 * kratki (kolejność = kolejność `inputs`). Pod spodem klawiatura z cyframi; działa też klawiatura komputera.
 * Po sprawdzeniu (`reveal`) kratki robią się zielone albo czerwone, a przy błędzie pod spodem pojawia się `solution`.
 */
function DigitGrid({
  label,
  cols,
  rows,
  statics,
  inputs,
  rules,
  side,
  reveal,
  onValues,
  onEnter,
  solution,
}: {
  label: string;
  cols: number;
  rows: number;
  statics: GridStatic[];
  inputs: GridInput[];
  rules: { row: number; colFrom: number; colTo: number }[];
  side?: { row: number; text: string };
  reveal: boolean;
  onValues: (values: string[]) => void;
  onEnter?: () => void;
  solution?: ReactNode;
}) {
  const [values, setValues] = useState<string[]>(() => inputs.map(() => ''));
  const [active, setActive] = useState(0);
  const ruleRows = new Set(rules.map((r) => r.row));
  const rowSizes = Array.from({ length: rows }, (_, r) => (ruleRows.has(r) ? '5px' : 'var(--ldiv-cell)')).join(' ');

  const put = (i: number, v: string) => {
    const next = values.slice();
    next[i] = v;
    setValues(next);
    onValues(next);
  };
  const type = (d: string) => {
    if (reveal) return;
    put(active, d);
    if (active < inputs.length - 1) setActive(active + 1);
  };
  const erase = () => {
    if (reveal) return;
    if (values[active]) put(active, '');
    else if (active > 0) {
      put(active - 1, '');
      setActive(active - 1);
    }
  };
  const move = (d: number) => setActive(Math.max(0, Math.min(inputs.length - 1, active + d)));
  const good = (i: number) => values[i] === inputs[i].ch || (!!inputs[i].optional && !values[i]);
  const allGood = inputs.every((_, i) => good(i));

  return (
    <div className="ldiv-task">
      <div
        className="ldiv ldiv-input"
        role="group"
        aria-label={label}
        tabIndex={0}
        style={{ gridTemplateColumns: `repeat(${cols}, var(--ldiv-cell)) auto`, gridTemplateRows: rowSizes }}
        onKeyDown={(e) => {
          if (/^\d$/.test(e.key)) type(e.key);
          else if (e.key === 'Backspace' || e.key === 'Delete') erase();
          else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') move(1);
          else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') move(-1);
          else if (e.key === 'Enter') onEnter?.();
          else return;
          e.preventDefault();
        }}
      >
        {statics.map((c, i) => (
          <span key={`s${i}`} className={`ldiv-c ${c.cls}`} style={{ gridRow: c.row + 1, gridColumn: c.col + 1 }}>
            {c.ch}
          </span>
        ))}
        {inputs.map((c, i) => (
          <button
            key={i}
            type="button"
            className={`ldiv-in ${c.cls}${!reveal && i === active ? ' active' : ''}${reveal ? (good(i) ? ' ok' : ' bad') : ''}`}
            style={{ gridRow: c.row + 1, gridColumn: c.col + 1 }}
            aria-label={`${c.label}, kratka ${i + 1} z ${inputs.length}${values[i] ? `: ${values[i]}` : ', pusta'}`}
            aria-pressed={!reveal && i === active}
            disabled={reveal}
            tabIndex={-1}
            onClick={() => setActive(i)}
          >
            {values[i]}
          </button>
        ))}
        {rules.map((r, i) => (
          <span key={`r${i}`} className="ldiv-rule" style={{ gridRow: r.row + 1, gridColumn: `${r.colFrom + 1} / ${r.colTo + 2}` }} />
        ))}
        {side && (
          <span className="ldiv-side" style={{ gridRow: side.row + 1, gridColumn: cols + 1 }}>
            {side.text}
          </span>
        )}
      </div>
      {!reveal && (
        <div className="ldiv-keys" role="group" aria-label="Cyfry do wpisania">
          {['1', '2', '3', '4', '5'].map((d) => (
            <button key={d} type="button" onClick={() => type(d)}>
              {d}
            </button>
          ))}
          <button type="button" className="key-back" onClick={erase} aria-label="Usuń cyfrę">
            ⌫
          </button>
          {['6', '7', '8', '9', '0'].map((d) => (
            <button key={d} type="button" onClick={() => type(d)}>
              {d}
            </button>
          ))}
          <button type="button" className="key-back" onClick={() => move(1)} aria-label="Następna kratka">
            <Icon name="arrowRight" size={20} />
          </button>
        </div>
      )}
      {reveal && !allGood && solution}
    </div>
  );
}

/**
 * Słupek dzielenia do wypełnienia na ekranie: dzielna i dzielnik są wydrukowane, dziecko wpisuje cyfry wyniku,
 * iloczyny i reszty w kolejności pisania na kartce. `onChange` dostaje wynik i resztę odczytane ze słupka albo null,
 * gdy słupek nie jest jeszcze pełny.
 */
export function DivisionInput({
  a,
  b,
  reveal,
  onChange,
  onEnter,
}: {
  a: number;
  b: number;
  reveal: boolean;
  onChange: (entry: { quotient: string; remainder: string } | null) => void;
  onEnter?: () => void;
}) {
  const layout = useMemo(() => divisionLayout(a, b), [a, b]);
  const inputs = useMemo(() => divisionInputs(layout), [layout]);
  // Kolumna 0 siatki to miejsce na minus, więc kolumny słupka przesuwamy o jedną w prawo.
  return (
    <DigitGrid
      label={`Słupek do uzupełnienia: ${a} : ${b}`}
      cols={layout.digits.length + 1}
      rows={layout.rows}
      statics={layout.cells.filter((c) => c.kind === 'dividend' || c.kind === 'minus').map((c) => ({ row: c.row, col: c.col + 1, ch: c.ch, cls: `ldiv-${c.kind}` }))}
      inputs={inputs.map((c) => ({ row: c.row, col: c.col + 1, ch: c.ch, cls: `ldiv-${c.kind}`, label: KIND_LABEL[c.kind], optional: c.optional }))}
      rules={layout.rules.map((r) => ({ row: r.row, colFrom: r.colFrom + 1, colTo: r.colTo + 1 }))}
      side={{ row: 2, text: `: ${layout.divisor}` }}
      reveal={reveal}
      onValues={(v) => onChange(divisionEntry(inputs, v))}
      onEnter={onEnter}
      solution={<DivisionSolution a={a} b={b} />}
    />
  );
}

/** Gotowe mnożenie pisemne (bez kratek) — do porównania po błędnej odpowiedzi. */
function MultiplicationSolution({ a, b }: { a: number; b: number }) {
  const layout = useMemo(() => multiplicationLayout(a, b), [a, b]);
  const ruleRows = new Set(layout.rules.map((r) => r.row));
  const rowSizes = Array.from({ length: layout.rows }, (_, r) => (ruleRows.has(r) ? '5px' : '1.42em')).join(' ');
  return (
    <section className="ldiv-solution" aria-label="Rozwiązanie mnożenia">
      <div className="ldiv-head">
        <b>Tak wygląda mnożenie</b>
        <span className="muted">Porównaj ze swoim zapisem.</span>
      </div>
      <div
        className="ldiv"
        role="img"
        aria-label={`Mnożenie pisemne: ${a} razy ${b} równa się ${layout.product}`}
        style={{ gridTemplateColumns: `repeat(${layout.cols}, 1.12em)`, gridTemplateRows: rowSizes }}
      >
        {[...layout.statics, ...layout.inputs].map((c, i) => (
          <span key={i} className={`ldiv-c${c.kind === 'sum' ? ' ldiv-quotient' : ''}`} style={{ gridRow: c.row + 1, gridColumn: c.col + 1 }}>
            {c.ch}
          </span>
        ))}
        {layout.rules.map((r, i) => (
          <span key={`r${i}`} className="ldiv-rule" style={{ gridRow: r.row + 1, gridColumn: `${r.colFrom + 1} / ${r.colTo + 2}` }} />
        ))}
      </div>
    </section>
  );
}

/**
 * Mnożenie pisemne do wypełnienia na ekranie (np. sprawdzenie dzielenia): czynniki są wydrukowane, dziecko wpisuje
 * iloczyny częściowe i sumę — od prawej strony. `onChange` dostaje iloczyn odczytany z ostatniego wiersza albo null.
 */
export function MultiplicationInput({
  a,
  b,
  reveal,
  onChange,
  onEnter,
}: {
  a: number;
  b: number;
  reveal: boolean;
  onChange: (product: string | null) => void;
  onEnter?: () => void;
}) {
  const layout = useMemo(() => multiplicationLayout(a, b), [a, b]);
  return (
    <DigitGrid
      label={`Mnożenie pisemne do uzupełnienia: ${a} · ${b}`}
      cols={layout.cols}
      rows={layout.rows}
      statics={layout.statics.map((c) => ({ row: c.row, col: c.col, ch: c.ch, cls: `ldiv-${c.kind}` }))}
      inputs={layout.inputs.map((c) => ({
        row: c.row,
        col: c.col,
        ch: c.ch,
        cls: c.kind === 'sum' ? 'ldiv-quotient' : 'ldiv-product',
        label: c.kind === 'sum' ? 'Wynik' : 'Iloczyn częściowy',
      }))}
      rules={layout.rules}
      reveal={reveal}
      onValues={(v) => onChange(multiplicationEntry(layout, v))}
      onEnter={onEnter}
      solution={<MultiplicationSolution a={a} b={b} />}
    />
  );
}
