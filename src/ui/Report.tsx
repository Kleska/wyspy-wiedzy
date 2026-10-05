import { useState } from 'react';
import { nowIso, store, uid } from '../data/store';
import { addReport, isReported, REPORT_REASONS } from '../engine';
import type { ReportReason } from '../types';
import { Modal } from './bits';
import { useStoreVersion } from './hooks';
import { Icon } from './icons';

/** Zadanie, którego dotyczy zgłoszenie — z treścią, bo zadania losowane nie mają stałego źródła. */
export interface ReportTarget {
  topicId: string;
  exerciseId: string;
  topic: string;
  question: string;
  correct: string;
  given?: string;
}

const REASONS: ReportReason[] = ['mine', 'key', 'unclear'];

/**
 * „Zgłoś błąd w zadaniu”: dziecko (po złej odpowiedzi albo przy przeglądzie błędów) wskazuje, co jest nie tak,
 * a zgłoszenie trafia do panelu rodzica. Zgłoszenie zapisuje się w profilu dziecka (`Profile.reports`).
 * Zadanie, które już czeka na decyzję rodzica, pokazuje „Zgłoszone”.
 */
export function ReportButton({
  profileId,
  target,
  byParent,
  onOpenChange,
}: {
  profileId: string;
  target: ReportTarget;
  /** Zgłasza rodzic (z panelu) — inne słowa na przyciskach. */
  byParent?: boolean;
  /** Ekran zadania pilnuje, żeby Enter nie przeskoczył dalej, gdy okno jest otwarte. */
  onOpenChange?: (open: boolean) => void;
}) {
  useStoreVersion();
  const [open, setOpen] = useState(false);
  const profile = store.get('profile', profileId);
  if (!profile) return null;
  const toggle = (v: boolean) => {
    setOpen(v);
    onOpenChange?.(v);
  };
  const send = (reason: ReportReason) => {
    const cur = store.get('profile', profileId);
    if (cur) {
      const report = { id: uid(), ...target, given: target.given || undefined, reason, at: nowIso(), ...(byParent ? { byParent: true } : {}) };
      void store.put('profile', { ...cur, ...addReport(cur, report), updatedAt: nowIso() });
    }
    toggle(false);
  };

  if (isReported(profile, target.topicId, target.exerciseId)) {
    return (
      <span className="report-sent" role="status">
        <Icon name="check" size={15} stroke={3} /> {byParent ? 'Zgłoszone — decyzja na górze panelu' : 'Zgłoszone — rodzic to sprawdzi'}
      </span>
    );
  }
  return (
    <>
      <button type="button" className="link-btn report-link" onClick={() => toggle(true)}>
        <Icon name="flag" size={15} /> Zgłoś błąd w zadaniu
      </button>
      {open && (
        <Modal title="Co jest nie tak z tym zadaniem?" onClose={() => toggle(false)}>
          <p className="report-q">{target.question}</p>
          <div className="report-reasons">
            {REASONS.map((r) => (
              <button key={r} type="button" className="btn btn-lg" onClick={() => send(r)}>
                {REPORT_REASONS[r][byParent ? 'parent' : 'child']}
              </button>
            ))}
          </div>
          <p className="muted report-note">{byParent ? 'Zgłoszenie pojawi się na górze panelu — tam wyłączysz zadanie.' : 'Rodzic zobaczy zgłoszenie w swoim panelu.'}</p>
        </Modal>
      )}
    </>
  );
}
