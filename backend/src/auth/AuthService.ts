import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

import { HttpError } from '../errors/HttpError';
import jwtSecret from './jwtSecret';
import { createUser, findUserByEmail, findUserById, type NguoiDung } from './AuthQueries';

type KetQuaDangNhap = {
  token: string;
  nguoiDung: NguoiDung;
};

function createToken(nguoiDungId: number): string {
  return jwt.sign({ sub: String(nguoiDungId) }, jwtSecret, { algorithm: 'HS256', expiresIn: '30d' });
}

export async function register(email: string, matKhau: string, tenHienThi: string): Promise<KetQuaDangNhap> {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new HttpError(409, 'Email này đã được đăng ký');
  }

  // argon2.hash dùng Argon2id với tham số mặc định của thư viện.
  const matKhauBam = await argon2.hash(matKhau);
  const nguoiDung = await createUser(email, matKhauBam, tenHienThi);

  return { token: createToken(nguoiDung.id), nguoiDung };
}

export async function login(email: string, matKhau: string): Promise<KetQuaDangNhap> {
  const user = await findUserByEmail(email);

  // Cùng một thông báo cho "không có email này" và "sai mật khẩu", để không ai dò được email nào đã đăng ký.
  if (!user || !(await argon2.verify(user.matKhauBam, matKhau))) {
    throw new HttpError(401, 'Email hoặc mật khẩu không đúng');
  }

  const nguoiDung: NguoiDung = {
    id: user.id,
    email: user.email,
    tenHienThi: user.tenHienThi,
    anhDaiDienUrl: user.anhDaiDienUrl,
  };

  return { token: createToken(nguoiDung.id), nguoiDung };
}

export async function getCurrentUser(nguoiDungId: number): Promise<NguoiDung> {
  const nguoiDung = await findUserById(nguoiDungId);
  if (!nguoiDung) {
    throw new HttpError(404, 'Không tìm thấy tài khoản');
  }
  return nguoiDung;
}
