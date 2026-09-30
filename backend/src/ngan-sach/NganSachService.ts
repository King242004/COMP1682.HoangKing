import { getCategoryForUse } from '../danh-muc/DanhMucService';
import { todayInVietnam } from '../dates/dateKey';
import { HttpError } from '../errors/HttpError';
import { sumMySpending } from '../giao-dich/GiaoDichQueries';
import { budgetBelongsToUser, createBudget, deleteBudget, listBudgets, type NganSach } from './NganSachQueries';
import { kyHienTai, tinhConLaiNganSach, type ConLaiNganSach, type KyNganSach } from './TinhConLaiNganSach';

export type NganSachKemTinhHinh = NganSach & KyNganSach & ConLaiNganSach;

// Every budget with how it is going in its current week/month.
export async function getBudgets(nguoiDungId: number): Promise<NganSachKemTinhHinh[]> {
  const homNay = todayInVietnam();
  const danhSach = await listBudgets(nguoiDungId);

  return Promise.all(
    danhSach.map(async (nganSach) => {
      const ky = kyHienTai(nganSach.chuKy, homNay);
      const daTieu = await sumMySpending(nguoiDungId, ky.tuNgay, ky.denNgay, nganSach.danhMucId);
      return { ...nganSach, ...ky, ...tinhConLaiNganSach(nganSach.soTien, daTieu, ky.denNgay, homNay) };
    }),
  );
}

// "Muốn tiêu mỗi ngày" for the forecast: from total budgets only (not per category).
// With several total budgets, the strictest one wins. null when the user has none.
export async function getBudgetLimitPerDay(nguoiDungId: number): Promise<number | null> {
  const nganSachTong = (await getBudgets(nguoiDungId)).filter((nganSach) => nganSach.danhMucId === null);
  if (nganSachTong.length === 0) {
    return null;
  }
  return Math.min(...nganSachTong.map((nganSach) => nganSach.moiNgay));
}

export async function addBudget(
  nguoiDungId: number,
  ten: string,
  soTien: number,
  chuKy: 'tuan' | 'thang',
  danhMucId: number | null,
): Promise<number> {
  if (danhMucId !== null) {
    await getCategoryForUse(danhMucId, nguoiDungId, 'chi');
  }
  return createBudget(nguoiDungId, ten, soTien, chuKy, danhMucId, todayInVietnam());
}

export async function removeBudget(nganSachId: number, nguoiDungId: number): Promise<void> {
  if (!(await budgetBelongsToUser(nganSachId, nguoiDungId))) {
    throw new HttpError(404, 'Không tìm thấy ngân sách');
  }
  await deleteBudget(nganSachId);
}
