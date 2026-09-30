import database from '../database/database';

export type NganSach = {
  id: number;
  ten: string;
  soTien: number;
  chuKy: 'tuan' | 'thang';
  danhMucId: number | null;
  tenDanhMuc: string | null;
};

export async function listBudgets(nguoiDungId: number): Promise<NganSach[]> {
  const result = await database.query<NganSach>(
    `SELECT ns.id,
            ns.ten,
            ns.so_tien     AS "soTien",
            ns.chu_ky      AS "chuKy",
            ns.danh_muc_id AS "danhMucId",
            d.ten          AS "tenDanhMuc"
     FROM ngan_sach ns
     LEFT JOIN danh_muc d ON d.id = ns.danh_muc_id
     WHERE ns.nguoi_dung_id = $1
     ORDER BY ns.id`,
    [nguoiDungId],
  );
  return result.rows;
}

export async function createBudget(
  nguoiDungId: number,
  ten: string,
  soTien: number,
  chuKy: 'tuan' | 'thang',
  danhMucId: number | null,
  ngayBatDau: string,
): Promise<number> {
  const result = await database.query<{ id: number }>(
    `INSERT INTO ngan_sach (nguoi_dung_id, ten, so_tien, chu_ky, danh_muc_id, ngay_bat_dau)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [nguoiDungId, ten, soTien, chuKy, danhMucId, ngayBatDau],
  );
  return result.rows[0].id;
}

export async function budgetBelongsToUser(nganSachId: number, nguoiDungId: number): Promise<boolean> {
  const result = await database.query('SELECT 1 FROM ngan_sach WHERE id = $1 AND nguoi_dung_id = $2', [
    nganSachId,
    nguoiDungId,
  ]);
  return (result.rowCount ?? 0) > 0;
}

export async function deleteBudget(nganSachId: number): Promise<void> {
  await database.query('DELETE FROM ngan_sach WHERE id = $1', [nganSachId]);
}
