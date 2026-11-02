import { fill, TIME_ZONE } from "./i18n";

export function formatTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: TIME_ZONE,
  });
}

// "8 h 25 min" between check-in and check-out, in the given format.
export function formatDuration(fromIso: string, toIso: string, format: string): string {
  const minutes = Math.max(0, Math.round((Date.parse(toIso) - Date.parse(fromIso)) / 60000));
  return fill(format, { h: Math.floor(minutes / 60), m: String(minutes % 60).padStart(2, "0") });
}

// Today's date in the business's time zone, as YYYY-MM-DD.
export function localToday(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TIME_ZONE });
}

// The UTC instant for a wall-clock date and time in the business's time zone.
// date is YYYY-MM-DD, time is HH:MM.
export function zonedToIso(date: string, time: string): string {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const asUtc = Date.UTC(y, mo - 1, d, h, mi);
  // Work out the zone's offset at that moment, then correct once more in case
  // the first guess fell on the other side of a daylight-saving change.
  let guess = asUtc;
  for (let i = 0; i < 2; i++) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(new Date(guess));
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    const shown = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
    guess += asUtc - shown;
  }
  return new Date(guess).toISOString();
}

// Days an admin adds without times store the same moment for in and out.
export function hasTimes(checkedInAt: string, checkedOutAt: string | null): boolean {
  return checkedOutAt == null || Date.parse(checkedInAt) !== Date.parse(checkedOutAt);
}
