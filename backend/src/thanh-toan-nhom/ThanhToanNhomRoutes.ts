import { Router } from 'express';

import requireAuth from '../auth/requireAuth';
import { readIdFromUrl, readPositiveInteger } from '../validation/readInput';
import { cancelPayment, receivePayment, sendPayment } from './ThanhToanNhomService';

// Mounted at /nhom/:nhomId/thanh-toan, so it needs mergeParams to see :nhomId.
const thanhToanNhomRoutes = Router({ mergeParams: true });

thanhToanNhomRoutes.use(requireAuth);

// "Đã trả": the logged-in user pays someone in the group.
thanhToanNhomRoutes.post<{ nhomId: string }>('/', async (request, response) => {
  const nhomId = readIdFromUrl(request.params.nhomId);
  const nguoiNhanId = readPositiveInteger(request.body?.nguoiNhanId, 'Người nhận');
  const soTien = readPositiveInteger(request.body?.soTien, 'Số tiền');
  const viTraId = request.body?.viTraId == null ? null : readPositiveInteger(request.body.viTraId, 'Ví');

  const thanhToanId = await sendPayment(nhomId, response.locals.nguoiDungId, nguoiNhanId, soTien, viTraId);
  response.status(201).json({ thanhToanId });
});

// "Đã nhận": the receiver confirms.
thanhToanNhomRoutes.post<{ nhomId: string; thanhToanId: string }>('/:thanhToanId/xac-nhan', async (request, response) => {
  const nhomId = readIdFromUrl(request.params.nhomId);
  const thanhToanId = readIdFromUrl(request.params.thanhToanId);
  const viNhanId = request.body?.viNhanId == null ? null : readPositiveInteger(request.body.viNhanId, 'Ví');

  await receivePayment(nhomId, thanhToanId, response.locals.nguoiDungId, viNhanId);
  response.status(204).end();
});

thanhToanNhomRoutes.delete<{ nhomId: string; thanhToanId: string }>('/:thanhToanId', async (request, response) => {
  const nhomId = readIdFromUrl(request.params.nhomId);
  const thanhToanId = readIdFromUrl(request.params.thanhToanId);
  await cancelPayment(nhomId, thanhToanId, response.locals.nguoiDungId);
  response.status(204).end();
});

export default thanhToanNhomRoutes;
