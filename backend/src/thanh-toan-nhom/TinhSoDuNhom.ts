export type HoaDonDeTinh = {
  nguoiTraId: number;
  soTien: number;
  phanChia: { nguoiDungId: number; soTien: number }[];
};

export type ThanhToanDeTinh = {
  nguoiTraId: number;
  nguoiNhanId: number;
  soTien: number;
};

// Số dư nhóm của từng thành viên (tai-lieu/Evenwise.md, mục 4.3):
//   + tiền đã trả cho hóa đơn − phần phải chịu trong hóa đơn
//   + tiền trả nợ đã gửi      − tiền trả nợ đã nhận (chỉ tính lần trả đã xác nhận).
// Dương = nhóm nợ người đó. Âm = người đó nợ nhóm. Tổng mọi số dư luôn bằng 0.
export function tinhSoDuNhom(
  thanhVienIds: number[],
  danhSachHoaDon: HoaDonDeTinh[],
  thanhToanDaNhan: ThanhToanDeTinh[],
): Map<number, number> {
  const soDu = new Map<number, number>();
  for (const id of thanhVienIds) {
    soDu.set(id, 0);
  }

  function cong(nguoiDungId: number, soTien: number) {
    soDu.set(nguoiDungId, (soDu.get(nguoiDungId) ?? 0) + soTien);
  }

  for (const hoaDon of danhSachHoaDon) {
    cong(hoaDon.nguoiTraId, hoaDon.soTien);
    for (const phan of hoaDon.phanChia) {
      cong(phan.nguoiDungId, -phan.soTien);
    }
  }

  for (const thanhToan of thanhToanDaNhan) {
    cong(thanhToan.nguoiTraId, thanhToan.soTien);
    cong(thanhToan.nguoiNhanId, -thanhToan.soTien);
  }

  return soDu;
}
