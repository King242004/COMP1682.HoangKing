import { daysBetween, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from '../dates/dateKey';

export type KyNganSach = {
  tuNgay: string;
  denNgay: string;
};

// Kỳ hiện tại của một ngân sách: thứ Hai → Chủ nhật với ngân sách tuần, ngày 1 → cuối tháng với ngân sách tháng.
export function kyHienTai(chuKy: 'tuan' | 'thang', homNay: string): KyNganSach {
  if (chuKy === 'tuan') {
    return { tuNgay: startOfWeek(homNay), denNgay: endOfWeek(homNay) };
  }
  return { tuNgay: startOfMonth(homNay), denNgay: endOfMonth(homNay) };
}

export type ConLaiNganSach = {
  daTieu: number;
  conLai: number;
  soNgayConLai: number;
  // Mỗi ngày người dùng còn được tiêu bao nhiêu để không vượt ngân sách này (không bao giờ âm).
  moiNgay: number;
};

// Phía "Muốn tiêu" ở tai-lieu/Evenwise.md, mục 4.1 (b):
// còn lại = ngân sách − đã tiêu từ đầu kỳ; mỗi ngày = còn lại ÷ số ngày còn lại của kỳ (tính cả hôm nay).
export function tinhConLaiNganSach(soTien: number, daTieu: number, denNgay: string, homNay: string): ConLaiNganSach {
  const conLai = soTien - daTieu;
  const soNgayConLai = daysBetween(homNay, denNgay) + 1;
  const moiNgay = conLai > 0 ? Math.floor(conLai / soNgayConLai) : 0;
  return { daTieu, conLai, soNgayConLai, moiNgay };
}
