import database from '../database/database';

export type HenTraNo = {
  nhomId: number;
  nguoiDungId: number;
  ngayHen: string;
};

// One promise per person per group: saving again replaces the old date.
export async function savePromise(nhomId: number, nguoiDungId: number, ngayHen: string): Promise<void> {
  await database.query(
    `INSERT INTO hen_tra_no (nhom_id, nguoi_dung_id, ngay_hen) VALUES ($1, $2, $3)
     ON CONFLICT (nhom_id, nguoi_dung_id) DO UPDATE SET ngay_hen = EXCLUDED.ngay_hen, ngay_tao = now()`,
    [nhomId, nguoiDungId, ngayHen],
  );
}

export async function deletePromise(nhomId: number, nguoiDungId: number): Promise<void> {
  await database.query('DELETE FROM hen_tra_no WHERE nhom_id = $1 AND nguoi_dung_id = $2', [nhomId, nguoiDungId]);
}

export async function listPromisesOfGroup(nhomId: number): Promise<HenTraNo[]> {
  const result = await database.query<HenTraNo>(
    `SELECT nhom_id AS "nhomId", nguoi_dung_id AS "nguoiDungId", ngay_hen AS "ngayHen"
     FROM hen_tra_no WHERE nhom_id = $1`,
    [nhomId],
  );
  return result.rows;
}

export async function listPromisesOfUser(nguoiDungId: number): Promise<HenTraNo[]> {
  const result = await database.query<HenTraNo>(
    `SELECT nhom_id AS "nhomId", nguoi_dung_id AS "nguoiDungId", ngay_hen AS "ngayHen"
     FROM hen_tra_no WHERE nguoi_dung_id = $1`,
    [nguoiDungId],
  );
  return result.rows;
}
