import { Router } from 'express';

import requireAuth from '../auth/requireAuth';
import { readDate, readIdFromUrl } from '../validation/readInput';
import { cancelPromise, promiseToPay } from './HenTraNoService';

// Gắn ở /nhom/:nhomId/hen-tra-no. Luôn là hẹn của chính người đang đăng nhập.
const henTraNoRoutes = Router({ mergeParams: true });

henTraNoRoutes.use(requireAuth);

henTraNoRoutes.put<{ nhomId: string }>('/', async (request, response) => {
  const nhomId = readIdFromUrl(request.params.nhomId);
  const ngayHen = readDate(request.body?.ngayHen, 'Ngày hẹn');
  await promiseToPay(nhomId, response.locals.nguoiDungId, ngayHen);
  response.status(204).end();
});

henTraNoRoutes.delete<{ nhomId: string }>('/', async (request, response) => {
  const nhomId = readIdFromUrl(request.params.nhomId);
  await cancelPromise(nhomId, response.locals.nguoiDungId);
  response.status(204).end();
});

export default henTraNoRoutes;
