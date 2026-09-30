import { callApi } from '../shared/apiClient';

export async function createKeHoach(
  token: string,
  nhomId: number,
  ten: string,
  soTienMoiNguoi: number,
  ngay: string,
): Promise<void> {
  await callApi<{ keHoachId: number }>(`/nhom/${nhomId}/ke-hoach`, {
    method: 'POST',
    token,
    body: { ten, soTienMoiNguoi, ngay },
  });
}

export async function thamGiaKeHoach(token: string, nhomId: number, keHoachId: number): Promise<void> {
  await callApi<void>(`/nhom/${nhomId}/ke-hoach/${keHoachId}/tham-gia`, { method: 'POST', token });
}

export async function roiKeHoach(token: string, nhomId: number, keHoachId: number): Promise<void> {
  await callApi<void>(`/nhom/${nhomId}/ke-hoach/${keHoachId}/tham-gia`, { method: 'DELETE', token });
}

export async function deleteKeHoach(token: string, nhomId: number, keHoachId: number): Promise<void> {
  await callApi<void>(`/nhom/${nhomId}/ke-hoach/${keHoachId}`, { method: 'DELETE', token });
}
