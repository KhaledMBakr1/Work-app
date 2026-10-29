import { CheckIcon, PinIcon, XIcon } from "@/components/Icons";
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
};

export const CHECKIN_COLUMNS =
  "id, worker_id, work_date, checked_in_at, latitude, longitude, accuracy_m, status, multiplier, note, place, client, paid";

type Props = { checkin: Checkin; workerName?: string };

export default function CheckinEditor({ checkin, workerName }: Props) {
  const map = mapLink(checkin.latitude, checkin.longitude);
  const time = new Date(checkin.checked_in_at).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <form action={saveCheckin.bind(null, "save")} className={`card checkin stack ${checkin.status}`}>
      <input type="hidden" name="id" value={checkin.id} />
      <div className="row between">
        <div>
          <strong className="checkin-title">{workerName ?? checkin.work_date}</strong>
          <p className="muted small">
            {workerName && `${checkin.work_date} · `}checked in at {time}
          </p>
        </div>
        <span className={`pill pill-${checkin.status}`}>{checkin.status}</span>
      </div>
      <p className="location">
        <PinIcon />
        {map ? (
          <a href={map} target="_blank" rel="noreferrer">
            See location on map
          </a>
        ) : (
          "No location"
        )}
        {checkin.accuracy_m != null && (
          <span className="muted"> · within {Math.round(checkin.accuracy_m)} m</span>
        )}
      </p>
      <div className="grid">
        <label>
          Counts as
          <select name="multiplier" defaultValue={String(Number(checkin.multiplier))}>
            <option value="1">1 day</option>
            <option value="1.5">1.5 days</option>
            <option value="2">2 days</option>
          </select>
        </label>
        <label>
          Where
          <input name="place" defaultValue={checkin.place ?? ""} placeholder="Site or address" />
        </label>
        <label>
          For whom
          <input name="client" defaultValue={checkin.client ?? ""} placeholder="Client" />
        </label>
      </div>
      <label>
        Note
        <textarea name="note" rows={2} defaultValue={checkin.note ?? ""} placeholder="What was done" />
      </label>
      <div className="row">
        {checkin.status !== "approved" && (
          <button formAction={saveCheckin.bind(null, "approve")} className="approve">
            <CheckIcon /> Approve
          </button>
        )}
        {checkin.status !== "rejected" && (
          <button formAction={saveCheckin.bind(null, "reject")} className="danger">
            <XIcon /> Reject
          </button>
        )}
        {checkin.status !== "pending" && (
          <button formAction={saveCheckin.bind(null, "save")} className="secondary">
            Save changes
          </button>
        )}
      </div>
    </form>
  );
}
