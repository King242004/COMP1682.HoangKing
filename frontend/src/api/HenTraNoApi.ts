import { callApi } from '../shared/apiClient';

// "I will pay all my debt in this group by ngayHen" (saving again replaces the date).
export async function henTraNo(token: string, nhomId: number, ngayHen: string): Promise<void> {
  await callApi<void>(`/nhom/${nhomId}/hen-tra-no`, { method: 'PUT', token, body: { ngayHen } });
}

export async function boHenTraNo(token: string, nhomId: number): Promise<void> {
  await callApi<void>(`/nhom/${nhomId}/hen-tra-no`, { method: 'DELETE', token });
}
