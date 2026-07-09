import status from "http-status";
import { EncryptJWT, jwtDecrypt, JWTPayload } from "jose";
import { AppError } from "../helpers/AppError";

const generateToken = async (
  payload: JWTPayload,
  secretKey: string,
  expirationTime: string,
): Promise<string> => {
  try {
    const secret = new TextEncoder().encode(secretKey);

    const token = await new EncryptJWT(payload)
      .setProtectedHeader({
        alg: "dir",
        enc: "A256GCM",
      })
      .setIssuedAt()
      .setExpirationTime(expirationTime)
      .encrypt(secret);

    return token;
  } catch {
    throw new AppError(
      "Failed to generate access token",
      status.INTERNAL_SERVER_ERROR,
    );
  }
};

const verifyToken = async (
  token: string,
  secretKey: string,
): Promise<JWTPayload> => {
  try {
    const secret = new TextEncoder().encode(secretKey);

    const { payload } = await jwtDecrypt(token, secret);

    return payload;
  } catch {
    throw new AppError("Invalid or expired token", status.UNAUTHORIZED);
  }
};

export const jwtUtils = {
  generateToken,
  verifyToken,
};
