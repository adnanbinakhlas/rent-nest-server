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

const updateCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const body = req.body;

    const data = await CategoryService.updateCategoryFromDb(body, id);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Category updated successfully.",
      data,
    });
  },
);

const getAllCategories = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = await CategoryService.getAllCategoriesFromDb();

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "All categories retrieved successfully.",
      data,
    });
  },
);

const getSingleCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const data = await CategoryService.getCategoryById(id);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Category retrieved successfully.",
      data,
    });
  },
);

export const CategoryController = {
  createCategory,
  updateCategory,
  getAllCategories,
  getSingleCategory,
};
