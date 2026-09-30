import { HttpError } from '../errors/HttpError';
import {
  countWalletUsage,
  createWallet,
  deleteWallet,
  findWalletOfUser,
  listWallets,
  updateWallet,
  type Vi,
} from './ViQueries';

export async function getWallets(nguoiDungId: number): Promise<Vi[]> {
  return listWallets(nguoiDungId);
}

// Used by other services (giao dịch, hóa đơn…) to make sure a wallet belongs to the caller.
export async function getWalletOfUser(viId: number, nguoiDungId: number): Promise<Vi> {
  const vi = await findWalletOfUser(viId, nguoiDungId);
  if (!vi) {
    throw new HttpError(404, 'Không tìm thấy ví');
  }
  return vi;
}

export async function addWallet(nguoiDungId: number, ten: string, soDuBanDau: number): Promise<Vi> {
  const viId = await createWallet(nguoiDungId, ten, soDuBanDau);
  return getWalletOfUser(viId, nguoiDungId);
}

export async function editWallet(viId: number, nguoiDungId: number, ten: string, soDuBanDau: number): Promise<Vi> {
  await getWalletOfUser(viId, nguoiDungId);
  await updateWallet(viId, ten, soDuBanDau);
  return getWalletOfUser(viId, nguoiDungId);
}

export async function removeWallet(viId: number, nguoiDungId: number): Promise<void> {
  await getWalletOfUser(viId, nguoiDungId);

  if ((await countWalletUsage(viId)) > 0) {
    throw new HttpError(409, 'Ví này đã có giao dịch nên không xóa được');
  }
  await deleteWallet(viId);
}
