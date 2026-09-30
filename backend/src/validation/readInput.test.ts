import { describe, expect, it } from 'vitest';

import { readDate, readPositiveInteger, readThuOrChi } from './readInput';

describe('readDate', () => {
  it('accepts a real date', () => {
    expect(readDate('2026-10-10', 'Ngày')).toBe('2026-10-10');
    expect(readDate('2028-02-29', 'Ngày')).toBe('2028-02-29');
  });

  it('rejects a date that does not exist', () => {
    expect(() => readDate('2026-02-30', 'Ngày')).toThrow('không phải ngày có thật');
    expect(() => readDate('2026-13-01', 'Ngày')).toThrow('không phải ngày có thật');
  });

  it('rejects other formats', () => {
    expect(() => readDate('10/10/2026', 'Ngày')).toThrow('YYYY-MM-DD');
    expect(() => readDate(20261010, 'Ngày')).toThrow('YYYY-MM-DD');
  });
});

describe('readPositiveInteger', () => {
  it('accepts whole numbers above 0', () => {
    expect(readPositiveInteger(35000, 'Số tiền')).toBe(35000);
  });

  it('rejects 0, negatives, decimals and text', () => {
    expect(() => readPositiveInteger(0, 'Số tiền')).toThrow();
    expect(() => readPositiveInteger(-5, 'Số tiền')).toThrow();
    expect(() => readPositiveInteger(1.5, 'Số tiền')).toThrow();
    expect(() => readPositiveInteger('35000', 'Số tiền')).toThrow();
  });
});

describe('readThuOrChi', () => {
  it('accepts only thu or chi', () => {
    expect(readThuOrChi('thu')).toBe('thu');
    expect(() => readThuOrChi('khac')).toThrow();
  });
});
