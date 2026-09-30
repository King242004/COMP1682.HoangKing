import 'dotenv/config';

if (!process.env.JWT_SECRET) {
  throw new Error('Chưa cấu hình JWT_SECRET trong file .env');
}

const jwtSecret: string = process.env.JWT_SECRET;

export default jwtSecret;
