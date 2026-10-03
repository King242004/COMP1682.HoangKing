import type { PoolClient } from 'pg';

import database from './database';

// Chạy nhiều câu truy vấn như một transaction: hoặc lưu hết, hoặc không lưu gì.
// Mọi câu truy vấn bên trong phải dùng client được truyền vào (transaction chỉ sống trên một kết nối).
export default async function withTransaction<Result>(work: (client: PoolClient) => Promise<Result>): Promise<Result> {
  const client = await database.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
