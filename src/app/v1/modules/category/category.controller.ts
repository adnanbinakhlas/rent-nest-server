import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { CategoryService } from "./category.service";
import { sendResponse } from "../../../utils/sendResponse";
import status from "http-status";

const createCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.body;

    const data = await CategoryService.insertCategoryIntoDb(body);

    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: "New category created successfully.",
      data,
    });
  },
);

export const CategoryController = {
  createCategory,
};
