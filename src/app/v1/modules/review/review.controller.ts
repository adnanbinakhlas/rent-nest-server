import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { UserModel } from "../../../../prisma/generated/prisma/models";
import { ReviewService } from "./review.service";
import { sendResponse } from "../../../utils/sendResponse";
import status from "http-status";
import { TQuery } from "../../../interfaces";

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

const getAllReviews = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const query = req.query as TQuery;
    const { reviews: data, meta } =
      await ReviewService.getAllReviewsFromDb(query);

    const message =
      data.length === 0
        ? "No reviews found."
        : "Reviews retrieved successfully.";

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message,
      data,
      meta,
    });
  },
);

export const ReviewController = {
  createReview,
  getAllReviews,
};
