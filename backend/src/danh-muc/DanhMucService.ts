import { HttpError } from '../errors/HttpError';
import {
  countCategoryUsage,
  createCategory,
  deleteCategory,
  findCategoryVisibleToUser,
  listCategories,
  type DanhMuc,
} from './DanhMucQueries';

// Icon gán cho danh mục riêng khi người dùng không chọn.
const BIEU_TUONG_MAC_DINH = 'pricetag-outline';

export async function getCategories(nguoiDungId: number): Promise<DanhMuc[]> {
  return listCategories(nguoiDungId);
}

// Các service khác dùng hàm này để chắc rằng danh mục tồn tại, người gọi được thấy, và đúng loại thu/chi.
export async function getCategoryForUse(
  danhMucId: number,
  nguoiDungId: number,
  loaiCanDung: 'thu' | 'chi',
): Promise<DanhMuc> {
  const danhMuc = await findCategoryVisibleToUser(danhMucId, nguoiDungId);
  if (!danhMuc) {
    throw new HttpError(404, 'Không tìm thấy danh mục');
  }
  if (danhMuc.loai !== loaiCanDung) {
    throw new HttpError(400, `Danh mục này dành cho khoản ${danhMuc.loai}, không dùng cho khoản ${loaiCanDung}`);
  }
  return danhMuc;
}

export async function addCategory(
  nguoiDungId: number,
  ten: string,
  loai: 'thu' | 'chi',
  bieuTuong: string | null,
): Promise<DanhMuc> {
  const danhMucId = await createCategory(nguoiDungId, ten, loai, bieuTuong ?? BIEU_TUONG_MAC_DINH);
  return getCategoryForUse(danhMucId, nguoiDungId, loai);
}

export async function removeCategory(danhMucId: number, nguoiDungId: number): Promise<void> {
  const danhMuc = await findCategoryVisibleToUser(danhMucId, nguoiDungId);
  if (!danhMuc) {
    throw new HttpError(404, 'Không tìm thấy danh mục');
  }
  if (danhMuc.laMacDinh) {
    throw new HttpError(403, 'Không xóa được danh mục mặc định');
  }
  if ((await countCategoryUsage(danhMucId)) > 0) {
    throw new HttpError(409, 'Danh mục này đang được dùng nên không xóa được');
  }
  await deleteCategory(danhMucId);
}
