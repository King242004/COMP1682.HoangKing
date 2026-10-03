import { isOurPhotoUrl } from '../cloudinary/cloudinaryConfig';
import { getCategoryForUse } from '../danh-muc/DanhMucService';
import { HttpError } from '../errors/HttpError';
import { checkOccurrenceOfUser } from '../khoan-sap-toi/KhoanSapToiService';
import { getWalletOfUser } from '../vi/ViService';
import {
  createTransaction,
  deleteTransaction,
  findTransactionOfUser,
  listTransactions,
  updateTransaction,
  type DuLieuGiaoDich,
  type GiaoDich,
} from './GiaoDichQueries';

// Ví phải là của người gọi, danh mục phải được người đó thấy và đúng loại thu/chi,
// và link ảnh phải nằm trong thư mục Cloudinary của mình (không nhận link bất kỳ).
async function checkWalletAndCategory(nguoiDungId: number, duLieu: DuLieuGiaoDich): Promise<void> {
  await getWalletOfUser(duLieu.viId, nguoiDungId);
  await getCategoryForUse(duLieu.danhMucId, nguoiDungId, duLieu.loai);

  if (duLieu.anhUrl && !isOurPhotoUrl(duLieu.anhUrl)) {
    throw new HttpError(400, 'Link ảnh không hợp lệ');
  }
}

export async function addTransaction(nguoiDungId: number, duLieu: DuLieuGiaoDich): Promise<GiaoDich> {
  await checkWalletAndCategory(nguoiDungId, duLieu);
  if (duLieu.khoanSapToiId !== null && duLieu.kyNgay !== null) {
    await checkOccurrenceOfUser(duLieu.khoanSapToiId, duLieu.kyNgay, nguoiDungId);
  }
  const giaoDichId = await createTransaction(nguoiDungId, duLieu);
  return getTransactionOfUser(giaoDichId, nguoiDungId);
}

async function getTransactionOfUser(giaoDichId: number, nguoiDungId: number): Promise<GiaoDich> {
  const giaoDich = await findTransactionOfUser(giaoDichId, nguoiDungId);
  if (!giaoDich) {
    throw new HttpError(404, 'Không tìm thấy giao dịch');
  }
  return giaoDich;
}

export async function getTransactions(
  nguoiDungId: number,
  tuNgay: string,
  denNgay: string,
  viId: number | null,
): Promise<GiaoDich[]> {
  if (tuNgay > denNgay) {
    throw new HttpError(400, 'Ngày bắt đầu phải trước ngày kết thúc');
  }
  return listTransactions(nguoiDungId, tuNgay, denNgay, viId);
}

export async function editTransaction(giaoDichId: number, nguoiDungId: number, duLieu: DuLieuGiaoDich): Promise<GiaoDich> {
  await getTransactionOfUser(giaoDichId, nguoiDungId);
  await checkWalletAndCategory(nguoiDungId, duLieu);
  await updateTransaction(giaoDichId, duLieu);
  return getTransactionOfUser(giaoDichId, nguoiDungId);
}

export async function removeTransaction(giaoDichId: number, nguoiDungId: number): Promise<void> {
  await getTransactionOfUser(giaoDichId, nguoiDungId);
  await deleteTransaction(giaoDichId);
}
