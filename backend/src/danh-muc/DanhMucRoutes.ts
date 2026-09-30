import { Router } from 'express';

import requireAuth from '../auth/requireAuth';
import { readIdFromUrl, readOptionalText, readText, readThuOrChi } from '../validation/readInput';
import { addCategory, getCategories, removeCategory } from './DanhMucService';

const danhMucRoutes = Router();

danhMucRoutes.use(requireAuth);

danhMucRoutes.get('/', async (_request, response) => {
  const danhSachDanhMuc = await getCategories(response.locals.nguoiDungId);
  response.json({ danhSachDanhMuc });
});

danhMucRoutes.post('/', async (request, response) => {
  const ten = readText(request.body?.ten, 'tên danh mục');
  const loai = readThuOrChi(request.body?.loai);
  const bieuTuong = readOptionalText(request.body?.bieuTuong);

  const danhMuc = await addCategory(response.locals.nguoiDungId, ten, loai, bieuTuong);
  response.status(201).json({ danhMuc });
});

danhMucRoutes.delete('/:id', async (request, response) => {
  const danhMucId = readIdFromUrl(request.params.id);
  await removeCategory(danhMucId, response.locals.nguoiDungId);
  response.status(204).end();
});

export default danhMucRoutes;
