import { HttpError } from '../errors/HttpError';
import { sumExpenseByCategory, sumIncomeAndExpense, type ChiTheoDanhMuc } from './ThongKeQueries';

type ThongKe = {
  tongThu: number;
  tongChi: number;
  chiTheoDanhMuc: ChiTheoDanhMuc[];
};

export async function getStatistics(nguoiDungId: number, tuNgay: string, denNgay: string): Promise<ThongKe> {
  if (tuNgay > denNgay) {
    throw new HttpError(400, 'Ngày bắt đầu phải trước ngày kết thúc');
  }

  const [tong, chiTheoDanhMuc] = await Promise.all([
    sumIncomeAndExpense(nguoiDungId, tuNgay, denNgay),
    sumExpenseByCategory(nguoiDungId, tuNgay, denNgay),
  ]);

  return { tongThu: tong.tongThu, tongChi: tong.tongChi, chiTheoDanhMuc };
}
