import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { ZodError } from "zod";
import { AppError } from "../helpers/AppError";
import { Prisma } from "../../prisma/generated/prisma/client";
import { handlePrismaClientKnownRequestError } from "../helpers/handlePrismaClientKnownRequestError";
import env from "../configs/env";

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
    message =
      "Validation failed. One or more fields are invalid or unrecognized.";
    error = err.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const result = handlePrismaClientKnownRequestError(err);
    statusCode = result.statusCode;
    message = result.message;
    error = result.error;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = status.BAD_REQUEST;
    message =
      "Invalid request data. Please check required fields and data types.";
    error = err.cause;
    stack = err.stack;
  }

  if (env.NODE_ENV === "development") {
    stack =
      err instanceof Error
        ? err.stack?.split("\n").map((line) => line.trim())
        : undefined;
  }

  res.status(statusCode).json({
    success,
    message,
    error,
    ...(stack && env.NODE_ENV === "development" && { stack }),
  });
};

export default globalErrorHandler;
