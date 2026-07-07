import status from "http-status";
import {
  UserCreateInput,
  UserModel,
} from "../../../../prisma/generated/prisma/models";
import env from "../../../configs/env";
import { AppError } from "../../../helpers/AppError";
import prisma from "../../../libs/prisma";
import { TRegisterInput } from "./user.types";
import bcrypt from "bcrypt";
import { UserStatus } from "../../../../prisma/generated/prisma/enums";

const registerUserIntoDb = async (
  payload: TRegisterInput,
): Promise<Omit<UserModel, "password" | "isDeleted">> => {
  const passwordHash = await bcrypt.hash(
    payload.password,
    Number(env.BCRYPT_SALT),
  );
  payload.password = passwordHash;

  const user = await prisma.user.create({
    data: payload as UserCreateInput,
    omit: { password: true, isDeleted: true },
  });

  return user;
};

const getAllUserFromDb = async (): Promise<Omit<UserModel, "password">[]> => {
  const users = await prisma.user.findMany({
    omit: { password: true },
  });

  return users;
};

const getUserById = async (
  userId: string,
): Promise<Omit<UserModel, "password">> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    omit: { password: true },
  });
  if (!user) {
    throw new AppError("Requested user record not found.", status.NOT_FOUND);
  }

  return user;
};

const updateUserStatus = async (
  userId: string,
  payload: UserStatus,
): Promise<Omit<UserModel, "password">> => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: payload,
    omit: { password: true },
  });

  return user;
};

export const UserService = {
  registerUserIntoDb,
  getAllUserFromDb,
  getUserById,
  updateUserStatus,
};
