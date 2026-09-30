import { describe, expect, it } from 'vitest';

import { noiNhomVaoCaNhan } from './NoiNhomVaoCaNhan';

const HOM_NAY = '2026-10-10';

describe('noiNhomVaoCaNhan', () => {
  it('turns a debt without a promise into a payment due today', () => {
    const ketQua = noiNhomVaoCaNhan(
      [{ nhomId: 1, tenNhom: 'Hội xem phim', soDuCuaToi: -300000, ngayHen: null }],
      [],
      HOM_NAY,
    );
    expect(ketQua.khoanPhaiTra).toEqual([
      { ngay: HOM_NAY, soTien: 300000, ten: 'Trả nợ nhóm Hội xem phim', loai: 'no_nhom' },
    ]);
    expect(ketQua.tongDangNo).toBe(300000);
    expect(ketQua.nhacNho).toEqual([]);
  });

  it('puts a promised debt on the promised day and reminds 2 days before', () => {
    const ketQua = noiNhomVaoCaNhan(
      [{ nhomId: 2, tenNhom: 'Phòng 302', soDuCuaToi: -300000, ngayHen: '2026-10-12' }],
      [],
      HOM_NAY,
    );
    expect(ketQua.khoanPhaiTra[0].ngay).toBe('2026-10-12');
    expect(ketQua.nhacNho).toEqual([{ mucDo: 'vang', noiDung: 'Còn 2 ngày tới hẹn trả nhóm Phòng 302', nhomId: 2 }]);
  });

  it('treats a missed promise as due today, with a red reminder', () => {
    const ketQua = noiNhomVaoCaNhan(
      [{ nhomId: 2, tenNhom: 'Phòng 302', soDuCuaToi: -50000, ngayHen: '2026-10-07' }],
      [],
      HOM_NAY,
    );
    expect(ketQua.khoanPhaiTra[0].ngay).toBe(HOM_NAY);
    expect(ketQua.nhacNho[0]).toEqual({ mucDo: 'do', noiDung: 'Đã quá hẹn 3 ngày trả nhóm Phòng 302', nhomId: 2 });
  });

  it('adds up money others owe me, without making it a payment', () => {
    const ketQua = noiNhomVaoCaNhan(
      [
        { nhomId: 1, tenNhom: 'A', soDuCuaToi: 400000, ngayHen: null },
        { nhomId: 2, tenNhom: 'B', soDuCuaToi: 0, ngayHen: null },
      ],
      [],
      HOM_NAY,
    );
    expect(ketQua.sapDuocTra).toBe(400000);
    expect(ketQua.khoanPhaiTra).toEqual([]);
  });

  it('counts only the part of a group plan not spent yet', () => {
    const ketQua = noiNhomVaoCaNhan(
      [],
      [
        { keHoachId: 1, ten: 'Đà Lạt', tenNhom: 'Bạn thân', ngay: '2026-11-15', soTienMoiNguoi: 1500000, daChiPhanCuaToi: 400000 },
        { keHoachId: 2, ten: 'Đã chi đủ', tenNhom: 'X', ngay: '2026-11-20', soTienMoiNguoi: 100000, daChiPhanCuaToi: 150000 },
        { keHoachId: 3, ten: 'Đã qua', tenNhom: 'X', ngay: '2026-10-01', soTienMoiNguoi: 100000, daChiPhanCuaToi: 0 },
      ],
      HOM_NAY,
    );
    expect(ketQua.khoanPhaiTra).toEqual([
      { ngay: '2026-11-15', soTien: 1100000, ten: 'Đà Lạt (Bạn thân)', loai: 'ke_hoach_nhom' },
    ]);
  });
});
