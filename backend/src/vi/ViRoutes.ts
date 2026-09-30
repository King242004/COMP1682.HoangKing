import { Router } from 'express';

import requireAuth from '../auth/requireAuth';
import { readIdFromUrl, readNonNegativeInteger, readText } from '../validation/readInput';
import { addWallet, editWallet, getWallets, removeWallet } from './ViService';

const viRoutes = Router();

viRoutes.use(requireAuth);

viRoutes.get('/', async (_request, response) => {
  const danhSachVi = await getWallets(response.locals.nguoiDungId);
  response.json({ danhSachVi });
});

viRoutes.post('/', async (request, response) => {
  const ten = readText(request.body?.ten, 'tên ví');
  const soDuBanDau = readNonNegativeInteger(request.body?.soDuBanDau ?? 0, 'Số dư ban đầu');

  const vi = await addWallet(response.locals.nguoiDungId, ten, soDuBanDau);
  response.status(201).json({ vi });
});

viRoutes.put('/:id', async (request, response) => {
  const viId = readIdFromUrl(request.params.id);
  const ten = readText(request.body?.ten, 'tên ví');
  const soDuBanDau = readNonNegativeInteger(request.body?.soDuBanDau, 'Số dư ban đầu');

  const vi = await editWallet(viId, response.locals.nguoiDungId, ten, soDuBanDau);
  response.json({ vi });
});

viRoutes.delete('/:id', async (request, response) => {
  const viId = readIdFromUrl(request.params.id);
  await removeWallet(viId, response.locals.nguoiDungId);
  response.status(204).end();
});

export default viRoutes;
