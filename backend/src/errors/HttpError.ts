// Lỗi đã biết sẵn phải trả về mã HTTP nào.
// Service ném lỗi này ra; bộ xử lý lỗi trong App.ts đổi nó thành phản hồi JSON.
export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
