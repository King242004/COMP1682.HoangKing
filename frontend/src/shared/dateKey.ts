// Ngày đi giữa app và backend dưới dạng chuỗi 'YYYY-MM-DD' ("date key"),
// luôn theo giờ trên điện thoại, nên "hôm nay" là đúng hôm nay của người dùng.

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function toKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function todayKey(): string {
  return toKey(new Date());
}

// addDays('2026-10-31', 1) → '2026-11-01'
export function addDays(dateKey: string, days: number): string {
  const date = toDate(dateKey);
  date.setDate(date.getDate() + days);
  return toKey(date);
}

// addMonths('2026-10-15', 1) → '2026-11-01' (luôn là ngày 1, để tháng ngắn không bị nhảy cóc)
export function addMonths(dateKey: string, months: number): string {
  const date = toDate(dateKey);
  return toKey(new Date(date.getFullYear(), date.getMonth() + months, 1));
}

export function startOfMonth(dateKey: string): string {
  const date = toDate(dateKey);
  return toKey(new Date(date.getFullYear(), date.getMonth(), 1));
}

export function endOfMonth(dateKey: string): string {
  const date = toDate(dateKey);
  return toKey(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

// Tuần bắt đầu từ thứ Hai, giống lịch Việt Nam.
export function startOfWeek(dateKey: string): string {
  const date = toDate(dateKey);
  const daysSinceMonday = (date.getDay() + 6) % 7;
  return addDays(dateKey, -daysSinceMonday);
}

export function endOfWeek(dateKey: string): string {
  return addDays(startOfWeek(dateKey), 6);
}

// 0 = thứ Hai … 6 = Chủ nhật
export function weekdayIndex(dateKey: string): number {
  return (toDate(dateKey).getDay() + 6) % 7;
}

// '2026-10-10' → '10/10/2026'
export function formatDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split('-');
  return `${day}/${month}/${year}`;
}

// '2026-10-10' → 'Tháng 10/2026'
export function formatMonth(dateKey: string): string {
  const [year, month] = dateKey.split('-');
  return `Tháng ${Number(month)}/${year}`;
}
