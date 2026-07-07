import { Router } from "express";
import { RentalController } from "./rental.controller";
import authGuard from "../../../middlewares/authGuard.middleware";
import validateRequest from "../../../middlewares/validateRequest.middleware";
import { RentalValidation } from "./rental.validation";
import { UserRole } from "../../../../prisma/generated/prisma/enums";

const router: Router = Router();

router.post(
  "/",
  authGuard(UserRole.TENANT),
  validateRequest(RentalValidation.createRentalRequestValidationSchema),
  RentalController.submitRentalRequest,
);

router.put(
  "/:id",
  authGuard(UserRole.TENANT),
  validateRequest(RentalValidation.updateRentalRequestValidationSchema),
  RentalController.updateRentalRequest,
);

export const RentalRoutes = router;
