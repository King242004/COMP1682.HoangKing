import { HttpError } from '../errors/HttpError';
import kiemTraThanhVien from '../nhom/KiemTraThanhVien';
import { getWalletOfUser } from '../vi/ViService';
import {
  confirmPayment,
  createPayment,
  deletePayment,
  findPaymentInGroup,
  type ThanhToan,
} from './ThanhToanNhomQueries';

// Step 1 of paying a debt: the person paying presses "Đã trả" (optionally picking the wallet it came from).
// It only counts after the receiver confirms (step 2).
export async function sendPayment(
  nhomId: number,
  nguoiTraId: number,
  nguoiNhanId: number,
  soTien: number,
  viTraId: number | null,
): Promise<number> {
  await kiemTraThanhVien(nhomId, nguoiTraId);
  if (nguoiNhanId === nguoiTraId) {
    throw new HttpError(400, 'Không thể trả tiền cho chính mình');
  }
  await kiemTraThanhVien(nhomId, nguoiNhanId);
  if (viTraId !== null) {
    await getWalletOfUser(viTraId, nguoiTraId);
  }
  return createPayment(nhomId, nguoiTraId, nguoiNhanId, soTien, viTraId);
}

async function getPendingPayment(nhomId: number, thanhToanId: number): Promise<ThanhToan> {
  const thanhToan = await findPaymentInGroup(thanhToanId, nhomId);
  if (!thanhToan) {
    throw new HttpError(404, 'Không tìm thấy lần trả tiền');
  }
  if (thanhToan.trangThai !== 'cho') {
    throw new HttpError(409, 'Lần trả tiền này đã được xác nhận rồi');
  }
  return thanhToan;
}

// Step 2: only the receiver can confirm "Đã nhận" (optionally picking the wallet it went into).
export async function receivePayment(
  nhomId: number,
  thanhToanId: number,
  nguoiDungId: number,
  viNhanId: number | null,
): Promise<void> {
  await kiemTraThanhVien(nhomId, nguoiDungId);
  const thanhToan = await getPendingPayment(nhomId, thanhToanId);
  if (thanhToan.nguoiNhanId !== nguoiDungId) {
    throw new HttpError(403, 'Chỉ người nhận mới xác nhận được');
  }
  if (viNhanId !== null) {
    await getWalletOfUser(viNhanId, nguoiDungId);
  }
  await confirmPayment(thanhToanId, viNhanId);
}

// The payer can take back a "Đã trả" that the receiver has not confirmed yet.
export async function cancelPayment(nhomId: number, thanhToanId: number, nguoiDungId: number): Promise<void> {
  await kiemTraThanhVien(nhomId, nguoiDungId);
  const thanhToan = await getPendingPayment(nhomId, thanhToanId);
  if (thanhToan.nguoiTraId !== nguoiDungId) {
    throw new HttpError(403, 'Chỉ người trả mới hủy được');
  }
  await deletePayment(thanhToanId);
}
