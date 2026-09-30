import database from '../database/database';

export type ThanhToan = {
  id: number;
  nguoiTraId: number;
  tenNguoiTra: string;
  nguoiNhanId: number;
  tenNguoiNhan: string;
  soTien: number;
  trangThai: 'cho' | 'da_nhan';
  ngayTao: string;
};

const SELECT_THANH_TOAN = `
  SELECT t.id,
         t.nguoi_tra_id  AS "nguoiTraId",
         tra.ten_hien_thi AS "tenNguoiTra",
         t.nguoi_nhan_id AS "nguoiNhanId",
         nhan.ten_hien_thi AS "tenNguoiNhan",
         t.so_tien       AS "soTien",
         t.trang_thai    AS "trangThai",
         t.ngay_tao      AS "ngayTao"
  FROM thanh_toan_nhom t
  JOIN nguoi_dung tra ON tra.id = t.nguoi_tra_id
  JOIN nguoi_dung nhan ON nhan.id = t.nguoi_nhan_id
`;

export async function listPayments(nhomId: number): Promise<ThanhToan[]> {
  const result = await database.query<ThanhToan>(`${SELECT_THANH_TOAN} WHERE t.nhom_id = $1 ORDER BY t.id DESC`, [
    nhomId,
  ]);
  return result.rows;
}

export async function findPaymentInGroup(thanhToanId: number, nhomId: number): Promise<ThanhToan | undefined> {
  const result = await database.query<ThanhToan>(`${SELECT_THANH_TOAN} WHERE t.id = $1 AND t.nhom_id = $2`, [
    thanhToanId,
    nhomId,
  ]);
  return result.rows[0];
}

export async function createPayment(
  nhomId: number,
  nguoiTraId: number,
  nguoiNhanId: number,
  soTien: number,
  viTraId: number | null,
): Promise<number> {
  const result = await database.query<{ id: number }>(
    `INSERT INTO thanh_toan_nhom (nhom_id, nguoi_tra_id, nguoi_nhan_id, so_tien, vi_tra_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [nhomId, nguoiTraId, nguoiNhanId, soTien, viTraId],
  );
  return result.rows[0].id;
}

export async function confirmPayment(thanhToanId: number, viNhanId: number | null): Promise<void> {
  await database.query(
    `UPDATE thanh_toan_nhom
     SET trang_thai = 'da_nhan', vi_nhan_id = $1, ngay_xac_nhan = now()
     WHERE id = $2`,
    [viNhanId, thanhToanId],
  );
}

export async function deletePayment(thanhToanId: number): Promise<void> {
  await database.query('DELETE FROM thanh_toan_nhom WHERE id = $1', [thanhToanId]);
}
