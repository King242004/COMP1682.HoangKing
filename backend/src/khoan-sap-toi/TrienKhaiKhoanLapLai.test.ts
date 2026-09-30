import { describe, expect, it } from 'vitest';

import { trienKhaiKhoanLapLai } from './TrienKhaiKhoanLapLai';

describe('trienKhaiKhoanLapLai', () => {
  it('lists a one-time item only when it falls inside the range', () => {
    const quyTac = { ngayBatDau: '2026-10-20', lapLai: 'khong' as const, ngayKetThuc: null };
    expect(trienKhaiKhoanLapLai(quyTac, '2026-10-01', '2026-10-31')).toEqual(['2026-10-20']);
    expect(trienKhaiKhoanLapLai(quyTac, '2026-11-01', '2026-11-30')).toEqual([]);
  });

  it('repeats monthly on the same day', () => {
    const tienNha = { ngayBatDau: '2026-09-05', lapLai: 'thang' as const, ngayKetThuc: null };
    expect(trienKhaiKhoanLapLai(tienNha, '2026-10-01', '2026-12-31')).toEqual(['2026-10-05', '2026-11-05', '2026-12-05']);
  });

  it('moves the 31st to the last day of shorter months instead of skipping them', () => {
    const quyTac = { ngayBatDau: '2026-12-31', lapLai: 'thang' as const, ngayKetThuc: null };
    expect(trienKhaiKhoanLapLai(quyTac, '2027-01-01', '2027-04-30')).toEqual([
      '2027-01-31',
      '2027-02-28',
      '2027-03-31',
      '2027-04-30',
    ]);
  });

  it('repeats weekly', () => {
    const quyTac = { ngayBatDau: '2026-10-02', lapLai: 'tuan' as const, ngayKetThuc: null };
    expect(trienKhaiKhoanLapLai(quyTac, '2026-10-10', '2026-10-31')).toEqual(['2026-10-16', '2026-10-23', '2026-10-30']);
  });

  it('stops at the end date', () => {
    const quyTac = { ngayBatDau: '2026-09-25', lapLai: 'thang' as const, ngayKetThuc: '2026-11-30' };
    expect(trienKhaiKhoanLapLai(quyTac, '2026-10-01', '2027-03-31')).toEqual(['2026-10-25', '2026-11-25']);
  });
});
