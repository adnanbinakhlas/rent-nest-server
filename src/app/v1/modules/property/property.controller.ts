import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { sendResponse } from "../../../utils/sendResponse";
import status from "http-status";
import { PropertyService } from "./property.service";
import { UserModel } from "../../../../prisma/generated/prisma/models";

const createProperty = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req.user as UserModel).id;
    const body = req.body;

    const data = await PropertyService.insertPropertyIntoDb(body, userId);

    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: "New property created successfully.",
      data,
    });
  },
);

const updateProperty = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const body = req.body;

    const data = await PropertyService.updatePropertyFromDb(body, id);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Property updated successfully.",
      data,
    });
  },
);

const getAllProperties = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = await PropertyService.getAllPropertiesFromDb();

    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: "All properties retrieved successfully.",
      data,
    });
  },
);

const getSingleProperty = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;

    const data = await PropertyService.getPropertyById(id);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Property retrieved successfully.",
      data,
    });
  },
);

export const PropertyController = {
  createProperty,
  updateProperty,
  getAllProperties,
  getSingleProperty,
};
