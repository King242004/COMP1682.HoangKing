import crypto from 'node:crypto';

// Tạo chữ ký mà Cloudinary yêu cầu khi "tải ảnh có ký".
// Quy tắc theo tài liệu Cloudinary: sắp xếp tham số theo tên, nối thành "a=1&b=2",
// thêm API secret vào cuối, rồi lấy mã băm SHA-1 dạng hex.
// Đây là hàm thuần: cùng đầu vào thì cùng kết quả, không gọi mạng.
export default function signUpload(params: Record<string, string | number>, apiSecret: string): string {
  const joined = Object.keys(params)
    .sort()
    .map((name) => `${name}=${params[name]}`)
    .join('&');

  return crypto
    .createHash('sha1')
    .update(joined + apiSecret)
    .digest('hex');
}
