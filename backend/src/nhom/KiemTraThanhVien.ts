import { HttpError } from '../errors/HttpError';
import { isMember } from './NhomQueries';

// Mọi thao tác trên nhóm đều đi qua đây trước: chỉ thành viên mới được xem hoặc sửa nhóm.
// Người ngoài nhận "không tìm thấy", nên không biết được nhóm có tồn tại hay không.
export default async function kiemTraThanhVien(nhomId: number, nguoiDungId: number): Promise<void> {
  if (!(await isMember(nhomId, nguoiDungId))) {
    throw new HttpError(404, 'Không tìm thấy nhóm');
  }
}
