import { todayInVietnam } from '../dates/dateKey';
import { HttpError } from '../errors/HttpError';
import kiemTraThanhVien from '../nhom/KiemTraThanhVien';
import { deletePromise, savePromise } from './HenTraNoQueries';

// "I will pay all my debt in this group by ngayHen". Any member may set their own promise;
// it only matters while they owe money (the forecast ignores it otherwise).
export async function promiseToPay(nhomId: number, nguoiDungId: number, ngayHen: string): Promise<void> {
  await kiemTraThanhVien(nhomId, nguoiDungId);
  if (ngayHen < todayInVietnam()) {
    throw new HttpError(400, 'Ngày hẹn phải từ hôm nay trở đi');
  }
  await savePromise(nhomId, nguoiDungId, ngayHen);
}

export async function cancelPromise(nhomId: number, nguoiDungId: number): Promise<void> {
  await kiemTraThanhVien(nhomId, nguoiDungId);
  await deletePromise(nhomId, nguoiDungId);
}
