import { xepLoaiHenTra } from '../hen-tra-no/XepLoaiHenTra';

// ⭐ The new feature of Evenwise (tai-lieu/Evenwise.md, section 4.3):
// turns what happens in groups into items the personal forecast understands.

export type NhomCuaToi = {
  nhomId: number;
  tenNhom: string;
  // My balance in the group: negative = I owe, positive = the group owes me.
  soDuCuaToi: number;
  // The day I promised to pay my debt in this group, if any.
  ngayHen: string | null;
};

export type KeHoachDaThamGia = {
  keHoachId: number;
  ten: string;
  tenNhom: string;
  ngay: string;
  // Expected amount per person.
  soTienMoiNguoi: number;
  // My share of the real bills already linked to this plan (e.g. the bus ticket bought early).
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
  // Money I must pay, each on the day it will leave my pocket.
  khoanPhaiTra: KhoanTuNhom[];
  // Money others owe me. Not certain, so it is never counted in the daily limit.
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

    // No promise, or the promised day has passed: the debt counts as due today.
    // A promise in the future: the debt counts on that day.
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

  // A plan counts only for what is not spent yet, so money already paid is not subtracted twice.
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
