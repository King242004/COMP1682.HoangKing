import { callApi } from '../shared/apiClient';

export type NhomCuaToi = {
  id: number;
  ten: string;
  maMoi: string;
  soThanhVien: number;
  soDuCuaToi: number;
};

export type Nhom = {
  id: number;
  ten: string;
  maMoi: string;
};

export type ThanhVien = {
  id: number;
  tenHienThi: string;
  soDu: number;
};

export type HoaDon = {
  id: number;
  ten: string;
  soTien: number;
  ngay: string;
  ghiChu: string | null;
  anhUrl: string | null;
  cachChia: 'deu' | 'tuy_chinh';
  nguoiTraId: number;
  tenNguoiTra: string;
  danhMucId: number;
  tenDanhMuc: string;
  bieuTuongDanhMuc: string;
  phanChia: { nguoiDungId: number; tenHienThi: string; soTien: number }[];
};

export type ThanhToan = {
  id: number;
  nguoiTraId: number;
  tenNguoiTra: string;
  nguoiNhanId: number;
  tenNguoiNhan: string;
  soTien: number;
  trangThai: 'cho' | 'da_nhan';
};

export type LanChuyen = {
  nguoiTraId: number;
  nguoiNhanId: number;
  soTien: number;
};

export type KeHoachNhom = {
  id: number;
  ten: string;
  soTienMoiNguoi: number;
  ngay: string;
  soNguoiThamGia: number;
  toiThamGia: boolean;
};

export type HenTraNo = {
  nhomId: number;
  nguoiDungId: number;
  ngayHen: string;
};

export type ChiTietNhom = {
  nhom: Nhom;
  thanhVien: ThanhVien[];
  danhSachHoaDon: HoaDon[];
  danhSachThanhToan: ThanhToan[];
  deXuatQuyetToan: LanChuyen[];
  danhSachKeHoach: KeHoachNhom[];
  danhSachHenTra: HenTraNo[];
};

export async function getNhomList(token: string): Promise<NhomCuaToi[]> {
  const ketQua = await callApi<{ danhSachNhom: NhomCuaToi[] }>('/nhom', { token });
  return ketQua.danhSachNhom;
}

export async function createNhom(token: string, ten: string): Promise<Nhom> {
  const ketQua = await callApi<{ nhom: Nhom }>('/nhom', { method: 'POST', token, body: { ten } });
  return ketQua.nhom;
}

export async function joinNhom(token: string, maMoi: string): Promise<Nhom> {
  const ketQua = await callApi<{ nhom: Nhom }>('/nhom/tham-gia', { method: 'POST', token, body: { maMoi } });
  return ketQua.nhom;
}

export function getChiTietNhom(token: string, nhomId: number): Promise<ChiTietNhom> {
  return callApi<ChiTietNhom>(`/nhom/${nhomId}`, { token });
}
