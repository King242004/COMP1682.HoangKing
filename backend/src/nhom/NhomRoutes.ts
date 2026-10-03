import { Router } from 'express';

import requireAuth from '../auth/requireAuth';
import { readIdFromUrl, readText } from '../validation/readInput';
import { createGroup, getGroupDetail, getMyGroups, joinGroup } from './NhomService';

const nhomRoutes = Router();

nhomRoutes.use(requireAuth);

nhomRoutes.get('/', async (_request, response) => {
  const danhSachNhom = await getMyGroups(response.locals.nguoiDungId);
  response.json({ danhSachNhom });
});

nhomRoutes.post('/', async (request, response) => {
  const ten = readText(request.body?.ten, 'tên nhóm');
  const nhom = await createGroup(ten, response.locals.nguoiDungId);
  response.status(201).json({ nhom });
});

// Vào nhóm bằng mã mời 6 ký tự (gõ hoa hay thường đều được, ví dụ "k7q2xm").
nhomRoutes.post('/tham-gia', async (request, response) => {
  const maMoi = readText(request.body?.maMoi, 'mã mời').toUpperCase();
  const nhom = await joinGroup(maMoi, response.locals.nguoiDungId);
  response.json({ nhom });
});

nhomRoutes.get('/:nhomId', async (request, response) => {
  const nhomId = readIdFromUrl(request.params.nhomId);
  const chiTiet = await getGroupDetail(nhomId, response.locals.nguoiDungId);
  response.json(chiTiet);
});

export default nhomRoutes;
