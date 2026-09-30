import { addDays, dayOfMonth } from '../dates/dateKey';

export type QuyTacLapLai = {
  ngayBatDau: string;
  lapLai: 'khong' | 'tuan' | 'thang';
  ngayKetThuc: string | null;
};

// Turns a rule like "the 5th of every month from 2026-09-05" into the real dates inside [tuNgay, denNgay].
// - 'khong': only ngayBatDau.
// - 'tuan':  every 7 days from ngayBatDau.
// - 'thang': the same day of every month; in a shorter month it moves to the last day
//            (rent on the 31st falls on Feb 28), unlike the iCalendar rule which would skip that month.
export function trienKhaiKhoanLapLai(quyTac: QuyTacLapLai, tuNgay: string, denNgay: string): string[] {
  const batDau = quyTac.ngayBatDau > tuNgay ? quyTac.ngayBatDau : tuNgay;
  const ketThuc = quyTac.ngayKetThuc && quyTac.ngayKetThuc < denNgay ? quyTac.ngayKetThuc : denNgay;
  if (batDau > ketThuc) {
    return [];
  }

  const cacNgay: string[] = [];

  if (quyTac.lapLai === 'khong') {
    if (quyTac.ngayBatDau >= batDau && quyTac.ngayBatDau <= ketThuc) {
      cacNgay.push(quyTac.ngayBatDau);
    }
    return cacNgay;
  }

  if (quyTac.lapLai === 'tuan') {
    for (let ngay = quyTac.ngayBatDau; ngay <= ketThuc; ngay = addDays(ngay, 7)) {
      if (ngay >= batDau) {
        cacNgay.push(ngay);
      }
    }
    return cacNgay;
  }

  // Monthly: walk month by month, always aiming at the original day of the month.
  const [namDau, thangDau, ngayTrongThang] = quyTac.ngayBatDau.split('-').map(Number);
  let nam = namDau;
  let thang = thangDau;
  while (true) {
    const ngay = dayOfMonth(nam, thang, ngayTrongThang);
    if (ngay > ketThuc) {
      return cacNgay;
    }
    if (ngay >= batDau) {
      cacNgay.push(ngay);
    }
    thang += 1;
    if (thang > 12) {
      thang = 1;
      nam += 1;
    }
  }
}
