import { Router, type Request } from 'express';

import requireAuth from '../auth/requireAuth';
import {
  readDate,
  readIdFromUrl,
  readOptionalText,
  readPositiveInteger,
  readThuOrChi,
} from '../validation/readInput';
import type { DuLieuGiaoDich } from './GiaoDichQueries';
import { addTransaction, editTransaction, getTransactions, removeTransaction } from './GiaoDichService';

const giaoDichRoutes = Router();

giaoDichRoutes.use(requireAuth);

function readTransactionBody(request: Request): DuLieuGiaoDich {
  return {
    viId: readPositiveInteger(request.body?.viId, 'Ví'),
    danhMucId: readPositiveInteger(request.body?.danhMucId, 'Danh mục'),
    loai: readThuOrChi(request.body?.loai),
    soTien: readPositiveInteger(request.body?.soTien, 'Số tiền'),
    ngay: readDate(request.body?.ngay, 'Ngày'),
    ghiChu: readOptionalText(request.body?.ghiChu),
    anhUrl: readOptionalText(request.body?.anhUrl),
    // Không bắt buộc: giao dịch này trả kỳ ngày kyNgay của một khoản sắp tới. Có cả hai hoặc không có cả hai.
    khoanSapToiId:
      request.body?.khoanSapToiId == null ? null : readPositiveInteger(request.body.khoanSapToiId, 'Khoản sắp tới'),
    kyNgay: request.body?.khoanSapToiId == null ? null : readDate(request.body?.kyNgay, 'Kỳ của khoản sắp tới'),
  };
}

// Ví dụ: GET /giao-dich?tuNgay=2026-10-01&denNgay=2026-10-31&viId=2 (viId không bắt buộc)
giaoDichRoutes.get('/', async (request, response) => {
  const tuNgay = readDate(request.query.tuNgay, 'Từ ngày');
  const denNgay = readDate(request.query.denNgay, 'Đến ngày');
  const viId = request.query.viId ? readIdFromUrl(String(request.query.viId)) : null;

  const danhSachGiaoDich = await getTransactions(response.locals.nguoiDungId, tuNgay, denNgay, viId);
  response.json({ danhSachGiaoDich });
});

giaoDichRoutes.post('/', async (request, response) => {
  const giaoDich = await addTransaction(response.locals.nguoiDungId, readTransactionBody(request));
  response.status(201).json({ giaoDich });
});

giaoDichRoutes.put('/:id', async (request, response) => {
  const giaoDichId = readIdFromUrl(request.params.id);
  const giaoDich = await editTransaction(giaoDichId, response.locals.nguoiDungId, readTransactionBody(request));
  response.json({ giaoDich });
});

giaoDichRoutes.delete('/:id', async (request, response) => {
  const giaoDichId = readIdFromUrl(request.params.id);
  await removeTransaction(giaoDichId, response.locals.nguoiDungId);
  response.status(204).end();
});

export default giaoDichRoutes;
