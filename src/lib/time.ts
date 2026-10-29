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
