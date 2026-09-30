import * as ImagePicker from 'expo-image-picker';

import { ApiError, callApi } from './apiClient';

type UploadPermission = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

// Opens the camera or the photo library. Returns the local photo, or null if the user cancels.
// quality 0.6 keeps photos small enough to upload quickly on 4G.
export async function pickImage(source: 'camera' | 'library'): Promise<string | null> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new ApiError(0, 'Bạn chưa cho phép Evenwise dùng camera hoặc ảnh');
  }

  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.6 };
  const result =
    source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);

  return result.canceled ? null : result.assets[0].uri;
}

// Uploads a local photo straight to Cloudinary and returns its public https link.
// The backend first gives a one-time signature, so the Cloudinary secret never sits in the app.
export async function uploadImage(token: string, localUri: string): Promise<string> {
  const permission = await callApi<UploadPermission>('/cloudinary/signature', { method: 'POST', token });

  const form = new FormData();
  // React Native's FormData accepts a { uri, name, type } object for files.
  form.append('file', { uri: localUri, name: 'anh.jpg', type: 'image/jpeg' } as unknown as Blob);
  form.append('api_key', permission.apiKey);
  form.append('timestamp', String(permission.timestamp));
  form.append('folder', permission.folder);
  form.append('signature', permission.signature);

  let response: Response;
  try {
    response = await fetch(`https://api.cloudinary.com/v1_1/${permission.cloudName}/image/upload`, {
      method: 'POST',
      body: form,
    });
  } catch {
    throw new ApiError(0, 'Không tải ảnh lên được, kiểm tra mạng rồi thử lại');
  }

  const data = await response.json();
  if (!response.ok) {
    throw new ApiError(response.status, 'Không tải ảnh lên được, thử lại sau');
  }
  return data.secure_url as string;
}

// A small square version of a Cloudinary photo, for lists and calendar cells (less data to download).
export function thumbnailUrl(url: string, size: number): string {
  return url.replace('/image/upload/', `/image/upload/c_fill,w_${size},h_${size}/`);
}
