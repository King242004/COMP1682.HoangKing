import type { PoolClient } from 'pg';

import database from '../database/database';
import type { PhanChia } from './ChiaHoaDon';

export type HoaDon = {
  id: number;
  ten: string;
  soTien: number;
  ngay: string;
  ghiChu: string | null;
  anhUrl: string | null;
  cachChia: 'deu' | 'tuy_chinh';
  nguoiTraId: number;
  tenNguoiTra: string;
  viId: number | null;
  danhMucId: number;
  tenDanhMuc: string;
  bieuTuongDanhMuc: string;
  phanChia: (PhanChia & { tenHienThi: string })[];
};

export type DuLieuHoaDon = {
  nhomId: number;
  ten: string;
  nguoiTraId: number;
  viId: number | null;
  danhMucId: number;
  soTien: number;
  ngay: string;
  ghiChu: string | null;
  anhUrl: string | null;
  cachChia: 'deu' | 'tuy_chinh';
  // Có giá trị khi hóa đơn thuộc một kế hoạch nhóm (ví dụ vé xe của chuyến Đà Lạt).
  khoanSapToiId: number | null;
  nguoiTaoId: number;
};

export async function createBill(client: PoolClient, duLieu: DuLieuHoaDon): Promise<number> {
  const result = await client.query<{ id: number }>(
    `INSERT INTO hoa_don
       (nhom_id, ten, nguoi_tra_id, vi_id, danh_muc_id, so_tien, ngay, ghi_chu, anh_url, cach_chia, khoan_sap_toi_id, nguoi_tao_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING id`,
    [
      duLieu.nhomId,
      duLieu.ten,
      duLieu.nguoiTraId,
      duLieu.viId,
      duLieu.danhMucId,
      duLieu.soTien,
      duLieu.ngay,
      duLieu.ghiChu,
      duLieu.anhUrl,
      duLieu.cachChia,
      duLieu.khoanSapToiId,
      duLieu.nguoiTaoId,
    ],
  );
  return result.rows[0].id;
}

export async function createShares(client: PoolClient, hoaDonId: number, phanChia: PhanChia[]): Promise<void> {
  for (const phan of phanChia) {
    await client.query('INSERT INTO phan_chia (hoa_don_id, nguoi_dung_id, so_tien) VALUES ($1, $2, $3)', [
      hoaDonId,
      phan.nguoiDungId,
      phan.soTien,
    ]);
  }
}

// Hóa đơn của một nhóm, mới nhất trước, mỗi hóa đơn kèm danh sách phần chia.
export async function listBillsOfGroup(nhomId: number): Promise<HoaDon[]> {
  const result = await database.query<HoaDon>(
    `SELECT h.id,
            h.ten,
            h.so_tien      AS "soTien",
            h.ngay,
            h.ghi_chu      AS "ghiChu",
            h.anh_url      AS "anhUrl",
            h.cach_chia    AS "cachChia",
            h.nguoi_tra_id AS "nguoiTraId",
            nguoi_tra.ten_hien_thi AS "tenNguoiTra",
            h.vi_id        AS "viId",
            h.danh_muc_id  AS "danhMucId",
            d.ten          AS "tenDanhMuc",
            d.bieu_tuong   AS "bieuTuongDanhMuc",
            (SELECT json_agg(json_build_object(
                      'nguoiDungId', pc.nguoi_dung_id,
                      'tenHienThi', nd.ten_hien_thi,
                      'soTien', pc.so_tien) ORDER BY pc.nguoi_dung_id)
             FROM phan_chia pc
             JOIN nguoi_dung nd ON nd.id = pc.nguoi_dung_id
             WHERE pc.hoa_don_id = h.id) AS "phanChia"
     FROM hoa_don h
     JOIN nguoi_dung nguoi_tra ON nguoi_tra.id = h.nguoi_tra_id
     JOIN danh_muc d ON d.id = h.danh_muc_id
     WHERE h.nhom_id = $1
     ORDER BY h.ngay DESC, h.id DESC`,
    [nhomId],
  );
  return result.rows;
}

export async function billBelongsToGroup(hoaDonId: number, nhomId: number): Promise<boolean> {
  const result = await database.query('SELECT 1 FROM hoa_don WHERE id = $1 AND nhom_id = $2', [hoaDonId, nhomId]);
  return (result.rowCount ?? 0) > 0;
}

// Phần chia bị xóa cùng hóa đơn (ON DELETE CASCADE).
export async function deleteBill(hoaDonId: number): Promise<void> {
  await database.query('DELETE FROM hoa_don WHERE id = $1', [hoaDonId]);
}
