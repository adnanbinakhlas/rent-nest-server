import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { sendResponse } from "../../../utils/sendResponse";
import status from "http-status";
import { UserService } from "./user.service";
import { UserModel } from "../../../../prisma/generated/prisma/models";

const register = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.body;

    const data = await UserService.registerUserIntoDb(body);

    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: "User registered successfully.",
      data,
    });
  },
);

const profileMe = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user as UserModel;

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "User profile retrieved successfully.",
      data: user,
    });
  },
);

export const UserController = { register, profileMe };
