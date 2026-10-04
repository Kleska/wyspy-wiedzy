import { useEffect, useMemo, useRef, useState } from 'react';
import { divisionCheck, divisionLayout, type DivLayout } from '../longdiv';
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
    <div ref={box} className="ldiv" role="img" aria-label={`Dzielenie pisemne: ${layout.dividend} podzielić przez ${layout.divisor}`} style={{ gridTemplateColumns: `repeat(${n + 1}, 1.12em) auto`, gridTemplateRows: rows }}>
      {layout.cells
        .filter((c) => c.from <= at)
        .map((c, i) => {
          const inPart = f?.part && c.row === f.part.row && c.col >= f.part.colFrom && c.col <= f.part.colTo;
          const fresh = frame !== undefined && c.from === at && at > 0;
          return (
            <span key={i} className={`ldiv-c ldiv-${c.kind}${c.muted ? ' muted' : ''}${inPart ? ' part' : ''}${fresh ? ' fresh' : ''}`} style={{ gridRow: c.row + 1, gridColumn: c.col + 2 }}>
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
        <span className="muted">Porównaj ze swoją kartką.</span>
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
