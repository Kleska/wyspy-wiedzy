import { SUBJECTS } from '../../content/seed';
import { groupByUnit, unitLabel, type Progress } from '../../engine';
import type { ParsedTopic } from '../../types';
import { LevelChip } from '../bits';

/**
 * Lista tematów do zaznaczania (plan, kartkówka): przedmioty, a w nich rozdziały.
 * „Zaznacz wszystkie” działa na cały przedmiot; gdy przedmiot ma kilka rozdziałów, każdy ma też własny przycisk.
 */
export function TopicChecklist({ topics, sel, setSel, progress }: { topics: ParsedTopic[]; sel: string[]; setSel: (fn: (cur: string[]) => string[]) => void; progress?: Progress | null }) {
  const toggle = (ids: string[], on: boolean) => setSel((cur) => (on ? [...cur, ...ids.filter((x) => !cur.includes(x))] : cur.filter((x) => !ids.includes(x))));
  return (
    <>
      {SUBJECTS.filter((s) => topics.some((t) => t.subject === s.id)).map((s) => {
        const mine = topics.filter((t) => t.subject === s.id);
        const ids = mine.map((t) => t.id);
        const all = ids.every((id) => sel.includes(id));
        const units = groupByUnit(mine);
        const named = units.some((u) => u.unit);
        return (
          <fieldset key={s.id} className="field" aria-label={s.name} style={{ border: 0, padding: 0, margin: 0 }}>
            <span className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
              {s.name}
              <button type="button" className="btn btn-sm" onClick={() => toggle(ids, !all)}>
                {all ? 'Odznacz wszystkie' : `Zaznacz wszystkie (${ids.length})`}
              </button>
            </span>
            <div className="col" style={{ gap: 6 }}>
              {units.map((u) => {
                const uids = u.topics.map((t) => t.id);
                const uall = uids.every((id) => sel.includes(id));
                return (
                  <div key={u.unit} className="col" style={{ gap: 6 }}>
                    {named && (
                      <div className="unit-group-head">
                        <span>{unitLabel(u.unit)}</span>
                        {units.length > 1 && (
                          <button type="button" className="btn btn-sm" onClick={() => toggle(uids, !uall)}>
                            {uall ? 'Odznacz rozdział' : `Zaznacz rozdział (${uids.length})`}
                          </button>
                        )}
                      </div>
                    )}
                    {u.topics.map((t) => (
                      <label key={t.id} className="check-row">
                        <input type="checkbox" checked={sel.includes(t.id)} onChange={(e) => toggle([t.id], e.target.checked)} />
                        <span style={{ flex: 1 }}>{t.title}</span>
                        <LevelChip level={progress?.topics.get(t.id)?.level ?? 0} small />
                      </label>
                    ))}
                  </div>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </>
  );
}
