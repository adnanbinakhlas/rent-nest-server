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
import imageUpload from "../../../utils/imageUpload";

const registerUserIntoDb = async (
  payload: TRegisterInput,
  file: Express.Multer.File | undefined,
): Promise<Pick<UserModel, "id">> => {
  const data: UserCreateInput = { ...payload };

  if (file) {
    const avatarUrl = await imageUpload(file.path, "rent-nest/users");
    if (typeof avatarUrl?.secure_url === "string") {
      data.avatar = avatarUrl?.secure_url;
    }
  }

  const passwordHash = await bcrypt.hash(
    payload.password,
    Number(env.BCRYPT_SALT),
  );
  data.password = passwordHash;

  const user = await prisma.user.create({
    data,
    select: { id: true },
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
