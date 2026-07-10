import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { UserRole, UserStatus } from "../../prisma/generated/prisma/enums";
import env from "../configs/env";
import { tokenConstant } from "../constants";
import { AppError } from "../helpers/AppError";
import prisma from "../libs/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { jwtUtils } from "../utils/jose";
import { UserModel } from "../../prisma/generated/prisma/models";
import client from "../libs/redis";

const authGuard = (...roles: UserRole[]) =>
  asyncHandler(
    async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      const token = (
        req.cookies[tokenConstant.accessToken] ||
        req.headers[tokenConstant.accessToken]
      )?.split(" ")[1];

      if (!token) {
        throw new AppError(
          "Unauthorized access. Please login to continue.",
          status.UNAUTHORIZED,
        );
      }

      const decode = await jwtUtils.verifyToken(token, env.JWT_ACCESS_SECRET);

      const cacheKey = `user:${decode.id}`;

      const cached = await client.get(cacheKey);
      let user: UserModel | null;

      if (cached) {
        user = JSON.parse(cached);
      } else {
        user = await prisma.user.findUnique({
          where: { id: decode.id as string },
        });
        await client.set(cacheKey, JSON.stringify(user), {
          EX: 60 * 60,
          NX: true,
        });
      }

      if (!user || user.isDeleted) {
        throw new AppError("User not found.", status.NOT_FOUND);
      }

      if (user.status === UserStatus.BANNED || !user.isVerified) {
        throw new AppError(
          "Your account has been banned or unverified. Please verify your account or contact support team.",
          status.UNAUTHORIZED,
        );
      }

      if (!roles.includes(user.role)) {
        throw new AppError(
          "Access forbidden. Your are not permitted to do this action.",
          status.FORBIDDEN,
        );
      }

      const { password: _password, isDeleted: _isDeleted, ...safeUser } = user;

      req.user = safeUser as UserModel;

      next();
    },
  );

export default authGuard;
