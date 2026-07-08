import {
  UserRole,
  UserStatus,
} from "../../../../prisma/generated/prisma/enums";

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
