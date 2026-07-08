import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { UserModel } from "../../../../prisma/generated/prisma/models";
import { ReviewService } from "./review.service";
import { sendResponse } from "../../../utils/sendResponse";
import status from "http-status";

const createReview = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req.user as UserModel).id;
    const body = req.body;

    const data = await ReviewService.insertReviewIntoDb(body, userId);

    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: "Review created successfully.",
      data,
    });
  },
);

export const ReviewController = {
  createReview,
};
