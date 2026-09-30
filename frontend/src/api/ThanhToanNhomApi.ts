import { callApi } from '../shared/apiClient';

// "Đã trả": the logged-in user pays someone in the group.
export async function traTien(
  token: string,
  nhomId: number,
  nguoiNhanId: number,
  soTien: number,
  viTraId: number | null,
): Promise<void> {
  await callApi<{ thanhToanId: number }>(`/nhom/${nhomId}/thanh-toan`, {
    method: 'POST',
    token,
    body: { nguoiNhanId, soTien, viTraId },
  });
}

// "Đã nhận": the receiver confirms a payment.
export async function xacNhanDaNhan(token: string, nhomId: number, thanhToanId: number, viNhanId: number | null): Promise<void> {
  await callApi<void>(`/nhom/${nhomId}/thanh-toan/${thanhToanId}/xac-nhan`, {
    method: 'POST',
    token,
    body: { viNhanId },
  });
}

// The payer takes back a "Đã trả" that is not confirmed yet.
export async function huyThanhToan(token: string, nhomId: number, thanhToanId: number): Promise<void> {
  await callApi<void>(`/nhom/${nhomId}/thanh-toan/${thanhToanId}`, { method: 'DELETE', token });
}
