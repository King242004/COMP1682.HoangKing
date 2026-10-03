import { daysBetween } from '../dates/dateKey';

// Trước ngày hẹn trả bao nhiêu ngày thì app bắt đầu nhắc (tai-lieu/Evenwise.md, mục 4.4).
export const SO_NGAY_NHAC_TRUOC = 2;

export type LoaiHenTra = 'chua_toi' | 'sap_toi' | 'qua_hen';

// 'sap_toi' (nhắc vàng) khi còn tối đa 2 ngày tới ngày hẹn, tính cả hôm nay;
// 'qua_hen' (nhắc đỏ) khi đã qua ngày hẹn; còn lại là 'chua_toi' (không nhắc).
export function xepLoaiHenTra(ngayHen: string, homNay: string): { loai: LoaiHenTra; soNgay: number } {
  const soNgay = daysBetween(homNay, ngayHen);
  if (soNgay < 0) {
    return { loai: 'qua_hen', soNgay: -soNgay };
  }
  if (soNgay <= SO_NGAY_NHAC_TRUOC) {
    return { loai: 'sap_toi', soNgay };
  }
  return { loai: 'chua_toi', soNgay };
}
