import { Request, Response } from "express";
import status from "http-status";
import { UserModel } from "../../../../prisma/generated/prisma/models";
import { TQuery } from "../../../interfaces";
import { asyncHandler } from "../../../utils/asyncHandler";
import genCacheKey from "../../../utils/genCacheKey";
import { sendResponse } from "../../../utils/sendResponse";
import { PropertyService } from "./property.service";
import { TImageFiles } from "./property.types";

const createProperty = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req.user as UserModel).id;
    const body = req.body;
    const files = req.files as TImageFiles;

    const data = await PropertyService.insertPropertyIntoDb(
      body,
      userId,
      files,
    );

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
    const query = req.query as TQuery;
    const cacheKey = genCacheKey(req, "properties");
    const { properties: data, meta } =
      await PropertyService.getAllPropertiesFromDb(query, cacheKey);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "All properties retrieved successfully.",
      data,
      meta,
    });
  },
);

const getPropertiesMe = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req.user as UserModel).id;
    const query = req.query as TQuery;
    const cacheKey = genCacheKey(req, "properties/me");
    const { properties: data, meta } =
      await PropertyService.getPropertiesMeFromDb(userId, query, cacheKey);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Your properties were retrieved successfully.",
      data,
      meta,
    });
  },
);

const getSingleProperty = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const query = req.query as TQuery;
    const cacheKey = genCacheKey(req, "properties/id");
    const data = await PropertyService.getPropertyById(id, query, cacheKey);

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
  getPropertiesMe,
  getSingleProperty,
};
