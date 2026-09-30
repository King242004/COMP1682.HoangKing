import { callApi } from '../shared/apiClient';

export type Vi = {
  id: number;
  ten: string;
  soDuBanDau: number;
  soDuHienTai: number;
};

export async function getViList(token: string): Promise<Vi[]> {
  const ketQua = await callApi<{ danhSachVi: Vi[] }>('/vi', { token });
  return ketQua.danhSachVi;
}

export async function createVi(token: string, ten: string, soDuBanDau: number): Promise<Vi> {
  const ketQua = await callApi<{ vi: Vi }>('/vi', { method: 'POST', token, body: { ten, soDuBanDau } });
  return ketQua.vi;
}

export async function updateVi(token: string, viId: number, ten: string, soDuBanDau: number): Promise<Vi> {
  const ketQua = await callApi<{ vi: Vi }>(`/vi/${viId}`, { method: 'PUT', token, body: { ten, soDuBanDau } });
  return ketQua.vi;
}

export async function deleteVi(token: string, viId: number): Promise<void> {
  await callApi<void>(`/vi/${viId}`, { method: 'DELETE', token });
}
