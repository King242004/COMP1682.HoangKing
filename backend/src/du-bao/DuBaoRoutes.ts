import { Router } from 'express';

import requireAuth from '../auth/requireAuth';
import { HttpError } from '../errors/HttpError';
import { readDate } from '../validation/readInput';
import { getForecast } from './DuBaoService';

const duBaoRoutes = Router();

duBaoRoutes.use(requireAuth);

// Example: GET /du-bao?lichTu=2026-10-01&lichDen=2026-10-31 (the month the calendar shows).
duBaoRoutes.get('/', async (request, response) => {
  const lichTu = readDate(request.query.lichTu, 'Từ ngày');
  const lichDen = readDate(request.query.lichDen, 'Đến ngày');
  if (lichTu > lichDen) {
    throw new HttpError(400, 'Ngày bắt đầu phải trước ngày kết thúc');
  }

  const duBao = await getForecast(response.locals.nguoiDungId, lichTu, lichDen);
  response.json(duBao);
});

export default duBaoRoutes;
