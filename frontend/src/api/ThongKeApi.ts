import { callApi } from '../shared/apiClient';

export type ChiTheoDanhMuc = {
  danhMucId: number;
  tenDanhMuc: string;
  bieuTuong: string;
  soTien: number;
};

export type ThongKe = {
  tongThu: number;
  tongChi: number;
  chiTheoDanhMuc: ChiTheoDanhMuc[];
};

export function getThongKe(token: string, tuNgay: string, denNgay: string): Promise<ThongKe> {
  return callApi<ThongKe>(`/thong-ke?tuNgay=${tuNgay}&denNgay=${denNgay}`, { token });
}
