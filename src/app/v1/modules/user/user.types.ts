import {
  UserRole,
  UserStatus,
} from "../../../../prisma/generated/prisma/enums";
import { UserModel } from "../../../../prisma/generated/prisma/models";
import { IMeta } from "../../../utils/sendResponse";

export type TRegisterInput = {
  fullname: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
};

export type TUpdateUserStatusInput = {
  status: UserStatus;
};

export type TUsersReturnType = {
  users: Omit<UserModel, "password">[];
  meta: IMeta;
};
