import 'dotenv/config';

import { HttpError } from '../errors/HttpError';

// Mọi ảnh của Evenwise nằm trong thư mục này, để không lẫn với dự án khác trên cùng tài khoản.
export const CLOUDINARY_FOLDER = 'evenwise';

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

// Chỉ đọc khi cần: thiếu key Cloudinary thì backend vẫn chạy, chỉ phần ảnh bị lỗi.
export function getCloudinaryConfig(): CloudinaryConfig {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new HttpError(500, 'Máy chủ chưa cấu hình Cloudinary, chưa tải ảnh được');
  }
  return { cloudName, apiKey, apiSecret };
}

// Link ảnh chỉ được chấp nhận nếu nằm trong đúng tài khoản và thư mục Cloudinary của mình.
export function isOurPhotoUrl(url: string): boolean {
  const { cloudName } = getCloudinaryConfig();
  return url.startsWith(`https://res.cloudinary.com/${cloudName}/image/upload/`) && url.includes(`/${CLOUDINARY_FOLDER}/`);
}
