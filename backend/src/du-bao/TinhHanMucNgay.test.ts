import { describe, expect, it } from 'vitest';

import { tinhHanMucNgay } from './TinhHanMucNgay';

const HOM_NAY = '2026-10-10';

// The example of tai-lieu/Evenwise.md, section 4.1: 1.400.000 in wallets, 300.000 group debt due today,
// ChatGPT 132.000 on the 25th, money from home on 01/11, Lan and Minh owe 400.000.
const VI_DU = [
  { ngay: HOM_NAY, soTien: 300000, loai: 'chi' as const },
  { ngay: '2026-10-25', soTien: 132000, loai: 'chi' as const },
  { ngay: '2026-11-01', soTien: 4000000, loai: 'thu' as const },
];

describe('tinhHanMucNgay', () => {
  it('matches the document: 968.000 usable over 22 days → 44.000 per day', () => {
    const ketQua = tinhHanMucNgay(1400000, VI_DU, 400000, null, HOM_NAY);
    expect(ketQua.ngayCoTien).toBe('2026-11-01');
    expect(ketQua.soNgayConLai).toBe(22);
    expect(ketQua.tienDungDuoc).toBe(968000);
    expect(ketQua.coTheTieuMoiNgay).toBe(44000);
    expect(ketQua.moiNgayDuocTieu).toBe(44000);
    expect(ketQua.gioiHanBoi).toBe('tien_that');
    expect(ketQua.themNeuDuocTra).toBe(18181);
  });

  it('uses the budget when it is smaller: 18.000 < 44.000', () => {
    const ketQua = tinhHanMucNgay(1400000, VI_DU, 0, 18000, HOM_NAY);
    expect(ketQua.moiNgayDuocTieu).toBe(18000);
    expect(ketQua.gioiHanBoi).toBe('ngan_sach');
  });

  it('keeps the real-money limit when the budget is looser', () => {
    const ketQua = tinhHanMucNgay(1400000, VI_DU, 0, 100000, HOM_NAY);
    expect(ketQua.moiNgayDuocTieu).toBe(44000);
    expect(ketQua.gioiHanBoi).toBe('tien_that');
  });

  it('ignores payments after the next income and uses the end of the month when no income is planned', () => {
    const ketQua = tinhHanMucNgay(620000, [{ ngay: '2026-11-03', soTien: 999999, loai: 'chi' }], 0, null, HOM_NAY);
    expect(ketQua.ngayCoTien).toBe('2026-11-01');
    expect(ketQua.moiNgayDuocTieu).toBe(28181);
  });

  it('never goes below 0 when payments are larger than the money', () => {
    const ketQua = tinhHanMucNgay(100000, [{ ngay: HOM_NAY, soTien: 500000, loai: 'chi' }], 0, null, HOM_NAY);
    expect(ketQua.tienDungDuoc).toBe(-400000);
    expect(ketQua.moiNgayDuocTieu).toBe(0);
  });
});
