import httpStatus from "http-status";
import { AmenityService } from "./amenity.service";
import { sendResponse } from "../../../utils/sendResponse";
import { asyncHandler } from "../../../utils/asyncHandler";
import { Request, Response } from "express";

const createAmenity = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body;
  const data = await AmenityService.insertAmenityIntoDb(body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "New amenity created successfully.",
    data,
  });
});

const updateAmenity = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const body = req.body;

  const data = await AmenityService.updateAmenityFromDb(body, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Amenity updated successfully.",
    data,
  });
});

const getAllAmenities = asyncHandler(async (_req: Request, res: Response) => {
  const data = await AmenityService.getAllAmenitiesFromDb();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All amenities retrieved successfully.",
    data,
  });
});

const getSingleAmenity = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const data = await AmenityService.getAmenityById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Amenity retrieved successfully.",
    data,
  });
});

export const AmenityController = {
  createAmenity,
  updateAmenity,
  getAllAmenities,
  getSingleAmenity,
};
