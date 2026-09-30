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

// How many days the balance forecast looks ahead, and how many past days give the spending speed.
const SO_NGAY_DU_BAO = 62;
const SO_NGAY_TINH_TOC_DO = 7;

// One future item shown on the calendar and in "Sắp tới".
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

// ⭐ Everything the Home screen needs about the future, in one call.
// lichTu / lichDen = the calendar range the app is showing (only future days get items).
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

  // 1. Personal upcoming items → dated items (unpaid occurrences from today on).
  const khoanTrenLich: KhoanTrenLich[] = [];
  for (const khoan of khoanCaNhan) {
    for (const ngay of unpaidOccurrences(khoan, homNay, cuoiCuaSo, daTra)) {
      khoanTrenLich.push({ ngay, ten: khoan.ten, soTien: khoan.soTien, loai: khoan.loai, nguon: 'ca_nhan', khoanSapToiId: khoan.id });
    }
  }

  // 2. ⭐ Groups → my debts (on the promised day), money owed to me, joined plans.
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

  // 3. The daily limit and the day-by-day forecast use the same list of future items.
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
      .sort((a, b) => (a.ngay < b.ngay ? -1 : a.ngay > b.ngay ? 1 : 0)),
  };
}
