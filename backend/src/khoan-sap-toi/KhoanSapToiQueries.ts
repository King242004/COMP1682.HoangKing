import database from '../database/database';
import withTransaction from '../database/withTransaction';

export type KhoanSapToi = {
  id: number;
  ten: string;
  loai: 'thu' | 'chi';
  soTien: number;
  ngayBatDau: string;
  lapLai: 'khong' | 'tuan' | 'thang';
  ngayKetThuc: string | null;
};

export type DuLieuKhoanSapToi = Omit<KhoanSapToi, 'id'>;

const SELECT_KHOAN = `
  SELECT id,
         ten,
         loai,
         so_tien       AS "soTien",
         ngay_bat_dau  AS "ngayBatDau",
         lap_lai       AS "lapLai",
         ngay_ket_thuc AS "ngayKetThuc"
  FROM khoan_sap_toi
`;

// Personal upcoming items only (group plans live in ke-hoach-nhom).
export async function listPersonalItems(nguoiDungId: number): Promise<KhoanSapToi[]> {
  const result = await database.query<KhoanSapToi>(`${SELECT_KHOAN} WHERE nguoi_dung_id = $1 ORDER BY ngay_bat_dau, id`, [
    nguoiDungId,
  ]);
  return result.rows;
}

export async function findPersonalItemOfUser(khoanId: number, nguoiDungId: number): Promise<KhoanSapToi | undefined> {
  const result = await database.query<KhoanSapToi>(`${SELECT_KHOAN} WHERE id = $1 AND nguoi_dung_id = $2`, [
    khoanId,
    nguoiDungId,
  ]);
  return result.rows[0];
}

export async function createPersonalItem(nguoiDungId: number, duLieu: DuLieuKhoanSapToi): Promise<number> {
  const result = await database.query<{ id: number }>(
    `INSERT INTO khoan_sap_toi (nguoi_dung_id, ten, loai, so_tien, ngay_bat_dau, lap_lai, ngay_ket_thuc)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [nguoiDungId, duLieu.ten, duLieu.loai, duLieu.soTien, duLieu.ngayBatDau, duLieu.lapLai, duLieu.ngayKetThuc],
  );
  return result.rows[0].id;
}

// Transactions that paid an occurrence of this item keep existing; they just lose the link.
// Both link columns are cleared together because the table requires them to be set or empty together.
export async function deleteItem(khoanId: number): Promise<void> {
  await withTransaction(async (client) => {
    await client.query('UPDATE giao_dich SET khoan_sap_toi_id = NULL, ky_ngay = NULL WHERE khoan_sap_toi_id = $1', [
      khoanId,
    ]);
    await client.query('DELETE FROM khoan_sap_toi WHERE id = $1', [khoanId]);
  });
}
