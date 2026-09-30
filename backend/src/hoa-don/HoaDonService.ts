import { isOurPhotoUrl } from '../cloudinary/cloudinaryConfig';
import { getCategoryForUse } from '../danh-muc/DanhMucService';
import withTransaction from '../database/withTransaction';
import { HttpError } from '../errors/HttpError';
import { checkPlanForBill } from '../ke-hoach-nhom/KeHoachNhomService';
import kiemTraThanhVien from '../nhom/KiemTraThanhVien';
import { listMembers } from '../nhom/NhomQueries';
import { getWalletOfUser } from '../vi/ViService';
import { chiaDeu, tinhConLai, type PhanChia } from './ChiaHoaDon';
import { billBelongsToGroup, createBill, createShares, deleteBill } from './HoaDonQueries';

export type YeuCauThemHoaDon = {
  ten: string;
  nguoiTraId: number;
  viId: number | null;
  danhMucId: number;
  soTien: number;
  ngay: string;
  ghiChu: string | null;
  anhUrl: string | null;
  cachChia: 'deu' | 'tuy_chinh';
  khoanSapToiId: number | null;
  // For 'deu' only nguoiDungId matters; for 'tuy_chinh' each person's soTien is used.
  phanChia: PhanChia[];
};

export async function addBill(nhomId: number, nguoiDungId: number, yeuCau: YeuCauThemHoaDon): Promise<number> {
  await kiemTraThanhVien(nhomId, nguoiDungId);

  const thanhVienIds = new Set((await listMembers(nhomId)).map((nguoi) => nguoi.id));
  const nguoiChiuIds = yeuCau.phanChia.map((phan) => phan.nguoiDungId);

  if (!thanhVienIds.has(yeuCau.nguoiTraId)) {
    throw new HttpError(400, 'Người trả phải là thành viên của nhóm');
  }
  if (nguoiChiuIds.length === 0) {
    throw new HttpError(400, 'Chọn ít nhất một người để chia');
  }
  if (new Set(nguoiChiuIds).size !== nguoiChiuIds.length || nguoiChiuIds.some((id) => !thanhVienIds.has(id))) {
    throw new HttpError(400, 'Danh sách người chia không hợp lệ');
  }

  // Only the person who paid can say which of their wallets the money came from.
  if (yeuCau.viId !== null) {
    if (yeuCau.nguoiTraId !== nguoiDungId) {
      throw new HttpError(400, 'Chỉ người trả mới chọn được ví của mình');
    }
    await getWalletOfUser(yeuCau.viId, nguoiDungId);
  }

  await getCategoryForUse(yeuCau.danhMucId, nguoiDungId, 'chi');

  if (yeuCau.khoanSapToiId !== null) {
    await checkPlanForBill(nhomId, yeuCau.khoanSapToiId);
  }

  if (yeuCau.anhUrl && !isOurPhotoUrl(yeuCau.anhUrl)) {
    throw new HttpError(400, 'Link ảnh không hợp lệ');
  }

  const phanChia = yeuCau.cachChia === 'deu' ? chiaDeu(yeuCau.soTien, nguoiChiuIds) : yeuCau.phanChia;
  const conLai = tinhConLai(yeuCau.soTien, phanChia);
  if (conLai !== 0) {
    throw new HttpError(400, `Tổng các phần chưa khớp với hóa đơn (còn lại ${conLai}đ)`);
  }

  // The bill and its shares are saved together: never a bill without shares.
  return withTransaction(async (client) => {
    const hoaDonId = await createBill(client, {
      nhomId,
      ten: yeuCau.ten,
      nguoiTraId: yeuCau.nguoiTraId,
      viId: yeuCau.viId,
      danhMucId: yeuCau.danhMucId,
      soTien: yeuCau.soTien,
      ngay: yeuCau.ngay,
      ghiChu: yeuCau.ghiChu,
      anhUrl: yeuCau.anhUrl,
      cachChia: yeuCau.cachChia,
      khoanSapToiId: yeuCau.khoanSapToiId,
      nguoiTaoId: nguoiDungId,
    });
    await createShares(client, hoaDonId, phanChia);
    return hoaDonId;
  });
}

// Any member can delete a bill of the group (no roles in a group).
export async function removeBill(nhomId: number, hoaDonId: number, nguoiDungId: number): Promise<void> {
  await kiemTraThanhVien(nhomId, nguoiDungId);
  if (!(await billBelongsToGroup(hoaDonId, nhomId))) {
    throw new HttpError(404, 'Không tìm thấy hóa đơn');
  }
  await deleteBill(hoaDonId);
}
