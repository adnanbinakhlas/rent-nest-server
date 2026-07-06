import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { ZodError } from "zod";
import { AppError } from "../helpers/AppError";

const globalErrorHandler = async (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  const success = false;
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

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    error = err;
    stack = err.stack;
  }

  if (err instanceof ZodError) {
    statusCode = status.BAD_REQUEST;
    message = "Validation Error";
    error = err.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
  }

  if (process.env.NODE_ENV === "development") {
    stack =
      err instanceof Error
        ? err.stack?.split("\n").map((line) => line.trim())
        : undefined;
  }

  res.status(statusCode).json({
    success,
    message,
    error,
    ...(stack && { stack }),
  });
};

export default globalErrorHandler;
