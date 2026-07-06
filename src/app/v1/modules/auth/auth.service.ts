import status from "http-status";
import { AppError } from "../../../helpers/AppError";
import prisma from "../../../libs/prisma";
import { TLoginInput } from "./auth.types";
import bcrypt from "bcrypt";
import { UserModel } from "../../../../prisma/generated/prisma/models";
import { jwtUtils } from "../../../utils/jose";
import env from "../../../configs/env";

const login = async (
  payload: TLoginInput,
): Promise<{ accessToken: string; refreshToken: string; user: UserModel }> => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
    select: { password: true },
  });

  if (!user) {
    throw new AppError(
      "Invalid credentials. Please try again.",
      status.UNAUTHORIZED,
    );
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordValid) {
    throw new AppError(
      "Invalid credentials. Please try again.",
      status.UNAUTHORIZED,
    );
  }

  const userData = (await prisma.user.findUnique({
    where: { email: payload.email },
    omit: { password: true, isDeleted: true },
  })) as UserModel;

  const userPayload = {
    id: userData.id,
  };

  const accessToken = await jwtUtils.generateToken(
    userPayload,
    env.JWT_ACCESS_SECRET,
    env.JWT_ACCESS_EXPIRES_IN,
  );

  const refreshToken = await jwtUtils.generateToken(
    userPayload,
    env.JWT_REFRESH_SECRET,
    env.JWT_REFRESH_EXPIRES_IN,
  );

  return { accessToken, refreshToken, user: userData };
};

const renewToken = async (token: string): Promise<string> => {
  const decode = await jwtUtils.verifyToken(token, env.JWT_REFRESH_SECRET);
  const newAccessToken = await jwtUtils.generateToken(
    { id: decode.id },
    env.JWT_ACCESS_SECRET,
    env.JWT_ACCESS_EXPIRES_IN,
  );

  return newAccessToken;
};

export const AuthService = {
  login,
  renewToken,
};
