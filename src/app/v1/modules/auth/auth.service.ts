import status from "http-status";
import { AppError } from "../../../helpers/AppError";
import prisma from "../../../libs/prisma";
import { TLoginInput } from "./auth.types";
import bcrypt from "bcrypt";
import { UserModel } from "../../../../prisma/generated/prisma/models";
import { jwt } from "../../../utils/jose";
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

  const accessToken = await jwt.generateToken(
    userPayload,
    env.JWT_ACCESS_SECRET,
    env.JWT_ACCESS_EXPIRES_IN,
  );

  const refreshToken = await jwt.generateToken(
    userPayload,
    env.JWT_REFRESH_SECRET,
    env.JWT_REFRESH_EXPIRES_IN,
  );

  return { accessToken, refreshToken, user: userData };
};

export const AuthService = {
  login,
};
