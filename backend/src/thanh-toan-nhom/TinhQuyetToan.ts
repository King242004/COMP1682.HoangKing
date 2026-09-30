export type LanChuyen = {
  nguoiTraId: number;
  nguoiNhanId: number;
  soTien: number;
};

// Who should pay whom so every balance becomes 0 (tai-lieu/Evenwise.md, section 4.6).
// Greedy rule: the person who owes the most pays the person who is owed the most,
// as much as possible; repeat. Each step settles at least one person fully,
// so a group of n people needs at most n − 1 transfers.
export function tinhQuyetToan(soDu: Map<number, number>): LanChuyen[] {
  const conLai = new Map(soDu);
  const danhSachChuyen: LanChuyen[] = [];

  while (true) {
    let nguoiNoNhieuNhat: number | null = null;
    let nguoiDuocNhanNhieuNhat: number | null = null;

    for (const [nguoiDungId, tien] of conLai) {
      if (tien < 0 && (nguoiNoNhieuNhat === null || tien < (conLai.get(nguoiNoNhieuNhat) ?? 0))) {
        nguoiNoNhieuNhat = nguoiDungId;
      }
      if (tien > 0 && (nguoiDuocNhanNhieuNhat === null || tien > (conLai.get(nguoiDuocNhanNhieuNhat) ?? 0))) {
        nguoiDuocNhanNhieuNhat = nguoiDungId;
      }
    }

    // Nobody owes anything any more (or nobody is owed): done.
    if (nguoiNoNhieuNhat === null || nguoiDuocNhanNhieuNhat === null) {
      return danhSachChuyen;
    }

    const no = -(conLai.get(nguoiNoNhieuNhat) ?? 0);
    const duocNhan = conLai.get(nguoiDuocNhanNhieuNhat) ?? 0;
    const soTien = Math.min(no, duocNhan);

    danhSachChuyen.push({ nguoiTraId: nguoiNoNhieuNhat, nguoiNhanId: nguoiDuocNhanNhieuNhat, soTien });
    conLai.set(nguoiNoNhieuNhat, -no + soTien);
    conLai.set(nguoiDuocNhanNhieuNhat, duocNhan - soTien);
  }
}
