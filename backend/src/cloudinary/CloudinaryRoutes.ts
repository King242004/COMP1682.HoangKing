import { Router } from 'express';

import requireAuth from '../auth/requireAuth';
import { CLOUDINARY_FOLDER, getCloudinaryConfig } from './cloudinaryConfig';
import signUpload from './signUpload';

const cloudinaryRoutes = Router();

cloudinaryRoutes.use(requireAuth);

// Cấp cho app quyền dùng một lần để tải một ảnh thẳng lên thư mục Cloudinary của mình.
// API secret không bao giờ rời backend; app chỉ nhận chữ ký được tạo từ nó.
cloudinaryRoutes.post('/signature', (_request, response) => {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signUpload({ folder: CLOUDINARY_FOLDER, timestamp }, apiSecret);

  response.json({ cloudName, apiKey, timestamp, folder: CLOUDINARY_FOLDER, signature });
});

export default cloudinaryRoutes;
