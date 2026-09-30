import { Router } from 'express';

import requireAuth from '../auth/requireAuth';
import { CLOUDINARY_FOLDER, getCloudinaryConfig } from './cloudinaryConfig';
import signUpload from './signUpload';

const cloudinaryRoutes = Router();

cloudinaryRoutes.use(requireAuth);

// Gives the app a one-time permission to upload one photo straight to our Cloudinary folder.
// The API secret never leaves the backend; the app only receives the signature made with it.
cloudinaryRoutes.post('/signature', (_request, response) => {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signUpload({ folder: CLOUDINARY_FOLDER, timestamp }, apiSecret);

  response.json({ cloudName, apiKey, timestamp, folder: CLOUDINARY_FOLDER, signature });
});

export default cloudinaryRoutes;
