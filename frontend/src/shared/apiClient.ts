// Backend address comes from the .env file (EXPO_PUBLIC_API_URL), never written in the code.
const API_URL = process.env.EXPO_PUBLIC_API_URL;

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string | null;
};

// An error from the backend. status is the HTTP status, or 0 when the backend could not be reached.
// message is already in Vietnamese and can be shown to the user.
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Sends one request to the backend and returns the JSON answer.
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

  // 204 means "done, nothing to send back" (for example after deleting).
  if (response.status === 204) {
    return undefined as Result;
  }

  const data = await response.json();
  if (!response.ok) {
    throw new ApiError(response.status, data.thongBao ?? 'Có lỗi xảy ra, vui lòng thử lại');
  }
  return data as Result;
}
