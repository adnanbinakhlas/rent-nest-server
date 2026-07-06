import { Request, Response } from "express";
import status from "http-status";
import { asyncHandler } from "../../../utils/asyncHandler";
import { sendResponse } from "../../../utils/sendResponse";
import { AuthService } from "./auth.service";
import { cookieUtils } from "../../../utils/cookie";
import { tokenConstant } from "../../../constants";

const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.body;

    const data = await AuthService.login(body);

    cookieUtils.setCookie(
      res,
      tokenConstant.accessToken,
      data.accessToken,
      1000 * 60 * 60 * 24 * 7,
    );

    cookieUtils.setCookie(
      res,
      tokenConstant.refreshToken,
      data.refreshToken,
      1000 * 60 * 60 * 24 * 365,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "User Logged In successfully.",
      data,
    });
  },
);

const refreshToken = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const token = (
      req.cookies[tokenConstant.refreshToken] ||
      req.headers[tokenConstant.refreshToken]
    ).split(" ")[1];

    const data = await AuthService.renewToken(token as string);

    cookieUtils.setCookie(
      res,
      tokenConstant.accessToken,
      data,
      1000 * 60 * 60 * 24 * 7,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Access token refreshed successfully.",
      data: { accessToken: data },
    });
  },
);

export const AuthController = {
  login,
  refreshToken,
};
