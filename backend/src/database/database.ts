import 'dotenv/config';
import pg from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('Chưa cấu hình DATABASE_URL trong file .env');
}

// Return DATE columns as plain 'YYYY-MM-DD' strings. By default pg turns them into JS Date objects
// at local midnight, which can shift the day when the value is converted to another time zone.
const DATE_TYPE_ID = 1082;
pg.types.setTypeParser(DATE_TYPE_ID, (value) => value);

// SUM() of INTEGER columns returns BIGINT, which pg gives back as text. Money in VND stays far below
// Number.MAX_SAFE_INTEGER, so reading it as a normal number is safe.
const BIGINT_TYPE_ID = 20;
pg.types.setTypeParser(BIGINT_TYPE_ID, (value) => Number(value));

// A pool keeps a few open connections to PostgreSQL and reuses them for every query.
const database = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export default database;
