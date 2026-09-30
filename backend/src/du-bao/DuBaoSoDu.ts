import { addDays } from '../dates/dateKey';
import type { KhoanTuongLai } from './TinhHanMucNgay';

export type SoDuTheoNgay = {
  ngay: string;
  soDu: number;
};

export type KetQuaDuBao = {
  theoNgay: SoDuTheoNgay[];
  // First day the balance goes below 0, or null if it never does in the forecast window.
  ngayHetTien: string | null;
};

// ⭐ Balance forecast (tai-lieu/Evenwise.md, section 4.2), day by day for `soNgay` days from today:
// yesterday's balance − usual daily spending (from tomorrow on) − payments that day + income that day.
// tocDoTieu = my average spending per day over the last 7 days.
export function duBaoSoDu(
  soDuHienTai: number,
  tocDoTieu: number,
  cacKhoan: KhoanTuongLai[],
  homNay: string,
  soNgay: number,
): KetQuaDuBao {
  const theoNgay: SoDuTheoNgay[] = [];
  let ngayHetTien: string | null = null;
  let soDu = soDuHienTai;

  for (let buoc = 0; buoc < soNgay; buoc += 1) {
    const ngay = addDays(homNay, buoc);

    // Today's own spending is already inside the wallet balance, so the usual rate starts tomorrow.
    if (buoc > 0) {
      soDu -= tocDoTieu;
    }
    for (const khoan of cacKhoan) {
      if (khoan.ngay === ngay) {
        soDu += khoan.loai === 'thu' ? khoan.soTien : -khoan.soTien;
      }
    }

    theoNgay.push({ ngay, soDu });
    if (soDu < 0 && ngayHetTien === null) {
      ngayHetTien = ngay;
    }
  }

  return { theoNgay, ngayHetTien };
}
