export type MonthKey = string; // "YYYY-MM"

export function monthKey(date: string): MonthKey {
  return date.slice(0, 7);
}

// The current month and the `count - 1` months before it, newest first.
export function recentMonths(count: number, now = new Date()): MonthKey[] {
  const months: MonthKey[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push(d.toISOString().slice(0, 7));
  }
  return months;
}

export function firstDayOf(month: MonthKey): string {
  return `${month}-01`;
}

export function monthLabel(month: MonthKey, locale: string, withYear = true): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString(locale, {
    month: "long",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function nextMonthStart(month: MonthKey): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
}

export function mapLink(latitude: number | null, longitude: number | null): string | null {
  if (latitude == null || longitude == null) return null;
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}
