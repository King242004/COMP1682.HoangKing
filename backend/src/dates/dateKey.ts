// Dates are 'YYYY-MM-DD' text everywhere in the backend ("date keys").
// Text in this format sorts like dates, so '2026-10-09' < '2026-10-10' works with normal comparison.
// All math is done in UTC so the server's time zone can never shift a day.

function toUtcDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(dateKey: string, days: number): string {
  const date = toUtcDate(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return toKey(date);
}

// Number of days from `from` to `to` (to − from). daysBetween('2026-10-10', '2026-11-01') = 22.
export function daysBetween(from: string, to: string): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((toUtcDate(to).getTime() - toUtcDate(from).getTime()) / MS_PER_DAY);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

// The given day of a month, moved back to the month's last day when the month is shorter.
// dayOfMonth(2027, 2, 31) → '2027-02-28'
export function dayOfMonth(year: number, month: number, day: number): string {
  const safeDay = Math.min(day, daysInMonth(year, month));
  return `${year}-${String(month).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
}

export function startOfMonth(dateKey: string): string {
  return `${dateKey.slice(0, 7)}-01`;
}

export function endOfMonth(dateKey: string): string {
  const [year, month] = dateKey.split('-').map(Number);
  return dayOfMonth(year, month, 31);
}

// Weeks start on Monday.
export function startOfWeek(dateKey: string): string {
  const daysSinceMonday = (toUtcDate(dateKey).getUTCDay() + 6) % 7;
  return addDays(dateKey, -daysSinceMonday);
}

export function endOfWeek(dateKey: string): string {
  return addDays(startOfWeek(dateKey), 6);
}

// Today in Vietnam (UTC+7), whatever time zone the server runs in.
export function todayInVietnam(): string {
  const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000;
  return toKey(new Date(Date.now() + VIETNAM_OFFSET_MS));
}
