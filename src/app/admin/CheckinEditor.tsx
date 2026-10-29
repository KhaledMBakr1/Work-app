import { CheckIcon, PinIcon, XIcon } from "@/components/Icons";
import { fill, type Dict } from "@/lib/i18n";
import { formatDuration, formatTime } from "@/lib/time";
import { mapLink } from "@/lib/months";
import { saveCheckin } from "./actions";

export type Checkin = {
  id: number;
  worker_id: string;
  work_date: string;
  checked_in_at: string;
  latitude: number | null;
  longitude: number | null;
  accuracy_m: number | null;
  status: "pending" | "approved" | "rejected";
  multiplier: number;
  note: string | null;
  place: string | null;
  client: string | null;
  paid: boolean;
  checked_out_at: string | null;
  out_latitude: number | null;
  out_longitude: number | null;
};

export const CHECKIN_COLUMNS =
  "id, worker_id, work_date, checked_in_at, latitude, longitude, accuracy_m, status, multiplier, note, place, client, paid, checked_out_at, out_latitude, out_longitude";

type Props = { checkin: Checkin; workerName?: string; t: Dict; locale: string };

export default function CheckinEditor({ checkin, workerName, t, locale }: Props) {
  const map = mapLink(checkin.latitude, checkin.longitude);
  const exitMap = mapLink(checkin.out_latitude, checkin.out_longitude);
  const timeIn = formatTime(checkin.checked_in_at, locale);
  const timeOut = checkin.checked_out_at ? formatTime(checkin.checked_out_at, locale) : t.notYet;
  const hours = checkin.checked_out_at
    ? formatDuration(checkin.checked_in_at, checkin.checked_out_at, t.hoursFormat)
    : t.notYet;

  return (
    <form action={saveCheckin.bind(null, "save")} className={`card checkin stack ${checkin.status}`}>
      <input type="hidden" name="id" value={checkin.id} />
      <div className="row between">
        <div>
          <strong className="checkin-title">{workerName ?? checkin.work_date}</strong>
          <p className="muted small">
            {workerName && `${checkin.work_date} · `}
            {t.inLabel} {timeIn} · {t.outLabel} {timeOut} · {t.hoursLabel} {hours}
          </p>
        </div>
        <span className={`pill pill-${checkin.status}`}>{t[`status_${checkin.status}`]}</span>
      </div>
      <p className="location">
        <PinIcon />
        {map ? (
          <a href={map} target="_blank" rel="noreferrer">
            {t.seeOnMap}
          </a>
        ) : (
          t.noLocation
        )}
        {checkin.accuracy_m != null && (
          <span className="muted"> · {fill(t.withinMeters, { n: Math.round(checkin.accuracy_m) })}</span>
        )}
        {exitMap && (
          <>
            <span className="muted"> · </span>
            <a href={exitMap} target="_blank" rel="noreferrer">
              {t.exitOnMap}
            </a>
          </>
        )}
      </p>
      <div className="grid">
        <label>
          {t.countsAs}
          <select name="multiplier" defaultValue={String(Number(checkin.multiplier))}>
            <option value="1">{t.oneDay}</option>
            <option value="1.5">{t.oneHalfDays}</option>
            <option value="2">{t.twoDays}</option>
          </select>
        </label>
        <label>
          {t.where}
          <input name="place" defaultValue={checkin.place ?? ""} placeholder={t.sitePlaceholder} />
        </label>
        <label>
          {t.forWhom}
          <input name="client" defaultValue={checkin.client ?? ""} placeholder={t.clientPlaceholder} />
        </label>
      </div>
      <label>
        {t.note}
        <textarea name="note" rows={2} defaultValue={checkin.note ?? ""} placeholder={t.notePlaceholder} />
      </label>
      <div className="row">
        {checkin.status !== "approved" && (
          <button formAction={saveCheckin.bind(null, "approve")} className="approve">
            <CheckIcon /> {t.approve}
          </button>
        )}
        {checkin.status !== "rejected" && (
          <button formAction={saveCheckin.bind(null, "reject")} className="danger">
            <XIcon /> {t.reject}
          </button>
        )}
        {checkin.status !== "pending" && (
          <button formAction={saveCheckin.bind(null, "save")} className="secondary">
            {t.saveChanges}
          </button>
        )}
      </div>
    </form>
  );
}
