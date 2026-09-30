import { describe, expect, it } from 'vitest';

import { chiaDeu, tinhConLai } from './ChiaHoaDon';

describe('chiaDeu', () => {
  it('splits an amount that divides evenly', () => {
    expect(chiaDeu(600000, [1, 2, 3])).toEqual([
      { nguoiDungId: 1, soTien: 200000 },
      { nguoiDungId: 2, soTien: 200000 },
      { nguoiDungId: 3, soTien: 200000 },
    ]);
  });

  it('gives the leftover dong to the first people in the list', () => {
    expect(chiaDeu(100000, [7, 8, 9]).map((phan) => phan.soTien)).toEqual([33334, 33333, 33333]);
    expect(chiaDeu(100, [1, 2, 3, 4, 5, 6]).map((phan) => phan.soTien)).toEqual([17, 17, 17, 17, 16, 16]);
  });

  it('always adds up to exactly the bill', () => {
    for (const soTien of [1, 7, 99999, 786319, 1000001]) {
      for (let soNguoi = 1; soNguoi <= 7; soNguoi += 1) {
        const ids = Array.from({ length: soNguoi }, (_, index) => index + 1);
        const tong = chiaDeu(soTien, ids).reduce((sum, phan) => sum + phan.soTien, 0);
        expect(tong).toBe(soTien);
      }
    }
  });
});

describe('tinhConLai', () => {
  it('shows how much is still missing', () => {
    expect(tinhConLai(786319, [{ nguoiDungId: 1, soTien: 100000 }])).toBe(686319);
  });

  it('is 0 when the split is complete and negative when it is too much', () => {
    expect(tinhConLai(300, [{ nguoiDungId: 1, soTien: 100 }, { nguoiDungId: 2, soTien: 200 }])).toBe(0);
    expect(tinhConLai(300, [{ nguoiDungId: 1, soTien: 400 }])).toBe(-100);
  });
});
