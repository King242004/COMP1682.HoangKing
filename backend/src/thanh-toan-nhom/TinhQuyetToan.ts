export type LanChuyen = {
  nguoiTraId: number;
  nguoiNhanId: number;
  soTien: number;
};

// Ai phải trả ai để mọi số dư về 0 (tai-lieu/Evenwise.md, mục 4.6).
// Quy tắc tham lam: người nợ nhiều nhất trả cho người được nhận nhiều nhất,
// trả nhiều nhất có thể; lặp lại. Mỗi bước làm xong hẳn ít nhất một người,
// nên nhóm n người cần tối đa n − 1 lần chuyển.
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

    // Không còn ai nợ (hoặc không còn ai được nhận): xong.
    if (nguoiNoNhieuNhat === null || nguoiDuocNhanNhieuNhat === null) {
      return danhSachChuyen;
    }

    const soTienNo = -(conLai.get(nguoiNoNhieuNhat) ?? 0);
    const duocNhan = conLai.get(nguoiDuocNhanNhieuNhat) ?? 0;
    const soTien = Math.min(soTienNo, duocNhan);

    danhSachChuyen.push({ nguoiTraId: nguoiNoNhieuNhat, nguoiNhanId: nguoiDuocNhanNhieuNhat, soTien });
    conLai.set(nguoiNoNhieuNhat, -soTienNo + soTien);
    conLai.set(nguoiDuocNhanNhieuNhat, duocNhan - soTien);
  }
}
