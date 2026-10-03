import { callApi } from '../shared/apiClient';

// "Đã trả": người đang đăng nhập trả tiền cho một người trong nhóm.
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

// "Đã nhận": người nhận xác nhận một lần trả.
export async function xacNhanDaNhan(token: string, nhomId: number, thanhToanId: number, viNhanId: number | null): Promise<void> {
  await callApi<void>(`/nhom/${nhomId}/thanh-toan/${thanhToanId}/xac-nhan`, {
    method: 'POST',
    token,
    body: { viNhanId },
  });
}

// Người trả rút lại một lần "Đã trả" chưa được xác nhận.
export async function huyThanhToan(token: string, nhomId: number, thanhToanId: number): Promise<void> {
  await callApi<void>(`/nhom/${nhomId}/thanh-toan/${thanhToanId}`, { method: 'DELETE', token });
}
