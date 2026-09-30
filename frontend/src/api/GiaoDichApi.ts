import { callApi } from '../shared/apiClient';

// One line of my money: a personal transaction, or my share of a group bill (nguon = 'nhom').
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
  // Set when this pays one occurrence of an upcoming item.
  khoanSapToiId: number | null;
  kyNgay: string | null;
};

// viId = null means "all wallets".
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
