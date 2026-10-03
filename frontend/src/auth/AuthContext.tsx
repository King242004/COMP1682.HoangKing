import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

import { getMeApi, loginApi, registerApi, type NguoiDung } from '../api/authApi';
import { ApiError } from '../shared/apiClient';

// Tên ô trong bộ nhớ bảo mật của điện thoại (iOS Keychain / Android Keystore) dùng để giữ token.
const TOKEN_KEY = 'evenwise-token';

type AuthContextValue = {
  token: string | null;
  nguoiDung: NguoiDung | null;
  dangKiemTra: boolean;
  login: (email: string, matKhau: string) => Promise<void>;
  register: (email: string, matKhau: string, tenHienThi: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Giữ thông tin ai đang đăng nhập cho cả app, và nhớ cả sau khi tắt app.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [nguoiDung, setNguoiDung] = useState<NguoiDung | null>(null);
  const [dangKiemTra, setDangKiemTra] = useState(true);

  // Khi mở app: đọc token đã lưu và hỏi backend token đó là của ai.
  useEffect(() => {
    async function restoreLogin() {
      try {
        const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!savedToken) {
          return;
        }

        const ketQua = await getMeApi(savedToken);
        setToken(savedToken);
        setNguoiDung(ketQua.nguoiDung);
      } catch (error) {
        // 401 = token hết hạn hoặc không hợp lệ, nên xóa đi. Lỗi khác (mất mạng) thì vẫn giữ,
        // để lần sau mở app có mạng là người dùng được đăng nhập lại.
        if (error instanceof ApiError && error.status === 401) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
      } finally {
        setDangKiemTra(false);
      }
    }

    restoreLogin();
  }, []);

  async function saveLogin(newToken: string, newNguoiDung: NguoiDung) {
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    setToken(newToken);
    setNguoiDung(newNguoiDung);
  }

  async function login(email: string, matKhau: string) {
    const ketQua = await loginApi(email, matKhau);
    await saveLogin(ketQua.token, ketQua.nguoiDung);
  }

  async function register(email: string, matKhau: string, tenHienThi: string) {
    const ketQua = await registerApi(email, matKhau, tenHienThi);
    await saveLogin(ketQua.token, ketQua.nguoiDung);
  }

  async function logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setNguoiDung(null);
  }

  return (
    <AuthContext.Provider value={{ token, nguoiDung, dangKiemTra, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth phải dùng bên trong AuthProvider');
  }
  return value;
}
