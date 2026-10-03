import { todayInVietnam } from '../dates/dateKey';
import { HttpError } from '../errors/HttpError';
import kiemTraThanhVien from '../nhom/KiemTraThanhVien';
import { deletePromise, savePromise } from './HenTraNoQueries';

// "Tôi sẽ trả hết nợ nhóm này trước ngayHen". Thành viên nào cũng tự đặt hẹn của mình được;
// hẹn chỉ có tác dụng khi người đó đang nợ (nếu không thì dự báo bỏ qua).
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
