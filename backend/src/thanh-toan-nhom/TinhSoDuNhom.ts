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

// Group balance of every member (tai-lieu/Evenwise.md, section 4.3):
//   + what they paid for bills − their share of bills
//   + debt payments they sent   − debt payments they received (confirmed payments only).
// Positive = the group owes them. Negative = they owe the group. All balances add up to 0.
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
