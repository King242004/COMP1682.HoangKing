import { callApi } from '../shared/apiClient';

export type YeuCauThemHoaDon = {
  ten: string;
  nguoiTraId: number;
  viId: number | null;
  danhMucId: number;
  soTien: number;
  ngay: string;
  ghiChu: string | null;
  anhUrl: string | null;
  cachChia: 'deu' | 'tuy_chinh';
  // Set when the bill belongs to a group plan.
  khoanSapToiId: number | null;
  // For 'deu' only nguoiDungId is used; the backend splits the amount itself.
  phanChia: { nguoiDungId: number; soTien: number }[];
};

export async function createHoaDon(token: string, nhomId: number, yeuCau: YeuCauThemHoaDon): Promise<void> {
  await callApi<{ hoaDonId: number }>(`/nhom/${nhomId}/hoa-don`, { method: 'POST', token, body: yeuCau });
}

export async function deleteHoaDon(token: string, nhomId: number, hoaDonId: number): Promise<void> {
  await callApi<void>(`/nhom/${nhomId}/hoa-don/${hoaDonId}`, { method: 'DELETE', token });
}
