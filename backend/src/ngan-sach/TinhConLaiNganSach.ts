import { daysBetween, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from '../dates/dateKey';

export type KyNganSach = {
  tuNgay: string;
  denNgay: string;
};

// The current period of a budget: Monday–Sunday for a weekly one, day 1 → last day for a monthly one.
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
  // What the user can still spend per day to stay inside this budget (never negative).
  moiNgay: number;
};

// "Muốn tiêu" side of tai-lieu/Evenwise.md, section 4.1 (b):
// left = budget − spent so far in the period; per day = left ÷ days left in the period (today included).
export function tinhConLaiNganSach(soTien: number, daTieu: number, denNgay: string, homNay: string): ConLaiNganSach {
  const conLai = soTien - daTieu;
  const soNgayConLai = daysBetween(homNay, denNgay) + 1;
  const moiNgay = conLai > 0 ? Math.floor(conLai / soNgayConLai) : 0;
  return { daTieu, conLai, soNgayConLai, moiNgay };
}
