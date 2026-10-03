// Địa chỉ backend lấy từ file .env (EXPO_PUBLIC_API_URL), không bao giờ viết cứng trong code.
const API_URL = process.env.EXPO_PUBLIC_API_URL;

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string | null;
};

// Lỗi từ backend. status là mã HTTP, hoặc 0 khi không gọi được tới backend.
// message đã là tiếng Việt, hiện thẳng cho người dùng được.
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Gửi một request tới backend và trả về kết quả JSON.
export async function callApi<Result>(path: string, options: ApiOptions = {}): Promise<Result> {
  if (!API_URL) {
    throw new ApiError(0, 'Chưa cấu hình EXPO_PUBLIC_API_URL trong file .env');
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let response: Response;
  try {
    response = await fetch(API_URL + path, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, 'Không kết nối được máy chủ, kiểm tra mạng rồi thử lại');
  }

  // 204 nghĩa là "xong, không có gì gửi lại" (ví dụ sau khi xóa).
  if (response.status === 204) {
    return undefined as Result;
  }

  const data = await response.json();
  if (!response.ok) {
    throw new ApiError(response.status, data.thongBao ?? 'Có lỗi xảy ra, vui lòng thử lại');
  }
  return data as Result;
}
