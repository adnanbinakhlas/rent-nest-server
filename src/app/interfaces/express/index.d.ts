import { UserModel } from "../../../prisma/generated/prisma/models";

declare global {
  namespace Express {
    interface Request {
      user?: UserModel;
    }
  }
}
