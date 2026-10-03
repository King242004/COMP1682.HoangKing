import * as ImagePicker from 'expo-image-picker';

import { ApiError, callApi } from './apiClient';

type UploadPermission = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

// Mở camera hoặc thư viện ảnh. Trả về ảnh trên máy, hoặc null nếu người dùng hủy.
// quality 0.6 giữ ảnh đủ nhỏ để tải lên nhanh bằng 4G.
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

// Tải ảnh trên máy thẳng lên Cloudinary và trả về link https công khai.
// Backend cấp chữ ký dùng một lần trước, nên secret của Cloudinary không bao giờ nằm trong app.
export async function uploadImage(token: string, localUri: string): Promise<string> {
  const permission = await callApi<UploadPermission>('/cloudinary/signature', { method: 'POST', token });

  const form = new FormData();
  // FormData của React Native nhận object { uri, name, type } cho file.
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

// Bản vuông nhỏ của ảnh Cloudinary, dùng cho danh sách và ô lịch (tải ít dữ liệu hơn).
export function thumbnailUrl(url: string, size: number): string {
  return url.replace('/image/upload/', `/image/upload/c_fill,w_${size},h_${size}/`);
}
