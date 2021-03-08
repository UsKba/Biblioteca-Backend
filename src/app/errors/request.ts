export class RequestError extends Error {
  statusCode: number;

  constructor(message = '', statusCode = 400) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
  }
}
