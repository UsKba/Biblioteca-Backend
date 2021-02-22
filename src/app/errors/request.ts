interface ErrorData {
  message: string;
  errorCode: number;
  statusCode?: number;
}

export class RequestError extends Error {
  statusCode: number;

  errorCode: number;

  constructor(data: ErrorData) {
    const { message, errorCode, statusCode } = data;

    super(message);

    this.message = message;
    this.statusCode = statusCode || 400;
    this.errorCode = errorCode;
  }
}
