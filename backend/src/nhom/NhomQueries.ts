import type { PoolClient } from 'pg';

import database from '../database/database';

export type Nhom = {
  id: number;
  ten: string;
  maMoi: string;
};

export type ThanhVien = {
  id: number;
  tenHienThi: string;
};

export async function createGroupWithCreator(
  client: PoolClient,
  ten: string,
  maMoi: string,
  nguoiTaoId: number,
): Promise<number> {
  const result = await client.query<{ id: number }>(
    'INSERT INTO nhom (ten, ma_moi, nguoi_tao_id) VALUES ($1, $2, $3) RETURNING id',
    [ten, maMoi, nguoiTaoId],
  );
  const nhomId = result.rows[0].id;
  await client.query('INSERT INTO thanh_vien_nhom (nhom_id, nguoi_dung_id) VALUES ($1, $2)', [nhomId, nguoiTaoId]);
  return nhomId;
}

export async function findGroup(nhomId: number): Promise<Nhom | undefined> {
  const result = await database.query<Nhom>('SELECT id, ten, ma_moi AS "maMoi" FROM nhom WHERE id = $1', [nhomId]);
  return result.rows[0];
}

export async function findGroupByInviteCode(maMoi: string): Promise<Nhom | undefined> {
  const result = await database.query<Nhom>('SELECT id, ten, ma_moi AS "maMoi" FROM nhom WHERE ma_moi = $1', [maMoi]);
  return result.rows[0];
}

export async function addMember(nhomId: number, nguoiDungId: number): Promise<void> {
  await database.query(
    'INSERT INTO thanh_vien_nhom (nhom_id, nguoi_dung_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [nhomId, nguoiDungId],
  );
}

export async function isMember(nhomId: number, nguoiDungId: number): Promise<boolean> {
  const result = await database.query('SELECT 1 FROM thanh_vien_nhom WHERE nhom_id = $1 AND nguoi_dung_id = $2', [
    nhomId,
    nguoiDungId,
  ]);
  return (result.rowCount ?? 0) > 0;
}

export async function listGroupsOfUser(nguoiDungId: number): Promise<Nhom[]> {
  const result = await database.query<Nhom>(
    `SELECT n.id, n.ten, n.ma_moi AS "maMoi"
     FROM nhom n
     JOIN thanh_vien_nhom tv ON tv.nhom_id = n.id
     WHERE tv.nguoi_dung_id = $1
     ORDER BY n.id DESC`,
    [nguoiDungId],
  );
  return result.rows;
}

export async function listMembers(nhomId: number): Promise<ThanhVien[]> {
  const result = await database.query<ThanhVien>(
    `SELECT nd.id, nd.ten_hien_thi AS "tenHienThi"
     FROM thanh_vien_nhom tv
     JOIN nguoi_dung nd ON nd.id = tv.nguoi_dung_id
     WHERE tv.nhom_id = $1
     ORDER BY tv.ngay_vao`,
    [nhomId],
  );
  return result.rows;
}
