import { describe, expect, it } from 'vitest';

import { tinhQuyetToan } from './TinhQuyetToan';

// Members used in the examples.
const BAN = 1;
const LAN = 2;
const MINH = 3;

describe('tinhQuyetToan', () => {
  it('matches the example in the document: Minh → Bạn 230k, Lan → Bạn 140k', () => {
    const chuyen = tinhQuyetToan(
      new Map([
        [BAN, 370000],
        [LAN, -140000],
        [MINH, -230000],
      ]),
    );
    expect(chuyen).toEqual([
      { nguoiTraId: MINH, nguoiNhanId: BAN, soTien: 230000 },
      { nguoiTraId: LAN, nguoiNhanId: BAN, soTien: 140000 },
    ]);
  });

  it('settles everyone with at most n − 1 transfers', () => {
    const soDu = new Map([
      [1, 500],
      [2, 300],
      [3, -100],
      [4, -350],
      [5, -350],
    ]);
    const chuyen = tinhQuyetToan(soDu);
    expect(chuyen.length).toBeLessThanOrEqual(4);

    const sauKhiChuyen = new Map(soDu);
    for (const lan of chuyen) {
      sauKhiChuyen.set(lan.nguoiTraId, (sauKhiChuyen.get(lan.nguoiTraId) ?? 0) + lan.soTien);
      sauKhiChuyen.set(lan.nguoiNhanId, (sauKhiChuyen.get(lan.nguoiNhanId) ?? 0) - lan.soTien);
    }
    expect([...sauKhiChuyen.values()].every((tien) => tien === 0)).toBe(true);
  });

  it('returns nothing when nobody owes anything', () => {
    expect(tinhQuyetToan(new Map([[BAN, 0], [LAN, 0]]))).toEqual([]);
  });
});
