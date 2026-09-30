import { callApi } from '../shared/apiClient';

export type DanhMuc = {
  id: number;
  ten: string;
  loai: 'thu' | 'chi';
  bieuTuong: string;
  laMacDinh: boolean;
};

export async function getDanhMucList(token: string): Promise<DanhMuc[]> {
  const ketQua = await callApi<{ danhSachDanhMuc: DanhMuc[] }>('/danh-muc', { token });
  return ketQua.danhSachDanhMuc;
}

export async function createDanhMuc(token: string, ten: string, loai: 'thu' | 'chi', bieuTuong: string): Promise<DanhMuc> {
  const ketQua = await callApi<{ danhMuc: DanhMuc }>('/danh-muc', {
    method: 'POST',
    token,
    body: { ten, loai, bieuTuong },
  });
  return ketQua.danhMuc;
}

export async function deleteDanhMuc(token: string, danhMucId: number): Promise<void> {
  await callApi<void>(`/danh-muc/${danhMucId}`, { method: 'DELETE', token });
}
