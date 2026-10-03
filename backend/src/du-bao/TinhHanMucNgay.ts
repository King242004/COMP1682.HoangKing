import { addDays, daysBetween, endOfMonth } from '../dates/dateKey';

// Một khoản tiền tương lai mà dự báo biết (khoản sắp tới cá nhân, nợ nhóm, kế hoạch nhóm…).
export type KhoanTuongLai = {
  ngay: string;
  soTien: number;
  loai: 'thu' | 'chi';
};

export type HanMucNgay = {
  // Ngày đầu tiên có tiền mới vào; hạn mức tính cho những ngày trước ngày đó.
  ngayCoTien: string;
  soNgayConLai: number;
  tienDungDuoc: number;
  coTheTieuMoiNgay: number;
  muonTieuMoiNgay: number | null;
  moiNgayDuocTieu: number;
  gioiHanBoi: 'tien_that' | 'ngan_sach';
  // Mỗi ngày được thêm bao nhiêu nếu người nợ tôi trả thật (chỉ hiển thị, không cộng).
  themNeuDuocTra: number;
};

// ⭐ "Mỗi ngày được tiêu" (tai-lieu/Evenwise.md, mục 4.1): lấy số nhỏ hơn giữa
// (a) tiền thật: (số dư ví − khoản phải trả trước ngày có tiền) ÷ số ngày tới ngày có tiền,
// (b) ngân sách: số tiền mỗi ngày còn lại trong ngân sách tổng của người dùng (nếu có đặt).
export function tinhHanMucNgay(
  soDuVi: number,
  cacKhoan: KhoanTuongLai[],
  sapDuocTra: number,
  muonTieuMoiNgay: number | null,
  homNay: string,
): HanMucNgay {
  // Ngày có tiền tiếp theo sau hôm nay; không có thì hạn mức tính tới hết tháng này.
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
