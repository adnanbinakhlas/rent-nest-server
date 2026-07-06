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
  } catch (err: unknown) {
    // eslint-disable-next-line no-console
    console.error("Failed to generate access token", err);
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
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Invalid or expired token:", error);

    throw new AppError("Unauthorized access.", status.UNAUTHORIZED);
  }
};

export const jwt = {
  generateToken,
  verifyToken,
};
