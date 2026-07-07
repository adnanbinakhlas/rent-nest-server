import { Router } from "express";
import { PaymentController } from "./payment.controller";
import authGuard from "../../../middlewares/authGuard.middleware";
import { UserRole } from "../../../../prisma/generated/prisma/enums";
import validateRequest from "../../../middlewares/validateRequest.middleware";
import { PaymentValidation } from "./payment.validation";

const router: Router = Router();

router.post(
  "/create",
  authGuard(UserRole.TENANT),
  validateRequest(PaymentValidation.createPaymentValidationSchema),
  PaymentController.createPayment,
);

router.post("/confirm", PaymentController.handleStripeWebhook);

export const PaymentRoutes = router;
