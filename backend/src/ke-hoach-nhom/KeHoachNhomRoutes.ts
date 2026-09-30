import { Router } from 'express';

import requireAuth from '../auth/requireAuth';
import { readDate, readIdFromUrl, readPositiveInteger, readText } from '../validation/readInput';
import { addPlan, join, leave, removePlan } from './KeHoachNhomService';

// Mounted at /nhom/:nhomId/ke-hoach.
const keHoachNhomRoutes = Router({ mergeParams: true });

keHoachNhomRoutes.use(requireAuth);

keHoachNhomRoutes.post<{ nhomId: string }>('/', async (request, response) => {
  const keHoachId = await addPlan(
    readIdFromUrl(request.params.nhomId),
    response.locals.nguoiDungId,
    readText(request.body?.ten, 'tên kế hoạch'),
    readPositiveInteger(request.body?.soTienMoiNguoi, 'Số tiền mỗi người'),
    readDate(request.body?.ngay, 'Ngày'),
  );
  response.status(201).json({ keHoachId });
});

keHoachNhomRoutes.post<{ nhomId: string; keHoachId: string }>('/:keHoachId/tham-gia', async (request, response) => {
  await join(readIdFromUrl(request.params.nhomId), readIdFromUrl(request.params.keHoachId), response.locals.nguoiDungId);
  response.status(204).end();
});

keHoachNhomRoutes.delete<{ nhomId: string; keHoachId: string }>('/:keHoachId/tham-gia', async (request, response) => {
  await leave(readIdFromUrl(request.params.nhomId), readIdFromUrl(request.params.keHoachId), response.locals.nguoiDungId);
  response.status(204).end();
});

keHoachNhomRoutes.delete<{ nhomId: string; keHoachId: string }>('/:keHoachId', async (request, response) => {
  await removePlan(
    readIdFromUrl(request.params.nhomId),
    readIdFromUrl(request.params.keHoachId),
    response.locals.nguoiDungId,
  );
  response.status(204).end();
});

export default keHoachNhomRoutes;
