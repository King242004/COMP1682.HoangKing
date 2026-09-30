import database from '../database/database';

export type Vi = {
  id: number;
  ten: string;
  soDuBanDau: number;
  soDuHienTai: number;
};

// Current balance = starting balance
//   + personal income − personal spending recorded with this wallet
//   − group bills paid from this wallet
//   + confirmed debt payments received into this wallet − confirmed debt payments sent from it.
const SELECT_VI_KEM_SO_DU = `
  SELECT v.id,
         v.ten,
         v.so_du_ban_dau AS "soDuBanDau",
         v.so_du_ban_dau
           + (SELECT COALESCE(SUM(CASE WHEN g.loai = 'thu' THEN g.so_tien ELSE -g.so_tien END), 0)
              FROM giao_dich g WHERE g.vi_id = v.id)
           - (SELECT COALESCE(SUM(h.so_tien), 0)
              FROM hoa_don h WHERE h.vi_id = v.id)
           + (SELECT COALESCE(SUM(t.so_tien), 0)
              FROM thanh_toan_nhom t WHERE t.vi_nhan_id = v.id AND t.trang_thai = 'da_nhan')
           - (SELECT COALESCE(SUM(t.so_tien), 0)
              FROM thanh_toan_nhom t WHERE t.vi_tra_id = v.id AND t.trang_thai = 'da_nhan')
         AS "soDuHienTai"
  FROM vi v
`;

export async function listWallets(nguoiDungId: number): Promise<Vi[]> {
  const result = await database.query<Vi>(`${SELECT_VI_KEM_SO_DU} WHERE v.nguoi_dung_id = $1 ORDER BY v.id`, [
    nguoiDungId,
  ]);
  return result.rows;
}

export async function findWalletOfUser(viId: number, nguoiDungId: number): Promise<Vi | undefined> {
  const result = await database.query<Vi>(`${SELECT_VI_KEM_SO_DU} WHERE v.id = $1 AND v.nguoi_dung_id = $2`, [
    viId,
    nguoiDungId,
  ]);
  return result.rows[0];
}

export async function createWallet(nguoiDungId: number, ten: string, soDuBanDau: number): Promise<number> {
  const result = await database.query<{ id: number }>(
    'INSERT INTO vi (nguoi_dung_id, ten, so_du_ban_dau) VALUES ($1, $2, $3) RETURNING id',
    [nguoiDungId, ten, soDuBanDau],
  );
  return result.rows[0].id;
}

export async function updateWallet(viId: number, ten: string, soDuBanDau: number): Promise<void> {
  await database.query('UPDATE vi SET ten = $1, so_du_ban_dau = $2 WHERE id = $3', [ten, soDuBanDau, viId]);
}

// How many records still point to this wallet. A wallet in use cannot be deleted.
export async function countWalletUsage(viId: number): Promise<number> {
  const result = await database.query<{ soLan: number }>(
    `SELECT (SELECT COUNT(*) FROM giao_dich WHERE vi_id = $1)
          + (SELECT COUNT(*) FROM hoa_don WHERE vi_id = $1)
          + (SELECT COUNT(*) FROM thanh_toan_nhom WHERE vi_tra_id = $1 OR vi_nhan_id = $1)
          AS "soLan"`,
    [viId],
  );
  return result.rows[0].soLan;
}

export async function deleteWallet(viId: number): Promise<void> {
  await database.query('DELETE FROM vi WHERE id = $1', [viId]);
}
