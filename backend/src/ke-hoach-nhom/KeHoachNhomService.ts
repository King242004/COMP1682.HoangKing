import { todayInVietnam } from '../dates/dateKey';
import { HttpError } from '../errors/HttpError';
import kiemTraThanhVien from '../nhom/KiemTraThanhVien';
import { createPlanWithCreator, deletePlan, joinPlan, leavePlan, planBelongsToGroup } from './KeHoachNhomQueries';

// Whoever creates a plan joins it automatically; others press "Tôi tham gia".
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

// Any member can delete a plan (no roles in a group).
export async function removePlan(nhomId: number, keHoachId: number, nguoiDungId: number): Promise<void> {
  await checkPlanInGroup(nhomId, keHoachId, nguoiDungId);
  await deletePlan(keHoachId);
}

// Used when a bill says "this belongs to plan X": X must be a plan of the same group.
export async function checkPlanForBill(nhomId: number, keHoachId: number): Promise<void> {
  if (!(await planBelongsToGroup(keHoachId, nhomId))) {
    throw new HttpError(400, 'Kế hoạch không thuộc nhóm này');
  }
}
