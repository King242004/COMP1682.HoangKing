import { todayInVietnam } from '../dates/dateKey';
import { HttpError } from '../errors/HttpError';
import kiemTraThanhVien from '../nhom/KiemTraThanhVien';
import { createPlanWithCreator, deletePlan, joinPlan, leavePlan, planBelongsToGroup } from './KeHoachNhomQueries';

// Ai tạo kế hoạch thì tự động tham gia; người khác bấm "Tôi tham gia".
export async function addPlan(
  nhomId: number,
  nguoiDungId: number,
  ten: string,
  soTienMoiNguoi: number,
  ngay: string,
): Promise<number> {
  await kiemTraThanhVien(nhomId, nguoiDungId);
  if (ngay < todayInVietnam()) {
    throw new HttpError(400, 'Ngày của kế hoạch phải từ hôm nay trở đi');
  }
  return createPlanWithCreator(nhomId, nguoiDungId, ten, soTienMoiNguoi, ngay);
}

async function checkPlanInGroup(nhomId: number, keHoachId: number, nguoiDungId: number): Promise<void> {
  await kiemTraThanhVien(nhomId, nguoiDungId);
  if (!(await planBelongsToGroup(keHoachId, nhomId))) {
    throw new HttpError(404, 'Không tìm thấy kế hoạch');
  }
}

export async function join(nhomId: number, keHoachId: number, nguoiDungId: number): Promise<void> {
  await checkPlanInGroup(nhomId, keHoachId, nguoiDungId);
  await joinPlan(keHoachId, nguoiDungId);
}

export async function leave(nhomId: number, keHoachId: number, nguoiDungId: number): Promise<void> {
  await checkPlanInGroup(nhomId, keHoachId, nguoiDungId);
  await leavePlan(keHoachId, nguoiDungId);
}

// Thành viên nào cũng xóa được kế hoạch (trong nhóm không có phân quyền).
export async function removePlan(nhomId: number, keHoachId: number, nguoiDungId: number): Promise<void> {
  await checkPlanInGroup(nhomId, keHoachId, nguoiDungId);
  await deletePlan(keHoachId);
}

// Dùng khi một hóa đơn nói "khoản này thuộc kế hoạch X": X phải là kế hoạch của cùng nhóm.
export async function checkPlanForBill(nhomId: number, keHoachId: number): Promise<void> {
  if (!(await planBelongsToGroup(keHoachId, nhomId))) {
    throw new HttpError(400, 'Kế hoạch không thuộc nhóm này');
  }
}
