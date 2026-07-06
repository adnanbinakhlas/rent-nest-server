import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { sendResponse } from "../../../utils/sendResponse";
import status from "http-status";
import { UserService } from "./user.service";

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

export const UserController = { register };
