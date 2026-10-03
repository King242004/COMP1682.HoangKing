import { describe, expect, it } from 'vitest';

import { tinhSoDuNhom } from './TinhSoDuNhom';

// Các thành viên dùng trong ví dụ.
const BAN = 1;
const LAN = 2;
const MINH = 3;

describe('tinhSoDuNhom', () => {
  it('gives the payer the money others owe, and each person minus their share', () => {
    // Bạn trả 600.000 tiền ăn chia đều 3 người; Lan trả 90.000 tiền nước chia đều.
    const soDu = tinhSoDuNhom(
      [BAN, LAN, MINH],
      [
        { nguoiTraId: BAN, soTien: 600000, phanChia: [BAN, LAN, MINH].map((id) => ({ nguoiDungId: id, soTien: 200000 })) },
        { nguoiTraId: LAN, soTien: 90000, phanChia: [BAN, LAN, MINH].map((id) => ({ nguoiDungId: id, soTien: 30000 })) },
      ],
      [],
    );
    expect(soDu.get(BAN)).toBe(370000);
    expect(soDu.get(LAN)).toBe(-140000);
    expect(soDu.get(MINH)).toBe(-230000);
  });

  it('counts confirmed debt payments', () => {
    const soDu = tinhSoDuNhom(
      [BAN, LAN],
      [{ nguoiTraId: BAN, soTien: 400, phanChia: [{ nguoiDungId: BAN, soTien: 200 }, { nguoiDungId: LAN, soTien: 200 }] }],
      [{ nguoiTraId: LAN, nguoiNhanId: BAN, soTien: 200 }],
    );
    expect(soDu.get(BAN)).toBe(0);
    expect(soDu.get(LAN)).toBe(0);
  });

  it('always adds up to 0', () => {
    const soDu = tinhSoDuNhom(
      [BAN, LAN, MINH],
      [{ nguoiTraId: MINH, soTien: 786319, phanChia: [{ nguoiDungId: BAN, soTien: 786319 }] }],
      [{ nguoiTraId: BAN, nguoiNhanId: MINH, soTien: 100000 }],
    );
    const tong = [...soDu.values()].reduce((sum, tien) => sum + tien, 0);
    expect(tong).toBe(0);
  });
});
