import database from '../database/database';

export type DanhMuc = {
  id: number;
  ten: string;
  loai: 'thu' | 'chi';
  bieuTuong: string;
  laMacDinh: boolean;
};

const SELECT_DANH_MUC = `
  SELECT id,
         ten,
         loai,
         bieu_tuong AS "bieuTuong",
         (nguoi_dung_id IS NULL) AS "laMacDinh"
  FROM danh_muc
`;

// A user sees the default categories plus their own.
export async function listCategories(nguoiDungId: number): Promise<DanhMuc[]> {
  const result = await database.query<DanhMuc>(
    `${SELECT_DANH_MUC}
     WHERE nguoi_dung_id IS NULL OR nguoi_dung_id = $1
     ORDER BY loai DESC, (nguoi_dung_id IS NULL) DESC, id`,
    [nguoiDungId],
  );
  return result.rows;
}

export async function findCategoryVisibleToUser(danhMucId: number, nguoiDungId: number): Promise<DanhMuc | undefined> {
  const result = await database.query<DanhMuc>(
    `${SELECT_DANH_MUC}
     WHERE id = $1 AND (nguoi_dung_id IS NULL OR nguoi_dung_id = $2)`,
    [danhMucId, nguoiDungId],
  );
  return result.rows[0];
}

export async function createCategory(
  nguoiDungId: number,
  ten: string,
  loai: 'thu' | 'chi',
  bieuTuong: string,
): Promise<number> {
  const result = await database.query<{ id: number }>(
    'INSERT INTO danh_muc (nguoi_dung_id, ten, loai, bieu_tuong) VALUES ($1, $2, $3, $4) RETURNING id',
    [nguoiDungId, ten, loai, bieuTuong],
  );
  return result.rows[0].id;
}

export async function countCategoryUsage(danhMucId: number): Promise<number> {
  const result = await database.query<{ soLan: number }>(
    `SELECT (SELECT COUNT(*) FROM giao_dich WHERE danh_muc_id = $1)
          + (SELECT COUNT(*) FROM hoa_don WHERE danh_muc_id = $1)
          + (SELECT COUNT(*) FROM ngan_sach WHERE danh_muc_id = $1)
          AS "soLan"`,
    [danhMucId],
  );
  return result.rows[0].soLan;
}

export async function deleteCategory(danhMucId: number): Promise<void> {
  await database.query('DELETE FROM danh_muc WHERE id = $1', [danhMucId]);
}
