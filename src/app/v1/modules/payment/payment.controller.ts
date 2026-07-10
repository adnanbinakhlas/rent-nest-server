import { Request, Response } from "express";
import status from "http-status";
import { asyncHandler } from "../../../utils/asyncHandler";
import { sendResponse } from "../../../utils/sendResponse";
import { PaymentService } from "./payment.service";
import { UserModel } from "../../../../prisma/generated/prisma/models";
import { UserRole } from "../../../../prisma/generated/prisma/enums";
import { TQuery } from "../../../interfaces";

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

const handleStripeWebhook = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const payload = req.body;
    const signature = req.headers["stripe-signature"] as string;

    await PaymentService.handleStripeEvents(payload, signature);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Payment successful",
    });
  },
);

const getAllPayments = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const query = req.query as Record<string, string | undefined>;
    const { payments: data, meta } =
      await PaymentService.getAllPaymentsFromDb(query);

    const message =
      data.length === 0
        ? "No payments found."
        : "All payments retrieved successfully.";

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message,
      data,
      meta,
    });
  },
);

const getAllPaymentsMe = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req.user as UserModel).id;
    const query = req.query as Record<string, string | undefined>;
    const { payments: data, meta } =
      await PaymentService.getAllPaymentsMeFromDb(userId, query);

    const message =
      data.length === 0
        ? "No payments found."
        : "My payments retrieved successfully.";

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message,
      data,
      meta,
    });
  },
);

const getSinglePayment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const query = req.query as TQuery;
    const paymentId = req.params.id as string;
    const userId = (req.user as UserModel).id;
    const isAdmin = (req.user as UserModel).role === UserRole.ADMIN;
    const data = await PaymentService.getPaymentById(
      query,
      userId,
      isAdmin,
      paymentId,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Payment retrieved successfully.",
      data,
    });
  },
);

export const PaymentController = {
  createPayment,
  handleStripeWebhook,
  getAllPayments,
  getAllPaymentsMe,
  getSinglePayment,
};
