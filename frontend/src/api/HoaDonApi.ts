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
  // Có giá trị khi hóa đơn thuộc một kế hoạch nhóm.
  khoanSapToiId: number | null;
  // Chia 'deu' thì chỉ dùng nguoiDungId; backend tự chia số tiền.
  phanChia: { nguoiDungId: number; soTien: number }[];
};

export async function createHoaDon(token: string, nhomId: number, yeuCau: YeuCauThemHoaDon): Promise<void> {
  await callApi<{ hoaDonId: number }>(`/nhom/${nhomId}/hoa-don`, { method: 'POST', token, body: yeuCau });
}

export async function deleteHoaDon(token: string, nhomId: number, hoaDonId: number): Promise<void> {
  await callApi<void>(`/nhom/${nhomId}/hoa-don/${hoaDonId}`, { method: 'DELETE', token });
}
