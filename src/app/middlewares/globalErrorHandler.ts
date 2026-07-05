import { NextFunction, Request, Response } from "express";
import status from "http-status";

const globalErrorHandler = async (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong.";
  let error = null;
  let stack = null;

  if (err instanceof Error) {
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = err.message;
    error = err;
    stack = err.stack;
  }

  res.status(statusCode).json({
    success: false,
    message,
    error,
    stack,
  });
};

export default globalErrorHandler;
