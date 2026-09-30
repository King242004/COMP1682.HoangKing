import { Router } from 'express';

import { HttpError } from '../errors/HttpError';
import requireAuth from './requireAuth';
import { getCurrentUser, login, register } from './AuthService';

const MAT_KHAU_TOI_THIEU = 8;

const authRoutes = Router();

function readEmail(value: unknown): string {
  const email = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, 'Email không hợp lệ');
  }
  return email;
}

function readPassword(value: unknown): string {
  if (typeof value !== 'string' || value.length < MAT_KHAU_TOI_THIEU) {
    throw new HttpError(400, `Mật khẩu cần ít nhất ${MAT_KHAU_TOI_THIEU} ký tự`);
  }
  return value;
}

authRoutes.post('/register', async (request, response) => {
  const email = readEmail(request.body?.email);
  const matKhau = readPassword(request.body?.matKhau);
  const tenHienThi = typeof request.body?.tenHienThi === 'string' ? request.body.tenHienThi.trim() : '';

  if (!tenHienThi) {
    throw new HttpError(400, 'Vui lòng nhập tên hiển thị');
  }

  const ketQua = await register(email, matKhau, tenHienThi);
  response.status(201).json(ketQua);
});

authRoutes.post('/login', async (request, response) => {
  const email = readEmail(request.body?.email);
  const matKhau = typeof request.body?.matKhau === 'string' ? request.body.matKhau : '';

  const ketQua = await login(email, matKhau);
  response.json(ketQua);
});

authRoutes.get('/me', requireAuth, async (_request, response) => {
  const nguoiDung = await getCurrentUser(response.locals.nguoiDungId);
  response.json({ nguoiDung });
});

export default authRoutes;
