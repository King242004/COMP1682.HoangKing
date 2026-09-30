import 'dotenv/config';

import { HttpError } from '../errors/HttpError';

// Every Evenwise photo goes into this folder, so it never mixes with other projects on the same account.
export const CLOUDINARY_FOLDER = 'evenwise';

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

// Read lazily: the backend still starts without Cloudinary keys; only photo features fail.
export function getCloudinaryConfig(): CloudinaryConfig {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new HttpError(500, 'Máy chủ chưa cấu hình Cloudinary, chưa tải ảnh được');
  }
  return { cloudName, apiKey, apiSecret };
}

// A photo link is accepted only if it points to our own Cloudinary account and folder.
export function isOurPhotoUrl(url: string): boolean {
  const { cloudName } = getCloudinaryConfig();
  return url.startsWith(`https://res.cloudinary.com/${cloudName}/image/upload/`) && url.includes(`/${CLOUDINARY_FOLDER}/`);
}
