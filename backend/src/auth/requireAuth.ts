import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { HttpError } from '../errors/HttpError';
import jwtSecret from './jwtSecret';

// Middleware for routes that need a logged-in user.
// Reads "Authorization: Bearer <token>", checks it, then puts the user id in res.locals.nguoiDungId.
export default function requireAuth(request: Request, response: Response, next: NextFunction) {
  const header = request.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';

  if (!token) {
    throw new HttpError(401, 'Bạn cần đăng nhập');
  }

  try {
    // The algorithm is fixed so a token signed with another algorithm is always rejected.
    const payload = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
    response.locals.nguoiDungId = Number(payload.sub);
  } catch {
    throw new HttpError(401, 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
  }

  next();
}
