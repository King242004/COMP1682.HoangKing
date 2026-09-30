import fs from 'node:fs';
import path from 'node:path';

import database from '../src/database/database';

const migrationFolder = path.join(import.meta.dirname, '../src/database/migrations');

// Runs every .sql file in the migrations folder, in name order (001, 002, ...).
// The table schema_migrations remembers which files already ran, so each file runs only once.
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

    // Each file runs inside one transaction: if it fails halfway, nothing from that file is kept.
    // A transaction must stay on one connection, so we borrow a single client from the pool.
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
