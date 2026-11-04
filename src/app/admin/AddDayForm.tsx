import { PlusIcon } from "@/components/Icons";
import type { Dict } from "@/lib/i18n";
import { localToday } from "@/lib/time";
import { addDay } from "./actions";

type Props = {
  t: Dict;
  // Pick from these workers, or add for this one worker only.
  workers?: { id: string; name: string }[];
  workerId?: string;
  open?: boolean;
};

const ERRORS = ["pickWorker", "pickDate", "futureDate", "startNeeded", "dayExists", "notYourWorker"];

// Keeps the form open when saving it failed.
export function isAddDayError(error?: string): boolean {
  return !!error && ERRORS.includes(error);
}

// Lets the admin add a work day for a worker who didn't check in.
export default function AddDayForm({ t, workers, workerId, open }: Props) {
  const today = localToday();
  return (
    <details className="card invite add-day" open={open}>
      <summary>
        <h2>
          <PlusIcon /> {t.addDay}
        </h2>
      </summary>
      <form action={addDay} className="stack">
        <p className="muted small">{t.addDayHint}</p>
        <div className="grid">
          {workerId ? (
            <input type="hidden" name="worker_id" value={workerId} />
          ) : (
            <label>
              {t.worker}
              <select name="worker_id" required defaultValue="">
                <option value="" disabled>
                  {t.pickWorker}
                </option>
                {(workers ?? []).map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            {t.date}
            <input type="date" name="work_date" required defaultValue={today} max={today} />
          </label>
          <label>
            {t.startTime} <span className="muted small">{t.optional}</span>
            <input type="time" name="start_time" />
          </label>
          <label>
            {t.endTime} <span className="muted small">{t.optional}</span>
            <input type="time" name="end_time" />
          </label>
        </div>
        <div className="grid">
          <label>
            {t.countsAs}
            <select name="multiplier" defaultValue="1">
              <option value="0.5">{t.halfDay}</option>
            <option value="1">{t.oneDay}</option>
              <option value="1.5">{t.oneHalfDays}</option>
              <option value="2">{t.twoDays}</option>
            </select>
          </label>
          <label>
            {t.where}
            <input name="place" placeholder={t.sitePlaceholder} />
          </label>
          <label>
            {t.forWhom}
            <input name="client" placeholder={t.clientPlaceholder} />
          </label>
        </div>
        <label>
          {t.note}
          <textarea name="note" rows={2} placeholder={t.notePlaceholder} />
        </label>
        <div className="row">
          <button className="approve">
            <PlusIcon /> {t.addDayButton}
          </button>
        </div>
      </form>
    </details>
  );
}
