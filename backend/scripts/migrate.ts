import fs from 'node:fs';
import path from 'node:path';

import database from '../src/database/database';

const migrationFolder = path.join(import.meta.dirname, '../src/database/migrations');

// Chạy mọi file .sql trong thư mục migrations, theo thứ tự tên (001, 002, ...).
// Bảng schema_migrations nhớ file nào đã chạy rồi, nên mỗi file chỉ chạy một lần.
async function runMigrations() {
  await database.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      file_name TEXT PRIMARY KEY,
      ran_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const result = await database.query<{ file_name: string }>('SELECT file_name FROM schema_migrations');
  const filesAlreadyRun = result.rows.map((row) => row.file_name);

  const allFiles = fs
    .readdirSync(migrationFolder)
    .filter((fileName) => fileName.endsWith('.sql'))
    .sort();

  for (const fileName of allFiles) {
    if (filesAlreadyRun.includes(fileName)) {
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationFolder, fileName), 'utf8');

    // Mỗi file chạy trong một transaction: lỗi giữa chừng thì không giữ lại gì của file đó.
    // Transaction phải nằm trên một kết nối, nên mượn đúng một client từ pool.
    const client = await database.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (file_name) VALUES ($1)', [fileName]);
      await client.query('COMMIT');
      process.stdout.write(`Đã chạy ${fileName}\n`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  process.stdout.write('Database đã cập nhật xong.\n');
  await database.end();
}

runMigrations();
