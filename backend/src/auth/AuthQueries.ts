import database from '../database/database';

export type NguoiDung = {
  id: number;
  email: string;
  tenHienThi: string;
  anhDaiDienUrl: string | null;
};

type NguoiDungKemMatKhau = NguoiDung & {
  matKhauBam: string;
};

export async function findUserByEmail(email: string): Promise<NguoiDungKemMatKhau | undefined> {
  const result = await database.query<NguoiDungKemMatKhau>(
    `SELECT id,
            email,
            mat_khau_bam      AS "matKhauBam",
            ten_hien_thi      AS "tenHienThi",
            anh_dai_dien_url  AS "anhDaiDienUrl"
     FROM nguoi_dung
     WHERE email = $1`,
    [email],
  );
  return result.rows[0];
}

export async function findUserById(id: number): Promise<NguoiDung | undefined> {
  const result = await database.query<NguoiDung>(
    `SELECT id,
            email,
            ten_hien_thi      AS "tenHienThi",
            anh_dai_dien_url  AS "anhDaiDienUrl"
     FROM nguoi_dung
     WHERE id = $1`,
    [id],
  );
  return result.rows[0];
}

export async function createUser(email: string, matKhauBam: string, tenHienThi: string): Promise<NguoiDung> {
  const result = await database.query<NguoiDung>(
    `INSERT INTO nguoi_dung (email, mat_khau_bam, ten_hien_thi)
     VALUES ($1, $2, $3)
     RETURNING id,
               email,
               ten_hien_thi      AS "tenHienThi",
               anh_dai_dien_url  AS "anhDaiDienUrl"`,
    [email, matKhauBam, tenHienThi],
  );
  return result.rows[0];
}
