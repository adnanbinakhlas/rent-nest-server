import bcrypt from "bcrypt";
import status from "http-status";
import { UserStatus } from "../../../../prisma/generated/prisma/enums";
import {
  UserCreateInput,
  UserModel,
  UserWhereInput,
} from "../../../../prisma/generated/prisma/models";
import env from "../../../configs/env";
import { AppError } from "../../../helpers/AppError";
import { TQuery } from "../../../interfaces";
import prisma from "../../../libs/prisma";
import imageUpload from "../../../utils/imageUpload";
import { queryBuilder } from "../../../utils/queryBuilder";
import { redisUtils } from "../../../utils/redis";
import { TRegisterInput, TUsersReturnType } from "./user.types";

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

  const keys = await redisUtils.redisGetKeys("users*");
  await redisUtils.redisDelete(keys);

  return user;
};

const getAllUserFromDb = async (
  query: TQuery,
  cacheKey: string,
): Promise<TUsersReturnType> => {
  const pagination = queryBuilder.pagination(query);
  const sorting = queryBuilder.sorting(query);
  const searchOrConditions = queryBuilder.searching<UserModel>(query.q, [
    "fullname",
    "email",
  ]);

  const andConditions: UserWhereInput[] = [{ OR: searchOrConditions }];

  const whereInput: UserWhereInput = { AND: andConditions };
  const totalUsers = await prisma.user.count({ where: whereInput });
  const totalPages = queryBuilder.countPages(totalUsers, pagination.limit);

  if (pagination.page >= totalPages) {
    pagination.nextPage = null;
  }

  const meta = {
    totalPages,
    totalUsers,
    limit: pagination.limit,
    page: pagination.page,
    nextPage: pagination.nextPage,
    prevPage: pagination.prevPage,
  };

  const cacheData = await redisUtils.redisGet<TUsersReturnType>(cacheKey);
  let data: TUsersReturnType;

  if (cacheData) {
    data = cacheData;
    return data;
  }
  const users = await prisma.user.findMany({
    take: pagination.limit,
    skip: pagination.skip,
    orderBy: sorting,
    omit: { password: true },
  });

  data = { users, meta };
  await redisUtils.redisSet(cacheKey, data, 60 * 5);

  return data;
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
): Promise<Pick<UserModel, "email" | "status">> => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: payload,
    select: { email: true, status: true },
  });

  return user;
};

export const UserService = {
  registerUserIntoDb,
  getAllUserFromDb,
  getUserById,
  updateUserStatus,
};
