import { callApi } from '../shared/apiClient';

export type HanMucNgay = {
  ngayCoTien: string;
  soNgayConLai: number;
  tienDungDuoc: number;
  coTheTieuMoiNgay: number;
  muonTieuMoiNgay: number | null;
  moiNgayDuocTieu: number;
  gioiHanBoi: 'tien_that' | 'ngan_sach';
  themNeuDuocTra: number;
};

export type NhacNho = {
  mucDo: 'vang' | 'do';
  noiDung: string;
  // 0 when the reminder is not about a group (e.g. "money runs out on …").
  nhomId: number;
};

export type KhoanTrenLich = {
  ngay: string;
  ten: string;
  soTien: number;
  loai: 'thu' | 'chi';
  nguon: 'ca_nhan' | 'no_nhom' | 'ke_hoach_nhom';
  khoanSapToiId: number | null;
};

export type DuBao = {
  homNay: string;
  coVi: boolean;
  soDuVi: number;
  tongDangNo: number;
  sapDuocTra: number;
  tocDoTieu: number;
  hanMuc: HanMucNgay;
  ngayHetTien: string | null;
  nhacNho: NhacNho[];
  khoanTrenLich: KhoanTrenLich[];
};

// lichTu / lichDen: the days whose upcoming items should be listed (e.g. the month on the calendar).
export function getDuBao(token: string, lichTu: string, lichDen: string): Promise<DuBao> {
  return callApi<DuBao>(`/du-bao?lichTu=${lichTu}&lichDen=${lichDen}`, { token });
}
