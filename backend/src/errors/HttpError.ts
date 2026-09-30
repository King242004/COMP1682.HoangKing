// An error that already knows which HTTP status to send back.
// Services throw it; the error handler in App.ts turns it into a JSON response.
export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
