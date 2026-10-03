import { addDays, todayInVietnam } from '../dates/dateKey';
import { listPaidOccurrences, sumMySpending } from '../giao-dich/GiaoDichQueries';
import { listPromisesOfUser } from '../hen-tra-no/HenTraNoQueries';
import { listPlansJoinedByUser } from '../ke-hoach-nhom/KeHoachNhomQueries';
import { unpaidOccurrences } from '../khoan-sap-toi/KhoanSapToiService';
import { listPersonalItems } from '../khoan-sap-toi/KhoanSapToiQueries';
import { getBudgetLimitPerDay } from '../ngan-sach/NganSachService';
import { tinhSoDuCuaNhom } from '../nhom/NhomService';
import { listGroupsOfUser } from '../nhom/NhomQueries';
import { listWallets } from '../vi/ViQueries';
import { duBaoSoDu } from './DuBaoSoDu';
import { noiNhomVaoCaNhan, type NhacNho } from './NoiNhomVaoCaNhan';
import { tinhHanMucNgay, type HanMucNgay, type KhoanTuongLai } from './TinhHanMucNgay';

// Dự báo số dư nhìn trước bao nhiêu ngày, và lấy bao nhiêu ngày đã qua để tính tốc độ tiêu.
const SO_NGAY_DU_BAO = 62;
const SO_NGAY_TINH_TOC_DO = 7;

// Một khoản tương lai hiện trên lịch và trong mục "Sắp tới".
export type KhoanTrenLich = {
  ngay: string;
  ten: string;
  soTien: number;
  loai: 'thu' | 'chi';
  nguon: 'ca_nhan' | 'no_nhom' | 'ke_hoach_nhom';
  khoanSapToiId: number | null;
};

export type DuBao = {
  homNay: string;
  coVi: boolean;
  soDuVi: number;
  tongDangNo: number;
  sapDuocTra: number;
  tocDoTieu: number;
  hanMuc: HanMucNgay;
  ngayHetTien: string | null;
  nhacNho: NhacNho[];
  khoanTrenLich: KhoanTrenLich[];
};

// ⭐ Mọi thứ Trang chủ cần biết về tương lai, trong một lần gọi.
// lichTu / lichDen = khoảng ngày lịch đang hiện (chỉ ngày tương lai mới có khoản).
export async function getForecast(nguoiDungId: number, lichTu: string, lichDen: string): Promise<DuBao> {
  const homNay = todayInVietnam();
  const cuoiCuaSo = [addDays(homNay, SO_NGAY_DU_BAO), lichDen].sort()[1];

  const [danhSachVi, khoanCaNhan, daTra, danhSachNhom, henTra, keHoach, muonTieuMoiNgay, chiTieuGanDay] =
    await Promise.all([
      listWallets(nguoiDungId),
      listPersonalItems(nguoiDungId),
      listPaidOccurrences(nguoiDungId),
      listGroupsOfUser(nguoiDungId),
      listPromisesOfUser(nguoiDungId),
      listPlansJoinedByUser(nguoiDungId),
      getBudgetLimitPerDay(nguoiDungId),
      sumMySpending(nguoiDungId, addDays(homNay, -SO_NGAY_TINH_TOC_DO), addDays(homNay, -1), null),
    ]);

  const soDuVi = danhSachVi.reduce((tong, vi) => tong + vi.soDuHienTai, 0);
  const tocDoTieu = Math.floor(chiTieuGanDay / SO_NGAY_TINH_TOC_DO);

  // Bước 1. Khoản sắp tới cá nhân → các khoản có ngày (những kỳ chưa trả, từ hôm nay trở đi).
  const khoanTrenLich: KhoanTrenLich[] = [];
  for (const khoan of khoanCaNhan) {
    for (const ngay of unpaidOccurrences(khoan, homNay, cuoiCuaSo, daTra)) {
      khoanTrenLich.push({ ngay, ten: khoan.ten, soTien: khoan.soTien, loai: khoan.loai, nguon: 'ca_nhan', khoanSapToiId: khoan.id });
    }
  }

  // Bước 2. ⭐ Nhóm → nợ của tôi (vào ngày đã hẹn), tiền người khác nợ tôi, kế hoạch đã tham gia.
  const nhomCuaToi = await Promise.all(
    danhSachNhom.map(async (nhom) => {
      const { soDu } = await tinhSoDuCuaNhom(nhom.id);
      return {
        nhomId: nhom.id,
        tenNhom: nhom.ten,
        soDuCuaToi: soDu.get(nguoiDungId) ?? 0,
        ngayHen: henTra.find((hen) => hen.nhomId === nhom.id)?.ngayHen ?? null,
      };
    }),
  );
  const tuNhom = noiNhomVaoCaNhan(nhomCuaToi, keHoach, homNay);
  for (const khoan of tuNhom.khoanPhaiTra) {
    khoanTrenLich.push({ ngay: khoan.ngay, ten: khoan.ten, soTien: khoan.soTien, loai: 'chi', nguon: khoan.loai, khoanSapToiId: null });
  }

  // Bước 3. Hạn mức mỗi ngày và dự báo từng ngày dùng chung một danh sách khoản tương lai.
  const cacKhoan: KhoanTuongLai[] = khoanTrenLich.map((khoan) => ({ ngay: khoan.ngay, soTien: khoan.soTien, loai: khoan.loai }));
  const hanMuc = tinhHanMucNgay(soDuVi, cacKhoan, tuNhom.sapDuocTra, muonTieuMoiNgay, homNay);
  const duBao = duBaoSoDu(soDuVi, tocDoTieu, cacKhoan, homNay, SO_NGAY_DU_BAO);

  const nhacNho = [...tuNhom.nhacNho];
  if (duBao.ngayHetTien !== null && duBao.ngayHetTien < hanMuc.ngayCoTien) {
    const [nam, thang, ngay] = duBao.ngayHetTien.split('-');
    nhacNho.push({
      mucDo: 'do',
      noiDung: `Tiêu như ${SO_NGAY_TINH_TOC_DO} ngày qua thì hết tiền ngày ${ngay}/${thang}/${nam}`,
      nhomId: 0,
    });
  }

  return {
    homNay,
    coVi: danhSachVi.length > 0,
    soDuVi,
    tongDangNo: tuNhom.tongDangNo,
    sapDuocTra: tuNhom.sapDuocTra,
    tocDoTieu,
    hanMuc,
    ngayHetTien: duBao.ngayHetTien,
    nhacNho,
    khoanTrenLich: khoanTrenLich
      .filter((khoan) => khoan.ngay >= lichTu && khoan.ngay <= lichDen)
      .sort((khoanTruoc, khoanSau) => khoanTruoc.ngay.localeCompare(khoanSau.ngay)),
  };
}
