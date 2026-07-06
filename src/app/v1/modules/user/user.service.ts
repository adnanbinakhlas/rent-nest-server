import {
  UserCreateInput,
  UserModel,
} from "../../../../prisma/generated/prisma/models";
import env from "../../../configs/env";
import prisma from "../../../libs/prisma";
import { RegisterInput } from "./user.types";
import bcrypt from "bcrypt";

const registerUserIntoDb = async (
  payload: RegisterInput,
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

export const UserService = { registerUserIntoDb };
