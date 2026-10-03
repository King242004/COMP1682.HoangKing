import { callApi } from '../shared/apiClient';

// Một dòng tiền của tôi: giao dịch cá nhân, hoặc phần của tôi trong hóa đơn nhóm (nguon = 'nhom').
export type GiaoDich = {
  id: number;
  nguon: 'ca_nhan' | 'nhom';
  nhomId: number | null;
  loai: 'thu' | 'chi';
  soTien: number;
  ngay: string;
  ghiChu: string | null;
  anhUrl: string | null;
  viId: number | null;
  tenVi: string;
  danhMucId: number;
  tenDanhMuc: string;
  bieuTuongDanhMuc: string;
};

export type DuLieuGiaoDich = {
  viId: number;
  danhMucId: number;
  loai: 'thu' | 'chi';
  soTien: number;
  ngay: string;
  ghiChu: string | null;
  anhUrl: string | null;
  // Có giá trị khi giao dịch này trả một kỳ của khoản sắp tới.
  khoanSapToiId: number | null;
  kyNgay: string | null;
};

// viId = null nghĩa là "tất cả ví".
export async function getGiaoDichList(
  token: string,
  tuNgay: string,
  denNgay: string,
  viId: number | null,
): Promise<GiaoDich[]> {
  const locVi = viId ? `&viId=${viId}` : '';
  const ketQua = await callApi<{ danhSachGiaoDich: GiaoDich[] }>(
    `/giao-dich?tuNgay=${tuNgay}&denNgay=${denNgay}${locVi}`,
    { token },
  );
  return ketQua.danhSachGiaoDich;
}

export async function createGiaoDich(token: string, duLieu: DuLieuGiaoDich): Promise<GiaoDich> {
  const ketQua = await callApi<{ giaoDich: GiaoDich }>('/giao-dich', { method: 'POST', token, body: duLieu });
  return ketQua.giaoDich;
}

export async function updateGiaoDich(token: string, giaoDichId: number, duLieu: DuLieuGiaoDich): Promise<GiaoDich> {
  const ketQua = await callApi<{ giaoDich: GiaoDich }>(`/giao-dich/${giaoDichId}`, {
    method: 'PUT',
    token,
    body: duLieu,
  });
  return ketQua.giaoDich;
}

export async function deleteGiaoDich(token: string, giaoDichId: number): Promise<void> {
  await callApi<void>(`/giao-dich/${giaoDichId}`, { method: 'DELETE', token });
}
