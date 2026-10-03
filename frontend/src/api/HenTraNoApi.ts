import { callApi } from '../shared/apiClient';

// "Tôi sẽ trả hết nợ nhóm này trước ngayHen" (lưu lần nữa thì thay ngày cũ).
export async function henTraNo(token: string, nhomId: number, ngayHen: string): Promise<void> {
  await callApi<void>(`/nhom/${nhomId}/hen-tra-no`, { method: 'PUT', token, body: { ngayHen } });
}

export async function boHenTraNo(token: string, nhomId: number): Promise<void> {
  await callApi<void>(`/nhom/${nhomId}/hen-tra-no`, { method: 'DELETE', token });
}
