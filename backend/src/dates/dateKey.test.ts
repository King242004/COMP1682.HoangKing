import { describe, expect, it } from 'vitest';

import { addDays, dayOfMonth, daysBetween, endOfMonth, endOfWeek, startOfWeek } from './dateKey';

describe('dateKey', () => {
  it('adds days across months and years', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('counts days between two dates', () => {
    expect(daysBetween('2026-10-10', '2026-11-01')).toBe(22);
    expect(daysBetween('2026-10-10', '2026-10-10')).toBe(0);
  });

  it('moves day 31 back to the last day of a short month', () => {
    expect(dayOfMonth(2027, 2, 31)).toBe('2027-02-28');
    expect(dayOfMonth(2028, 2, 31)).toBe('2028-02-29');
    expect(dayOfMonth(2026, 4, 31)).toBe('2026-04-30');
    expect(endOfMonth('2026-02-10')).toBe('2026-02-28');
  });

  it('uses Monday–Sunday weeks', () => {
    // 2026-10-10 là thứ Bảy.
    expect(startOfWeek('2026-10-10')).toBe('2026-10-05');
    expect(endOfWeek('2026-10-10')).toBe('2026-10-11');
  });
});
