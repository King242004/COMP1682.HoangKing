import { addDays, todayInVietnam } from '../dates/dateKey';
import { HttpError } from '../errors/HttpError';
import { listPaidOccurrences } from '../giao-dich/GiaoDichQueries';
import {
  createPersonalItem,
  deleteItem,
  findPersonalItemOfUser,
  listPersonalItems,
  type DuLieuKhoanSapToi,
  type KhoanSapToi,
} from './KhoanSapToiQueries';
import { trienKhaiKhoanLapLai } from './TrienKhaiKhoanLapLai';

// Tìm kỳ chưa trả tiếp theo của một khoản trong bao nhiêu ngày tới.
const SO_NGAY_TIM_KY_TOI = 400;

export type KhoanKemKyToi = KhoanSapToi & {
  // Ngày gần nhất từ hôm nay mà chưa trả, hoặc null nếu không có.
  kyToiTiep: string | null;
};

// Những kỳ chưa trả của một khoản nằm trong [tuNgay, denNgay].
export function unpaidOccurrences(
  khoan: KhoanSapToi,
  tuNgay: string,
  denNgay: string,
  daTra: { khoanSapToiId: number; kyNgay: string }[],
): string[] {
  return trienKhaiKhoanLapLai(khoan, tuNgay, denNgay).filter(
    (ngay) => !daTra.some((tra) => tra.khoanSapToiId === khoan.id && tra.kyNgay === ngay),
  );
}

export async function getMyItems(nguoiDungId: number): Promise<KhoanKemKyToi[]> {
  const homNay = todayInVietnam();
  const [danhSach, daTra] = await Promise.all([listPersonalItems(nguoiDungId), listPaidOccurrences(nguoiDungId)]);

  return danhSach.map((khoan) => ({
    ...khoan,
    kyToiTiep: unpaidOccurrences(khoan, homNay, addDays(homNay, SO_NGAY_TIM_KY_TOI), daTra)[0] ?? null,
  }));
}

export async function addItem(nguoiDungId: number, duLieu: DuLieuKhoanSapToi): Promise<number> {
  if (duLieu.ngayKetThuc !== null && duLieu.ngayKetThuc < duLieu.ngayBatDau) {
    throw new HttpError(400, 'Ngày kết thúc phải sau ngày bắt đầu');
  }
  return createPersonalItem(nguoiDungId, duLieu);
}

export async function removeItem(khoanId: number, nguoiDungId: number): Promise<void> {
  if (!(await findPersonalItemOfUser(khoanId, nguoiDungId))) {
    throw new HttpError(404, 'Không tìm thấy khoản sắp tới');
  }
  await deleteItem(khoanId);
}

// Dùng khi một giao dịch nói "khoản này trả kỳ ngày Y của khoản sắp tới X":
// X phải là của tôi và Y phải đúng là một ngày của X.
export async function checkOccurrenceOfUser(khoanId: number, kyNgay: string, nguoiDungId: number): Promise<void> {
  const khoan = await findPersonalItemOfUser(khoanId, nguoiDungId);
  if (!khoan) {
    throw new HttpError(404, 'Không tìm thấy khoản sắp tới');
  }
  if (trienKhaiKhoanLapLai(khoan, kyNgay, kyNgay).length === 0) {
    throw new HttpError(400, 'Ngày này không phải một kỳ của khoản sắp tới');
  }
}
