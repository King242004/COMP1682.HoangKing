import { addDays, daysBetween, endOfMonth } from '../dates/dateKey';

// One future money movement the forecast knows about (personal upcoming item, group debt, group plan…).
export type KhoanTuongLai = {
  ngay: string;
  soTien: number;
  loai: 'thu' | 'chi';
};

export type HanMucNgay = {
  // First day new money arrives; the limit covers the days before it.
  ngayCoTien: string;
  soNgayConLai: number;
  tienDungDuoc: number;
  coTheTieuMoiNgay: number;
  muonTieuMoiNgay: number | null;
  moiNgayDuocTieu: number;
  gioiHanBoi: 'tien_that' | 'ngan_sach';
  // Extra per day if the people who owe me actually pay (shown, never counted).
  themNeuDuocTra: number;
};

// ⭐ "Mỗi ngày được tiêu" (tai-lieu/Evenwise.md, section 4.1): the smaller of
// (a) real money: (wallets − payments due before the next income) ÷ days until that income,
// (b) budget:     the per-day amount left in the user's total budget (if they set one).
export function tinhHanMucNgay(
  soDuVi: number,
  cacKhoan: KhoanTuongLai[],
  sapDuocTra: number,
  muonTieuMoiNgay: number | null,
  homNay: string,
): HanMucNgay {
  // Next income after today; without one, the limit runs to the end of this month.
  const cacNgayCoTien = cacKhoan
    .filter((khoan) => khoan.loai === 'thu' && khoan.ngay > homNay)
    .map((khoan) => khoan.ngay)
    .sort();
  const ngayCoTien = cacNgayCoTien[0] ?? addDays(endOfMonth(homNay), 1);
  const soNgayConLai = daysBetween(homNay, ngayCoTien);

  const phaiChiTruocKhiCoTien = cacKhoan
    .filter((khoan) => khoan.loai === 'chi' && khoan.ngay >= homNay && khoan.ngay < ngayCoTien)
    .reduce((tong, khoan) => tong + khoan.soTien, 0);

  const tienDungDuoc = soDuVi - phaiChiTruocKhiCoTien;
  const coTheTieuMoiNgay = Math.max(0, Math.floor(tienDungDuoc / soNgayConLai));
  const themNeuDuocTra = Math.floor(sapDuocTra / soNgayConLai);

  const nganSachNhoHon = muonTieuMoiNgay !== null && muonTieuMoiNgay < coTheTieuMoiNgay;

  return {
    ngayCoTien,
    soNgayConLai,
    tienDungDuoc,
    coTheTieuMoiNgay,
    muonTieuMoiNgay,
    moiNgayDuocTieu: nganSachNhoHon ? (muonTieuMoiNgay as number) : coTheTieuMoiNgay,
    gioiHanBoi: nganSachNhoHon ? 'ngan_sach' : 'tien_that',
    themNeuDuocTra,
  };
}
