import { callApi } from '../shared/apiClient';

export type NguoiDung = {
  id: number;
  email: string;
  tenHienThi: string;
  anhDaiDienUrl: string | null;
};

export type KetQuaDangNhap = {
  token: string;
  nguoiDung: NguoiDung;
};

export function loginApi(email: string, matKhau: string): Promise<KetQuaDangNhap> {
  return callApi<KetQuaDangNhap>('/auth/login', { method: 'POST', body: { email, matKhau } });
}

export function getMeApi(token: string): Promise<{ nguoiDung: NguoiDung }> {
  return callApi<{ nguoiDung: NguoiDung }>('/auth/me', { token });
}

export function registerApi(email: string, matKhau: string, tenHienThi: string): Promise<KetQuaDangNhap> {
  return callApi<KetQuaDangNhap>('/auth/register', { method: 'POST', body: { email, matKhau, tenHienThi } });
}
