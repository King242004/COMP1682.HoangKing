import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';

import database from './database/database';
import authRoutes from './auth/AuthRoutes';
import cloudinaryRoutes from './cloudinary/CloudinaryRoutes';
import danhMucRoutes from './danh-muc/DanhMucRoutes';
import { HttpError } from './errors/HttpError';
import duBaoRoutes from './du-bao/DuBaoRoutes';
import giaoDichRoutes from './giao-dich/GiaoDichRoutes';
import henTraNoRoutes from './hen-tra-no/HenTraNoRoutes';
import hoaDonRoutes from './hoa-don/HoaDonRoutes';
import keHoachNhomRoutes from './ke-hoach-nhom/KeHoachNhomRoutes';
import khoanSapToiRoutes from './khoan-sap-toi/KhoanSapToiRoutes';
import nganSachRoutes from './ngan-sach/NganSachRoutes';
import nhomRoutes from './nhom/NhomRoutes';
import thanhToanNhomRoutes from './thanh-toan-nhom/ThanhToanNhomRoutes';
import thongKeRoutes from './thong-ke/ThongKeRoutes';
import viRoutes from './vi/ViRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// Checks that the backend is running and can reach the database.
app.get('/health', async (_request, response) => {
  try {
    await database.query('SELECT 1');
    response.json({ trangThai: 'ok', coSoDuLieu: 'ok' });
  } catch {
    response.status(500).json({ trangThai: 'ok', coSoDuLieu: 'lỗi kết nối' });
  }
});

app.use('/auth', authRoutes);
app.use('/cloudinary', cloudinaryRoutes);
app.use('/vi', viRoutes);
app.use('/danh-muc', danhMucRoutes);
app.use('/giao-dich', giaoDichRoutes);
app.use('/thong-ke', thongKeRoutes);
app.use('/nhom', nhomRoutes);
app.use('/nhom/:nhomId/hoa-don', hoaDonRoutes);
app.use('/nhom/:nhomId/thanh-toan', thanhToanNhomRoutes);
app.use('/nhom/:nhomId/hen-tra-no', henTraNoRoutes);
app.use('/nhom/:nhomId/ke-hoach', keHoachNhomRoutes);
app.use('/khoan-sap-toi', khoanSapToiRoutes);
app.use('/ngan-sach', nganSachRoutes);
app.use('/du-bao', duBaoRoutes);

// Express 5 sends errors thrown in any route here, including errors from async routes.
app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  if (error instanceof HttpError) {
    response.status(error.status).json({ thongBao: error.message });
    return;
  }

  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  response.status(500).json({ thongBao: 'Có lỗi xảy ra, vui lòng thử lại' });
});

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  process.stdout.write(`Backend đang chạy tại cổng ${port}\n`);
});
