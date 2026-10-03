import { HttpError } from '../errors/HttpError';

// Các hàm nhỏ để Routes đọc giá trị từ body và query string của request.
// Mỗi hàm trả về giá trị sạch, hoặc ném lỗi 400 kèm thông báo app hiện được cho người dùng.

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

// Tiền và id gửi lên dạng số JSON; chỉ nhận số nguyên.
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

// Id nằm trong URL (/vi/12) gửi lên dạng chuỗi.
export function readIdFromUrl(value: string | undefined): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, 'Mã không hợp lệ');
  }
  return id;
}

// Chỉ nhận ngày có thật, viết dạng YYYY-MM-DD (2026-02-30 bị từ chối).
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
