import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { UserModel } from "../../../../prisma/generated/prisma/models";
import { RentalService } from "./rental.service";
import { sendResponse } from "../../../utils/sendResponse";
import status from "http-status";
import { TQuery } from "../../../interfaces";

const submitRentalRequest = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req.user as UserModel).id;
    const body = req.body;

    const data = await RentalService.insertRentalIntoDb(body, userId);

    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: "Rental requested successful.",
      data,
    });
  },
);

const updateRentalRequest = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const rentalId = req.params.id as string;
    const userId = (req.user as UserModel).id;
    const body = req.body;

    const data = await RentalService.updateRentalFromDb(rentalId, body, userId);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Rental updated successfully.",
      data,
    });
  },
);

const updateRentalRequestStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const rentalId = req.params.id as string;
    const body = req.body;
    const data = await RentalService.updateRentalStatusFromDb(rentalId, body);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Rental status updated successfully.",
      data,
    });
  },
);

const getAllRentalRequests = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const query = req.query as TQuery;
    const { rentals: data, meta } =
      await RentalService.getAllRentalsFromDb(query);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "All rentals retrieved successfully.",
      data,
      meta,
    });
  },
);

const getSingleRentalRequest = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const rentalId = req.params.id as string;
    const data = await RentalService.getRentalById(rentalId);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Rental retrieved successfully.",
      data,
    });
  },
);

export const RentalController = {
  submitRentalRequest,
  updateRentalRequest,
  updateRentalRequestStatus,
  getAllRentalRequests,
  getSingleRentalRequest,
};
