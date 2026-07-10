import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { sendResponse } from "../../../utils/sendResponse";
import status from "http-status";
import { UserService } from "./user.service";
import { UserModel } from "../../../../prisma/generated/prisma/models";
import { TQuery } from "../../../interfaces";
import genCacheKey from "../../../utils/genCacheKey";

const register = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.body;
    const file = req.file;

    const data = await UserService.registerUserIntoDb(body, file);

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

const getAllUsers = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const query = req.query as TQuery;
    const cacheKey = genCacheKey(req, "users");
    const { users: data, meta } = await UserService.getAllUserFromDb(
      query,
      cacheKey,
    );

    const message =
      data.length === 0
        ? "No users found."
        : "All Users retrieved successfully.";

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message,
      data,
      meta,
    });
  },
);

const getSingleUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id as string;
    const data = await UserService.getUserById(userId);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "User retrieved successfully.",
      data,
    });
  },
);

const updateUserStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id as string;
    const body = req.body;
    const data = await UserService.updateUserStatus(userId, body);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "User status updated successfully.",
      data,
    });
  },
);

export const UserController = {
  register,
  profileMe,
  getAllUsers,
  getSingleUser,
  updateUserStatus,
};
