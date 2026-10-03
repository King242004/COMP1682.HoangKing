import 'dotenv/config';
import pg from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('Chưa cấu hình DATABASE_URL trong file .env');
}

// Trả cột DATE về dạng chuỗi 'YYYY-MM-DD'. Mặc định pg đổi thành đối tượng Date của JS
// lúc nửa đêm giờ máy, có thể bị lệch ngày khi đổi sang múi giờ khác.
const DATE_TYPE_ID = 1082;
pg.types.setTypeParser(DATE_TYPE_ID, (value) => value);

// SUM() trên cột INTEGER trả về BIGINT, pg đưa về dạng chuỗi. Tiền VND luôn nhỏ hơn rất xa
// Number.MAX_SAFE_INTEGER, nên đọc thành số bình thường là an toàn.
const BIGINT_TYPE_ID = 20;
pg.types.setTypeParser(BIGINT_TYPE_ID, (value) => Number(value));

// Pool giữ sẵn vài kết nối tới PostgreSQL và dùng lại cho mọi câu truy vấn.
const database = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export default database;
