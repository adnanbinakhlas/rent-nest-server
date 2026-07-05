import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { AppError } from "../helpers/AppError";
import status from "http-status";

const createToken = (
  payload: JwtPayload,
  secretKey: string,
  expiresIn: string,
): string => {
  const token = jwt.sign(payload, secretKey, { expiresIn } as SignOptions);
  return token;
};

const verifyToken = (token: string, secretKey: string): JwtPayload => {
  const decode = jwt.verify(token, secretKey);
  if (typeof decode === "string") {
    throw new AppError(
      "Invalid or expired token. Please login again to continue.",
      status.UNAUTHORIZED,
    );
  }
  return decode;
};

export const jwtUtils = {
  createToken,
  verifyToken,
};
