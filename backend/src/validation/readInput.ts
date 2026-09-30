import { HttpError } from '../errors/HttpError';

// Small helpers used by Routes to read values from request bodies and query strings.
// Each one returns a clean value or throws a 400 error with a message the app can show.

export function readText(value: unknown, fieldLabel: string): string {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) {
    throw new HttpError(400, `Vui lòng nhập ${fieldLabel}`);
  }
  return text;
}

export function readOptionalText(value: unknown): string | null {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || null;
}

// Money and ids arrive as JSON numbers; only whole numbers are accepted.
export function readPositiveInteger(value: unknown, fieldLabel: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new HttpError(400, `${fieldLabel} phải là số nguyên lớn hơn 0`);
  }
  return value;
}

export function readNonNegativeInteger(value: unknown, fieldLabel: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new HttpError(400, `${fieldLabel} phải là số nguyên không âm`);
  }
  return value;
}

// Ids in the URL (/vi/12) arrive as text.
export function readIdFromUrl(value: string | undefined): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, 'Mã không hợp lệ');
  }
  return id;
}

// Accepts only a real calendar date written as YYYY-MM-DD (2026-02-30 is rejected).
export function readDate(value: unknown, fieldLabel: string): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new HttpError(400, `${fieldLabel} phải có dạng YYYY-MM-DD`);
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const isRealDate = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;

  if (!isRealDate) {
    throw new HttpError(400, `${fieldLabel} không phải ngày có thật`);
  }
  return value;
}

export function readThuOrChi(value: unknown): 'thu' | 'chi' {
  if (value !== 'thu' && value !== 'chi') {
    throw new HttpError(400, 'Loại phải là "thu" hoặc "chi"');
  }
  return value;
}
