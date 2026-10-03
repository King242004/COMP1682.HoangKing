import { xepLoaiHenTra } from '../hen-tra-no/XepLoaiHenTra';

// ⭐ Chức năng mới của Evenwise (tai-lieu/Evenwise.md, mục 4.3):
// biến những gì xảy ra trong nhóm thành các khoản mà dự báo cá nhân hiểu được.

export type NhomCuaToi = {
  nhomId: number;
  tenNhom: string;
  // Số dư của tôi trong nhóm: âm = tôi đang nợ, dương = nhóm nợ tôi.
  soDuCuaToi: number;
  // Ngày tôi hẹn trả hết nợ nhóm này, nếu có.
  ngayHen: string | null;
};

export type KeHoachDaThamGia = {
  keHoachId: number;
  ten: string;
  tenNhom: string;
  ngay: string;
  // Số tiền dự kiến của mỗi người.
  soTienMoiNguoi: number;
  // Phần của tôi trong các hóa đơn thật đã gắn vào kế hoạch này (ví dụ vé xe mua trước).
  daChiPhanCuaToi: number;
};

export type KhoanTuNhom = {
  ngay: string;
  soTien: number;
  ten: string;
  loai: 'no_nhom' | 'ke_hoach_nhom';
};

export type NhacNho = {
  mucDo: 'vang' | 'do';
  noiDung: string;
  nhomId: number;
};

export type KetQuaNoiNhom = {
  // Tiền tôi phải trả, mỗi khoản vào đúng ngày tiền rời khỏi túi tôi.
  khoanPhaiTra: KhoanTuNhom[];
  // Tiền người khác nợ tôi. Chưa chắc được trả nên không bao giờ cộng vào hạn mức mỗi ngày.
  sapDuocTra: number;
  tongDangNo: number;
  nhacNho: NhacNho[];
};

export function noiNhomVaoCaNhan(
  danhSachNhom: NhomCuaToi[],
  danhSachKeHoach: KeHoachDaThamGia[],
  homNay: string,
): KetQuaNoiNhom {
  const khoanPhaiTra: KhoanTuNhom[] = [];
  const nhacNho: NhacNho[] = [];
  let sapDuocTra = 0;
  let tongDangNo = 0;

  for (const nhom of danhSachNhom) {
    if (nhom.soDuCuaToi > 0) {
      sapDuocTra += nhom.soDuCuaToi;
      continue;
    }
    if (nhom.soDuCuaToi === 0) {
      continue;
    }

    const soNo = -nhom.soDuCuaToi;
    tongDangNo += soNo;

    // Chưa hẹn, hoặc đã quá ngày hẹn: khoản nợ tính là phải trả ngay hôm nay.
    // Có hẹn trong tương lai: khoản nợ tính vào đúng ngày đó.
    const henConHieuLuc = nhom.ngayHen !== null && nhom.ngayHen >= homNay;
    khoanPhaiTra.push({
      ngay: henConHieuLuc ? (nhom.ngayHen as string) : homNay,
      soTien: soNo,
      ten: `Trả nợ nhóm ${nhom.tenNhom}`,
      loai: 'no_nhom',
    });

    if (nhom.ngayHen !== null) {
      const henTra = xepLoaiHenTra(nhom.ngayHen, homNay);
      if (henTra.loai === 'sap_toi') {
        const khiNao = henTra.soNgay === 0 ? 'Hôm nay' : `Còn ${henTra.soNgay} ngày`;
        nhacNho.push({ mucDo: 'vang', noiDung: `${khiNao} tới hẹn trả nhóm ${nhom.tenNhom}`, nhomId: nhom.nhomId });
      }
      if (henTra.loai === 'qua_hen') {
        nhacNho.push({
          mucDo: 'do',
          noiDung: `Đã quá hẹn ${henTra.soNgay} ngày trả nhóm ${nhom.tenNhom}`,
          nhomId: nhom.nhomId,
        });
      }
    }
  }

  // Kế hoạch chỉ tính phần chưa chi, để tiền đã trả không bị trừ hai lần.
  for (const keHoach of danhSachKeHoach) {
    const conPhaiChi = Math.max(0, keHoach.soTienMoiNguoi - keHoach.daChiPhanCuaToi);
    if (conPhaiChi > 0 && keHoach.ngay >= homNay) {
      khoanPhaiTra.push({
        ngay: keHoach.ngay,
        soTien: conPhaiChi,
        ten: `${keHoach.ten} (${keHoach.tenNhom})`,
        loai: 'ke_hoach_nhom',
      });
    }
  }

  return { khoanPhaiTra, sapDuocTra, tongDangNo, nhacNho };
}
