import { Router } from 'express';

import requireAuth from '../auth/requireAuth';
import { HttpError } from '../errors/HttpError';
import { readDate, readIdFromUrl, readPositiveInteger, readText, readThuOrChi } from '../validation/readInput';
import { addItem, getMyItems, removeItem } from './KhoanSapToiService';

const khoanSapToiRoutes = Router();

khoanSapToiRoutes.use(requireAuth);

khoanSapToiRoutes.get('/', async (_request, response) => {
  const danhSachKhoan = await getMyItems(response.locals.nguoiDungId);
  response.json({ danhSachKhoan });
});

khoanSapToiRoutes.post('/', async (request, response) => {
  const lapLai = request.body?.lapLai;
  if (lapLai !== 'khong' && lapLai !== 'tuan' && lapLai !== 'thang') {
    throw new HttpError(400, 'Lặp lại phải là "khong", "tuan" hoặc "thang"');
  }

  const khoanId = await addItem(response.locals.nguoiDungId, {
    ten: readText(request.body?.ten, 'tên khoản'),
    loai: readThuOrChi(request.body?.loai),
    soTien: readPositiveInteger(request.body?.soTien, 'Số tiền'),
    ngayBatDau: readDate(request.body?.ngayBatDau, 'Ngày'),
    lapLai,
    ngayKetThuc: request.body?.ngayKetThuc ? readDate(request.body.ngayKetThuc, 'Ngày kết thúc') : null,
  });
  response.status(201).json({ khoanId });
});

khoanSapToiRoutes.delete('/:id', async (request, response) => {
  await removeItem(readIdFromUrl(request.params.id), response.locals.nguoiDungId);
  response.status(204).end();
});

export default khoanSapToiRoutes;
