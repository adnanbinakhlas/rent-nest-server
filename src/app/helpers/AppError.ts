// throw new AppError("User not found", status.NOT_FOUND)
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = "App Error";
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
