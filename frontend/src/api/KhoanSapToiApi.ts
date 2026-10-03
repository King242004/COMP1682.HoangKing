import { callApi } from '../shared/apiClient';

export type KhoanSapToi = {
  id: number;
  ten: string;
  loai: 'thu' | 'chi';
  soTien: number;
  ngayBatDau: string;
  lapLai: 'khong' | 'tuan' | 'thang';
  ngayKetThuc: string | null;
  // Ngày gần nhất từ hôm nay mà chưa trả.
  kyToiTiep: string | null;
};

export type DuLieuKhoanSapToi = Omit<KhoanSapToi, 'id' | 'kyToiTiep'>;

export async function getKhoanSapToiList(token: string): Promise<KhoanSapToi[]> {
  const ketQua = await callApi<{ danhSachKhoan: KhoanSapToi[] }>('/khoan-sap-toi', { token });
  return ketQua.danhSachKhoan;
}

export async function createKhoanSapToi(token: string, duLieu: DuLieuKhoanSapToi): Promise<void> {
  await callApi<{ khoanId: number }>('/khoan-sap-toi', { method: 'POST', token, body: duLieu });
}

export async function deleteKhoanSapToi(token: string, khoanId: number): Promise<void> {
  await callApi<void>(`/khoan-sap-toi/${khoanId}`, { method: 'DELETE', token });
}
