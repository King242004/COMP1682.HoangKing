import { daysBetween } from '../dates/dateKey';

// How many days before a promised payment the app starts reminding (tai-lieu/Evenwise.md, section 4.4).
export const SO_NGAY_NHAC_TRUOC = 2;

export type LoaiHenTra = 'chua_toi' | 'sap_toi' | 'qua_hen';

// 'sap_toi' (yellow reminder) when the promised day is at most 2 days away, including today;
// 'qua_hen' (red reminder) once the day has passed; otherwise 'chua_toi' (no reminder).
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
