import { callApi } from '../shared/apiClient';

export type NganSach = {
  id: number;
  ten: string;
  soTien: number;
  chuKy: 'tuan' | 'thang';
  danhMucId: number | null;
  tenDanhMuc: string | null;
  tuNgay: string;
  denNgay: string;
  daTieu: number;
  conLai: number;
  soNgayConLai: number;
  moiNgay: number;
};

export async function getNganSachList(token: string): Promise<NganSach[]> {
  const ketQua = await callApi<{ danhSachNganSach: NganSach[] }>('/ngan-sach', { token });
  return ketQua.danhSachNganSach;
}

export async function createNganSach(
  token: string,
  ten: string,
  soTien: number,
  chuKy: 'tuan' | 'thang',
  danhMucId: number | null,
): Promise<void> {
  await callApi<{ nganSachId: number }>('/ngan-sach', {
    method: 'POST',
    token,
    body: { ten, soTien, chuKy, danhMucId },
  });
}

export async function deleteNganSach(token: string, nganSachId: number): Promise<void> {
  await callApi<void>(`/ngan-sach/${nganSachId}`, { method: 'DELETE', token });
}
