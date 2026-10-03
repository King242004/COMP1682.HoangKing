import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { HttpError } from '../errors/HttpError';
import jwtSecret from './jwtSecret';

// Middleware cho các route cần người dùng đã đăng nhập.
// Đọc "Authorization: Bearer <token>", kiểm tra, rồi đặt id người dùng vào res.locals.nguoiDungId.
export default function requireAuth(request: Request, response: Response, next: NextFunction) {
  const header = request.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';

  if (!token) {
    throw new HttpError(401, 'Bạn cần đăng nhập');
  }

  try {
    // Cố định thuật toán, nên token ký bằng thuật toán khác luôn bị từ chối.
    const payload = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
    response.locals.nguoiDungId = Number(payload.sub);
  } catch {
    throw new HttpError(401, 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
  }

  next();
}
