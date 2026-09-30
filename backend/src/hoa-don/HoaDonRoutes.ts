import { Router, type Request } from 'express';

import requireAuth from '../auth/requireAuth';
import { HttpError } from '../errors/HttpError';
import {
  readDate,
  readIdFromUrl,
  readNonNegativeInteger,
  readOptionalText,
  readPositiveInteger,
  readText,
} from '../validation/readInput';
import { addBill, removeBill, type YeuCauThemHoaDon } from './HoaDonService';

// Mounted at /nhom/:nhomId/hoa-don, so it needs mergeParams to see :nhomId.
const hoaDonRoutes = Router({ mergeParams: true });

hoaDonRoutes.use(requireAuth);

function readBillBody(request: Request): YeuCauThemHoaDon {
  const cachChia = request.body?.cachChia;
  if (cachChia !== 'deu' && cachChia !== 'tuy_chinh') {
    throw new HttpError(400, 'Cách chia phải là "deu" hoặc "tuy_chinh"');
  }

  const phanChiaGuiLen: unknown = request.body?.phanChia;
  if (!Array.isArray(phanChiaGuiLen)) {
    throw new HttpError(400, 'Thiếu danh sách người chia');
  }
  const phanChia = phanChiaGuiLen.map((phan) => ({
    nguoiDungId: readPositiveInteger(phan?.nguoiDungId, 'Người chia'),
    soTien: cachChia === 'tuy_chinh' ? readNonNegativeInteger(phan?.soTien, 'Phần tiền') : 0,
  }));

  return {
    ten: readText(request.body?.ten, 'tên hóa đơn'),
    nguoiTraId: readPositiveInteger(request.body?.nguoiTraId, 'Người trả'),
    viId: request.body?.viId == null ? null : readPositiveInteger(request.body.viId, 'Ví'),
    danhMucId: readPositiveInteger(request.body?.danhMucId, 'Danh mục'),
    soTien: readPositiveInteger(request.body?.soTien, 'Số tiền'),
    ngay: readDate(request.body?.ngay, 'Ngày'),
    ghiChu: readOptionalText(request.body?.ghiChu),
    anhUrl: readOptionalText(request.body?.anhUrl),
    cachChia,
    khoanSapToiId:
      request.body?.khoanSapToiId == null ? null : readPositiveInteger(request.body.khoanSapToiId, 'Kế hoạch'),
    phanChia,
  };
}

hoaDonRoutes.post<{ nhomId: string }>('/', async (request, response) => {
  const nhomId = readIdFromUrl(request.params.nhomId);
  const hoaDonId = await addBill(nhomId, response.locals.nguoiDungId, readBillBody(request));
  response.status(201).json({ hoaDonId });
});

hoaDonRoutes.delete<{ nhomId: string; hoaDonId: string }>('/:hoaDonId', async (request, response) => {
  const nhomId = readIdFromUrl(request.params.nhomId);
  const hoaDonId = readIdFromUrl(request.params.hoaDonId);
  await removeBill(nhomId, hoaDonId, response.locals.nguoiDungId);
  response.status(204).end();
});

export default hoaDonRoutes;
