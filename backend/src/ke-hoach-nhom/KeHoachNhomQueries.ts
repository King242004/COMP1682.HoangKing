import database from '../database/database';
import withTransaction from '../database/withTransaction';

// Kế hoạch nhóm là một dòng khoan_sap_toi do nhóm sở hữu (nhom_id), diễn ra một lần vào ngay_bat_dau.
// so_tien là số tiền dự kiến của mỗi người.

export type KeHoachNhom = {
  id: number;
  ten: string;
  soTienMoiNguoi: number;
  ngay: string;
  soNguoiThamGia: number;
  toiThamGia: boolean;
};

export type KeHoachToiThamGia = {
  keHoachId: number;
  ten: string;
  tenNhom: string;
  ngay: string;
  soTienMoiNguoi: number;
  daChiPhanCuaToi: number;
};

export async function createPlanWithCreator(
  nhomId: number,
  nguoiTaoId: number,
  ten: string,
  soTienMoiNguoi: number,
  ngay: string,
): Promise<number> {
  return withTransaction(async (client) => {
    const result = await client.query<{ id: number }>(
      `INSERT INTO khoan_sap_toi (nhom_id, ten, loai, so_tien, ngay_bat_dau, lap_lai)
       VALUES ($1, $2, 'chi', $3, $4, 'khong')
       RETURNING id`,
      [nhomId, ten, soTienMoiNguoi, ngay],
    );
    const keHoachId = result.rows[0].id;
    await client.query('INSERT INTO tham_gia_ke_hoach (khoan_sap_toi_id, nguoi_dung_id) VALUES ($1, $2)', [
      keHoachId,
      nguoiTaoId,
    ]);
    return keHoachId;
  });
}

export async function listPlansOfGroup(nhomId: number, nguoiDungId: number): Promise<KeHoachNhom[]> {
  const result = await database.query<KeHoachNhom>(
    `SELECT k.id,
            k.ten,
            k.so_tien      AS "soTienMoiNguoi",
            k.ngay_bat_dau AS ngay,
            (SELECT COUNT(*) FROM tham_gia_ke_hoach tg WHERE tg.khoan_sap_toi_id = k.id)::integer AS "soNguoiThamGia",
            EXISTS (SELECT 1 FROM tham_gia_ke_hoach tg
                    WHERE tg.khoan_sap_toi_id = k.id AND tg.nguoi_dung_id = $2) AS "toiThamGia"
     FROM khoan_sap_toi k
     WHERE k.nhom_id = $1
     ORDER BY k.ngay_bat_dau, k.id`,
    [nhomId, nguoiDungId],
  );
  return result.rows;
}

// Các kế hoạch tôi đã tham gia, trong mọi nhóm của tôi, kèm phần của tôi trong hóa đơn đã gắn vào từng kế hoạch.
export async function listPlansJoinedByUser(nguoiDungId: number): Promise<KeHoachToiThamGia[]> {
  const result = await database.query<KeHoachToiThamGia>(
    `SELECT k.id           AS "keHoachId",
            k.ten,
            n.ten          AS "tenNhom",
            k.ngay_bat_dau AS ngay,
            k.so_tien      AS "soTienMoiNguoi",
            (SELECT COALESCE(SUM(pc.so_tien), 0)
             FROM hoa_don h JOIN phan_chia pc ON pc.hoa_don_id = h.id
             WHERE h.khoan_sap_toi_id = k.id AND pc.nguoi_dung_id = $1) AS "daChiPhanCuaToi"
     FROM tham_gia_ke_hoach tg
     JOIN khoan_sap_toi k ON k.id = tg.khoan_sap_toi_id
     JOIN nhom n ON n.id = k.nhom_id
     WHERE tg.nguoi_dung_id = $1`,
    [nguoiDungId],
  );
  return result.rows;
}

export async function planBelongsToGroup(keHoachId: number, nhomId: number): Promise<boolean> {
  const result = await database.query('SELECT 1 FROM khoan_sap_toi WHERE id = $1 AND nhom_id = $2', [keHoachId, nhomId]);
  return (result.rowCount ?? 0) > 0;
}

export async function joinPlan(keHoachId: number, nguoiDungId: number): Promise<void> {
  await database.query(
    'INSERT INTO tham_gia_ke_hoach (khoan_sap_toi_id, nguoi_dung_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [keHoachId, nguoiDungId],
  );
}

export async function leavePlan(keHoachId: number, nguoiDungId: number): Promise<void> {
  await database.query('DELETE FROM tham_gia_ke_hoach WHERE khoan_sap_toi_id = $1 AND nguoi_dung_id = $2', [
    keHoachId,
    nguoiDungId,
  ]);
}

// Hóa đơn đã gắn vào kế hoạch vẫn còn; chỉ mất liên kết (ON DELETE SET NULL).
export async function deletePlan(keHoachId: number): Promise<void> {
  await database.query('DELETE FROM khoan_sap_toi WHERE id = $1', [keHoachId]);
}
