import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { sendResponse } from "../../../utils/sendResponse";
import status from "http-status";
import { AuthService } from "./auth.service";

const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.body;

    const data = await AuthService.login(body);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "User Logged In successfully.",
      data,
    });
  },
);

export const AuthController = {
  login,
};
