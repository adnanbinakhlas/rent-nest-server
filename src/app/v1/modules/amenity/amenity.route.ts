import { Router } from "express";
import { AmenityController } from "./amenity.controller";
import { AmenityValidation } from "./amenity.validation";
import authGuard from "../../../middlewares/authGuard.middleware";
import { UserRole } from "../../../../prisma/generated/prisma/client";
import validateRequest from "../../../middlewares/validateRequest.middleware";

const router: Router = Router();

router.post(
  "/",
  authGuard(UserRole.ADMIN),
  validateRequest(AmenityValidation.createAmenityValidationSchema),
  AmenityController.createAmenity,
);

router.put(
  "/:id",
  authGuard(UserRole.ADMIN),
  validateRequest(AmenityValidation.updateAmenityValidationSchema),
  AmenityController.updateAmenity,
);

router.get("/", AmenityController.getAllAmenities);

router.get("/:id", AmenityController.getSingleAmenity);

export const AmenityRoutes = router;
