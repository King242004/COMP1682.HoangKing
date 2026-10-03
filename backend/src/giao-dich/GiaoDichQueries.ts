import database from '../database/database';

// Một dòng "tiền của tôi": hoặc giao dịch cá nhân, hoặc phần của tôi trong hóa đơn nhóm.
export type GiaoDich = {
  id: number;
  nguon: 'ca_nhan' | 'nhom';
  nhomId: number | null;
  loai: 'thu' | 'chi';
  soTien: number;
  ngay: string;
  ghiChu: string | null;
  anhUrl: string | null;
  viId: number | null;
  tenVi: string;
  danhMucId: number;
  tenDanhMuc: string;
  bieuTuongDanhMuc: string;
};

export type DuLieuGiaoDich = {
  viId: number;
  danhMucId: number;
  loai: 'thu' | 'chi';
  soTien: number;
  ngay: string;
  ghiChu: string | null;
  anhUrl: string | null;
  // Có giá trị khi giao dịch này trả một kỳ của khoản sắp tới (để dự báo thôi tính kỳ đó).
  khoanSapToiId: number | null;
  kyNgay: string | null;
};

const SELECT_GIAO_DICH_CA_NHAN = `
  SELECT g.id,
         'ca_nhan'    AS nguon,
         NULL::integer AS "nhomId",
         g.loai,
         g.so_tien    AS "soTien",
         g.ngay,
         g.ghi_chu    AS "ghiChu",
         g.anh_url    AS "anhUrl",
         g.vi_id      AS "viId",
         v.ten        AS "tenVi",
         g.danh_muc_id AS "danhMucId",
         d.ten        AS "tenDanhMuc",
         d.bieu_tuong AS "bieuTuongDanhMuc"
  FROM giao_dich g
  JOIN vi v ON v.id = g.vi_id
  JOIN danh_muc d ON d.id = g.danh_muc_id
`;

// ⭐ Phần của tôi trong hóa đơn nhóm được tính là chi tiêu của tôi (chỉ phần của tôi, không phải cả hóa đơn).
const SELECT_PHAN_CUA_TOI_TRONG_NHOM = `
  SELECT h.id,
         'nhom'       AS nguon,
         h.nhom_id    AS "nhomId",
         'chi'        AS loai,
         pc.so_tien   AS "soTien",
         h.ngay,
         h.ten        AS "ghiChu",
         h.anh_url    AS "anhUrl",
         NULL::integer AS "viId",
         n.ten        AS "tenVi",
         h.danh_muc_id AS "danhMucId",
         d.ten        AS "tenDanhMuc",
         d.bieu_tuong AS "bieuTuongDanhMuc"
  FROM phan_chia pc
  JOIN hoa_don h ON h.id = pc.hoa_don_id
  JOIN nhom n ON n.id = h.nhom_id
  JOIN danh_muc d ON d.id = h.danh_muc_id
`;

// viId = null nghĩa là "tất cả ví", khi đó có cả phần của tôi trong hóa đơn nhóm.
// Lọc theo một ví thì chỉ hiện giao dịch cá nhân của ví đó.
export async function listTransactions(
  nguoiDungId: number,
  tuNgay: string,
  denNgay: string,
  viId: number | null,
): Promise<GiaoDich[]> {
  if (viId !== null) {
    const result = await database.query<GiaoDich>(
      `${SELECT_GIAO_DICH_CA_NHAN}
       WHERE g.nguoi_dung_id = $1 AND g.ngay BETWEEN $2 AND $3 AND g.vi_id = $4
       ORDER BY g.ngay DESC, g.id DESC`,
      [nguoiDungId, tuNgay, denNgay, viId],
    );
    return result.rows;
  }

  const result = await database.query<GiaoDich>(
    `SELECT * FROM (
       ${SELECT_GIAO_DICH_CA_NHAN}
       WHERE g.nguoi_dung_id = $1 AND g.ngay BETWEEN $2 AND $3
       UNION ALL
       ${SELECT_PHAN_CUA_TOI_TRONG_NHOM}
       WHERE pc.nguoi_dung_id = $1 AND pc.so_tien > 0 AND h.ngay BETWEEN $2 AND $3
     ) tat_ca
     ORDER BY ngay DESC, id DESC`,
    [nguoiDungId, tuNgay, denNgay],
  );
  return result.rows;
}

export async function findTransactionOfUser(giaoDichId: number, nguoiDungId: number): Promise<GiaoDich | undefined> {
  const result = await database.query<GiaoDich>(`${SELECT_GIAO_DICH_CA_NHAN} WHERE g.id = $1 AND g.nguoi_dung_id = $2`, [
    giaoDichId,
    nguoiDungId,
  ]);
  return result.rows[0];
}

export async function createTransaction(nguoiDungId: number, duLieu: DuLieuGiaoDich): Promise<number> {
  const result = await database.query<{ id: number }>(
    `INSERT INTO giao_dich
       (nguoi_dung_id, vi_id, danh_muc_id, loai, so_tien, ngay, ghi_chu, anh_url, khoan_sap_toi_id, ky_ngay)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [
      nguoiDungId,
      duLieu.viId,
      duLieu.danhMucId,
      duLieu.loai,
      duLieu.soTien,
      duLieu.ngay,
      duLieu.ghiChu,
      duLieu.anhUrl,
      duLieu.khoanSapToiId,
      duLieu.kyNgay,
    ],
  );
  return result.rows[0].id;
}

// Khi sửa thì giữ nguyên liên kết với khoản sắp tới.
export async function updateTransaction(giaoDichId: number, duLieu: DuLieuGiaoDich): Promise<void> {
  await database.query(
    `UPDATE giao_dich
     SET vi_id = $1, danh_muc_id = $2, loai = $3, so_tien = $4, ngay = $5, ghi_chu = $6, anh_url = $7
     WHERE id = $8`,
    [duLieu.viId, duLieu.danhMucId, duLieu.loai, duLieu.soTien, duLieu.ngay, duLieu.ghiChu, duLieu.anhUrl, giaoDichId],
  );
}

export async function deleteTransaction(giaoDichId: number): Promise<void> {
  await database.query('DELETE FROM giao_dich WHERE id = $1', [giaoDichId]);
}

// ⭐ "Chi tiêu của tôi" trong một khoảng ngày: chi tiêu cá nhân + phần của tôi trong hóa đơn nhóm.
// danhMucId = null nghĩa là mọi danh mục. Dùng cho ngân sách và cho tốc độ tiêu của dự báo.
export async function sumMySpending(
  nguoiDungId: number,
  tuNgay: string,
  denNgay: string,
  danhMucId: number | null,
): Promise<number> {
  const result = await database.query<{ tong: number }>(
    `SELECT (SELECT COALESCE(SUM(so_tien), 0) FROM giao_dich
             WHERE nguoi_dung_id = $1 AND loai = 'chi' AND ngay BETWEEN $2 AND $3
               AND ($4::integer IS NULL OR danh_muc_id = $4))
          + (SELECT COALESCE(SUM(pc.so_tien), 0) FROM phan_chia pc JOIN hoa_don h ON h.id = pc.hoa_don_id
             WHERE pc.nguoi_dung_id = $1 AND h.ngay BETWEEN $2 AND $3
               AND ($4::integer IS NULL OR h.danh_muc_id = $4))
          AS tong`,
    [nguoiDungId, tuNgay, denNgay, danhMucId],
  );
  return result.rows[0].tong;
}

// Những kỳ nào của khoản sắp tới đã được trả (khoan_sap_toi_id + ky_ngay).
export async function listPaidOccurrences(nguoiDungId: number): Promise<{ khoanSapToiId: number; kyNgay: string }[]> {
  const result = await database.query<{ khoanSapToiId: number; kyNgay: string }>(
    `SELECT khoan_sap_toi_id AS "khoanSapToiId", ky_ngay AS "kyNgay"
     FROM giao_dich
     WHERE nguoi_dung_id = $1 AND khoan_sap_toi_id IS NOT NULL`,
    [nguoiDungId],
  );
  return result.rows;
}
