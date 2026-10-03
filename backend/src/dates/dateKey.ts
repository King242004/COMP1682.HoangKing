// Trong backend, ngày luôn là chuỗi 'YYYY-MM-DD' (gọi là "date key").
// Chuỗi dạng này sắp xếp giống ngày, nên '2026-10-09' < '2026-10-10' so sánh bình thường là được.
// Mọi phép tính làm theo giờ UTC để múi giờ của server không bao giờ làm lệch ngày.

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

// Số ngày từ `from` tới `to` (to − from). daysBetween('2026-10-10', '2026-11-01') = 22.
export function daysBetween(from: string, to: string): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((toUtcDate(to).getTime() - toUtcDate(from).getTime()) / MS_PER_DAY);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

// Ngày thứ N của một tháng; tháng nào ngắn hơn thì lùi về ngày cuối tháng.
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

// Tuần bắt đầu từ thứ Hai.
export function startOfWeek(dateKey: string): string {
  const daysSinceMonday = (toUtcDate(dateKey).getUTCDay() + 6) % 7;
  return addDays(dateKey, -daysSinceMonday);
}

export function endOfWeek(dateKey: string): string {
  return addDays(startOfWeek(dateKey), 6);
}

// Hôm nay theo giờ Việt Nam (UTC+7), dù server chạy ở múi giờ nào.
export function todayInVietnam(): string {
  const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000;
  return toKey(new Date(Date.now() + VIETNAM_OFFSET_MS));
}
