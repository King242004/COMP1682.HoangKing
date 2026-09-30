import { HttpError } from '../errors/HttpError';
import { isMember } from './NhomQueries';

// Every group action goes through here first: only members of a group can see or change it.
// A non-member gets "not found", so they cannot even tell whether the group exists.
export default async function kiemTraThanhVien(nhomId: number, nguoiDungId: number): Promise<void> {
  if (!(await isMember(nhomId, nguoiDungId))) {
    throw new HttpError(404, 'Không tìm thấy nhóm');
  }
}
