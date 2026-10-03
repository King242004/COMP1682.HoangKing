import { Router } from 'express';

import requireAuth from '../auth/requireAuth';
import { readDate } from '../validation/readInput';
import { getStatistics } from './ThongKeService';

const thongKeRoutes = Router();

thongKeRoutes.use(requireAuth);

// Ví dụ: GET /thong-ke?tuNgay=2026-10-01&denNgay=2026-10-31
thongKeRoutes.get('/', async (request, response) => {
  const tuNgay = readDate(request.query.tuNgay, 'Từ ngày');
  const denNgay = readDate(request.query.denNgay, 'Đến ngày');

  const thongKe = await getStatistics(response.locals.nguoiDungId, tuNgay, denNgay);
  response.json(thongKe);
});

export default thongKeRoutes;
