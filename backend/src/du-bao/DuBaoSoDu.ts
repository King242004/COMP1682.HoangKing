import { addDays } from '../dates/dateKey';
import type { KhoanTuongLai } from './TinhHanMucNgay';

export type SoDuTheoNgay = {
  ngay: string;
  soDu: number;
};

export type KetQuaDuBao = {
  theoNgay: SoDuTheoNgay[];
  // Ngày đầu tiên số dư xuống dưới 0, hoặc null nếu trong khoảng dự báo không bao giờ âm.
  ngayHetTien: string | null;
};

// ⭐ Dự báo số dư (tai-lieu/Evenwise.md, mục 4.2), từng ngày trong `soNgay` ngày kể từ hôm nay:
// số dư hôm trước − mức tiêu thường ngày (từ ngày mai) − khoản phải trả hôm đó + tiền vào hôm đó.
// tocDoTieu = trung bình mỗi ngày tôi tiêu bao nhiêu trong 7 ngày gần nhất.
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

    // Tiền tiêu hôm nay đã nằm trong số dư ví rồi, nên mức tiêu thường ngày bắt đầu từ ngày mai.
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
