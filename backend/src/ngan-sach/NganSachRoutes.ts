import { Router } from 'express';

import requireAuth from '../auth/requireAuth';
import { HttpError } from '../errors/HttpError';
import { readIdFromUrl, readPositiveInteger, readText } from '../validation/readInput';
import { addBudget, getBudgets, removeBudget } from './NganSachService';

const nganSachRoutes = Router();

nganSachRoutes.use(requireAuth);

nganSachRoutes.get('/', async (_request, response) => {
  const danhSachNganSach = await getBudgets(response.locals.nguoiDungId);
  response.json({ danhSachNganSach });
});

nganSachRoutes.post('/', async (request, response) => {
  const chuKy = request.body?.chuKy;
  if (chuKy !== 'tuan' && chuKy !== 'thang') {
    throw new HttpError(400, 'Chu kỳ phải là "tuan" hoặc "thang"');
  }

  const nganSachId = await addBudget(
    response.locals.nguoiDungId,
    readText(request.body?.ten, 'tên ngân sách'),
    readPositiveInteger(request.body?.soTien, 'Số tiền'),
    chuKy,
    request.body?.danhMucId == null ? null : readPositiveInteger(request.body.danhMucId, 'Danh mục'),
  );
  response.status(201).json({ nganSachId });
});

nganSachRoutes.delete('/:id', async (request, response) => {
  await removeBudget(readIdFromUrl(request.params.id), response.locals.nguoiDungId);
  response.status(204).end();
});

export default nganSachRoutes;
