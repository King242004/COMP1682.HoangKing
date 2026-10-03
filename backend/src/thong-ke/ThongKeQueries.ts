import database from '../database/database';

export type TongThuChi = {
  tongThu: number;
  tongChi: number;
};

export type ChiTheoDanhMuc = {
  danhMucId: number;
  tenDanhMuc: string;
  bieuTuong: string;
  soTien: number;
};

// "Chi" ở đây luôn là "chi tiêu của tôi": chi tiêu cá nhân + phần của tôi trong hóa đơn nhóm
// (tai-lieu/Evenwise.md, mục 4.3). Thu chỉ tính thu cá nhân.
const CHI_TIEU_CUA_TOI = `
  SELECT danh_muc_id, so_tien FROM giao_dich
  WHERE nguoi_dung_id = $1 AND loai = 'chi' AND ngay BETWEEN $2 AND $3
  UNION ALL
  SELECT h.danh_muc_id, pc.so_tien FROM phan_chia pc JOIN hoa_don h ON h.id = pc.hoa_don_id
  WHERE pc.nguoi_dung_id = $1 AND pc.so_tien > 0 AND h.ngay BETWEEN $2 AND $3
`;

export async function sumIncomeAndExpense(nguoiDungId: number, tuNgay: string, denNgay: string): Promise<TongThuChi> {
  const result = await database.query<TongThuChi>(
    `SELECT (SELECT COALESCE(SUM(so_tien), 0) FROM giao_dich
             WHERE nguoi_dung_id = $1 AND loai = 'thu' AND ngay BETWEEN $2 AND $3) AS "tongThu",
            (SELECT COALESCE(SUM(so_tien), 0) FROM (${CHI_TIEU_CUA_TOI}) chi) AS "tongChi"`,
    [nguoiDungId, tuNgay, denNgay],
  );
  return result.rows[0];
}

export async function sumExpenseByCategory(
  nguoiDungId: number,
  tuNgay: string,
  denNgay: string,
): Promise<ChiTheoDanhMuc[]> {
  const result = await database.query<ChiTheoDanhMuc>(
    `SELECT d.id         AS "danhMucId",
            d.ten        AS "tenDanhMuc",
            d.bieu_tuong AS "bieuTuong",
            SUM(chi.so_tien) AS "soTien"
     FROM (${CHI_TIEU_CUA_TOI}) chi
     JOIN danh_muc d ON d.id = chi.danh_muc_id
     GROUP BY d.id, d.ten, d.bieu_tuong
     ORDER BY "soTien" DESC`,
    [nguoiDungId, tuNgay, denNgay],
  );
  return result.rows;
}
