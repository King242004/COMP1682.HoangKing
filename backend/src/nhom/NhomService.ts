import crypto from 'node:crypto';

import withTransaction from '../database/withTransaction';
import { HttpError } from '../errors/HttpError';
import { listPromisesOfGroup, type HenTraNo } from '../hen-tra-no/HenTraNoQueries';
import { listBillsOfGroup, type HoaDon } from '../hoa-don/HoaDonQueries';
import { listPlansOfGroup, type KeHoachNhom } from '../ke-hoach-nhom/KeHoachNhomQueries';
import { listPayments, type ThanhToan } from '../thanh-toan-nhom/ThanhToanNhomQueries';
import { tinhQuyetToan, type LanChuyen } from '../thanh-toan-nhom/TinhQuyetToan';
import { tinhSoDuNhom } from '../thanh-toan-nhom/TinhSoDuNhom';
import kiemTraThanhVien from './KiemTraThanhVien';
import {
  addMember,
  createGroupWithCreator,
  findGroup,
  findGroupByInviteCode,
  listGroupsOfUser,
  listMembers,
  type Nhom,
  type ThanhVien,
} from './NhomQueries';

// Letters and digits that are hard to confuse when read aloud or typed (no 0/O, 1/I/L).
const KY_TU_MA_MOI = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const DO_DAI_MA_MOI = 6;
const SO_LAN_THU_TAO_MA = 5;
const POSTGRES_UNIQUE_VIOLATION = '23505';

function taoMaMoi(): string {
  let ma = '';
  for (let i = 0; i < DO_DAI_MA_MOI; i += 1) {
    ma += KY_TU_MA_MOI[crypto.randomInt(KY_TU_MA_MOI.length)];
  }
  return ma;
}

type ThanhVienKemSoDu = ThanhVien & { soDu: number };

export type SoDuCuaNhom = {
  thanhVien: ThanhVienKemSoDu[];
  danhSachHoaDon: HoaDon[];
  danhSachThanhToan: ThanhToan[];
  soDu: Map<number, number>;
};

// Loads everything of one group and computes each member's balance.
// Used by the group screens now, and by the forecast later (week 3).
export async function tinhSoDuCuaNhom(nhomId: number): Promise<SoDuCuaNhom> {
  const [thanhVien, danhSachHoaDon, danhSachThanhToan] = await Promise.all([
    listMembers(nhomId),
    listBillsOfGroup(nhomId),
    listPayments(nhomId),
  ]);

  const thanhToanDaNhan = danhSachThanhToan.filter((thanhToan) => thanhToan.trangThai === 'da_nhan');
  const soDu = tinhSoDuNhom(
    thanhVien.map((nguoi) => nguoi.id),
    danhSachHoaDon,
    thanhToanDaNhan,
  );

  return {
    thanhVien: thanhVien.map((nguoi) => ({ ...nguoi, soDu: soDu.get(nguoi.id) ?? 0 })),
    danhSachHoaDon,
    danhSachThanhToan,
    soDu,
  };
}

export async function createGroup(ten: string, nguoiDungId: number): Promise<Nhom> {
  // The invite code must be unique; in the rare case it is already taken, try a new one.
  for (let lanThu = 1; lanThu <= SO_LAN_THU_TAO_MA; lanThu += 1) {
    try {
      const nhomId = await withTransaction((client) => createGroupWithCreator(client, ten, taoMaMoi(), nguoiDungId));
      return (await findGroup(nhomId)) as Nhom;
    } catch (error) {
      const isDuplicateCode = (error as { code?: string }).code === POSTGRES_UNIQUE_VIOLATION;
      if (!isDuplicateCode) {
        throw error;
      }
    }
  }
  throw new HttpError(500, 'Không tạo được mã mời, vui lòng thử lại');
}

export async function joinGroup(maMoi: string, nguoiDungId: number): Promise<Nhom> {
  const nhom = await findGroupByInviteCode(maMoi);
  if (!nhom) {
    throw new HttpError(404, 'Mã mời không đúng');
  }
  await addMember(nhom.id, nguoiDungId);
  return nhom;
}

// My groups, each with how many members it has and my balance in it.
export async function getMyGroups(nguoiDungId: number) {
  const danhSachNhom = await listGroupsOfUser(nguoiDungId);

  return Promise.all(
    danhSachNhom.map(async (nhom) => {
      const { thanhVien, soDu } = await tinhSoDuCuaNhom(nhom.id);
      return { ...nhom, soThanhVien: thanhVien.length, soDuCuaToi: soDu.get(nguoiDungId) ?? 0 };
    }),
  );
}

type ChiTietNhom = {
  nhom: Nhom;
  thanhVien: ThanhVienKemSoDu[];
  danhSachHoaDon: HoaDon[];
  danhSachThanhToan: ThanhToan[];
  deXuatQuyetToan: LanChuyen[];
  danhSachKeHoach: KeHoachNhom[];
  danhSachHenTra: HenTraNo[];
};

export async function getGroupDetail(nhomId: number, nguoiDungId: number): Promise<ChiTietNhom> {
  await kiemTraThanhVien(nhomId, nguoiDungId);

  const nhom = (await findGroup(nhomId)) as Nhom;
  const [{ thanhVien, danhSachHoaDon, danhSachThanhToan, soDu }, danhSachKeHoach, danhSachHenTra] = await Promise.all([
    tinhSoDuCuaNhom(nhomId),
    listPlansOfGroup(nhomId, nguoiDungId),
    listPromisesOfGroup(nhomId),
  ]);

  return {
    nhom,
    thanhVien,
    danhSachHoaDon,
    danhSachThanhToan,
    deXuatQuyetToan: tinhQuyetToan(soDu),
    danhSachKeHoach,
    danhSachHenTra,
  };
}
