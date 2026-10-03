import { addDays, dayOfMonth } from '../dates/dateKey';

export type QuyTacLapLai = {
  ngayBatDau: string;
  lapLai: 'khong' | 'tuan' | 'thang';
  ngayKetThuc: string | null;
};

// Biến quy tắc như "ngày 5 hằng tháng từ 2026-09-05" thành các ngày thật nằm trong [tuNgay, denNgay].
// - 'khong': chỉ có ngayBatDau.
// - 'tuan':  cứ 7 ngày một lần kể từ ngayBatDau.
// - 'thang': cùng ngày đó mỗi tháng; tháng nào ngắn hơn thì lùi về ngày cuối tháng
//            (tiền nhà ngày 31 rơi vào 28/2), khác với quy tắc iCalendar là bỏ qua tháng đó.
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

  // Hằng tháng: đi từng tháng một, luôn nhắm vào ngày gốc trong tháng.
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
