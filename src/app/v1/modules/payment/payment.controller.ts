import { Request, Response } from "express";
import status from "http-status";
import { asyncHandler } from "../../../utils/asyncHandler";
import { sendResponse } from "../../../utils/sendResponse";
import { PaymentService } from "./payment.service";

const createPayment = asyncHandler(async (req: Request, res: Response) => {
  const rentalId = req.body.rentalRequestId as string;

  const data = await PaymentService.createPayment(rentalId);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Payment created successfully.",
    data,
  });
});

export const PaymentController = {
  createPayment,
};
