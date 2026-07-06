import status from "http-status";
import { Prisma } from "../../prisma/generated/prisma/client";

interface IP2002 {
  cause?: {
    constraint?: {
      fields?: string[];
    };
  };
}

interface IReturnType {
  statusCode: number;
  message: string;
  error: unknown;
}

export const handlePrismaClientKnownRequestError = (
  err: Prisma.PrismaClientKnownRequestError,
): IReturnType => {
  let statusCode: number = status.BAD_REQUEST;
  let message: string = "Prisma client known request error";
  let error: unknown;

  if (err.code === "P2002") {
    statusCode = status.BAD_REQUEST;
    message = "Unique constraint violation";

    const fields = (err.meta?.driverAdapterError as IP2002)?.cause?.constraint
      ?.fields;

    error = {
      fields,
    };
  }
  return { statusCode, message, error };
};
