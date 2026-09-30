import database from '../database/database';

// One line of "my money": either a personal transaction, or my share of a group bill.
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
  // Set when this transaction pays one occurrence of an upcoming item (so the forecast stops counting it).
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

// ⭐ My share of a group bill counts as my spending (only my share, not the whole bill).
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

// viId = null means "all wallets", which also includes my shares of group bills.
// Filtering by a wallet shows only personal transactions of that wallet.
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

// Editing keeps the link to the upcoming item as it was.
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

// ⭐ "Chi tiêu của tôi" in a range: personal spending + my shares of group bills.
// danhMucId = null means every category. Used by budgets and by the forecast's spending speed.
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

// Which occurrences of my upcoming items are already paid (khoan_sap_toi_id + ky_ngay).
export async function listPaidOccurrences(nguoiDungId: number): Promise<{ khoanSapToiId: number; kyNgay: string }[]> {
  const result = await database.query<{ khoanSapToiId: number; kyNgay: string }>(
    `SELECT khoan_sap_toi_id AS "khoanSapToiId", ky_ngay AS "kyNgay"
     FROM giao_dich
     WHERE nguoi_dung_id = $1 AND khoan_sap_toi_id IS NOT NULL`,
    [nguoiDungId],
  );
  return result.rows;
}
