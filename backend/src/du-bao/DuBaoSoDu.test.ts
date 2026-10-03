import { describe, expect, it } from 'vitest';

import { duBaoSoDu } from './DuBaoSoDu';

describe('duBaoSoDu', () => {
  it('subtracts the usual spending from tomorrow and applies each day’s items', () => {
    const ketQua = duBaoSoDu(
      1000,
      100,
      [
        { ngay: '2026-10-11', soTien: 300, loai: 'chi' },
        { ngay: '2026-10-12', soTien: 50, loai: 'thu' },
      ],
      '2026-10-10',
      3,
    );
    expect(ketQua.theoNgay).toEqual([
      { ngay: '2026-10-10', soDu: 1000 },
      { ngay: '2026-10-11', soDu: 600 },
      { ngay: '2026-10-12', soDu: 550 },
    ]);
    expect(ketQua.ngayHetTien).toBeNull();
  });

  it('finds the first day the money runs out', () => {
    // Đang có 500, mỗi ngày tiêu 100, tiền nhà 200 vào ngày 13 → 500, 400, 300, 0 (chưa âm), ngày 14 là −100.
    const ketQua = duBaoSoDu(500, 100, [{ ngay: '2026-10-13', soTien: 200, loai: 'chi' }], '2026-10-10', 10);
    expect(ketQua.ngayHetTien).toBe('2026-10-14');
  });
});
