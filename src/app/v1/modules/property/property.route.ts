import { Router } from "express";
import { PropertyController } from "./property.controller";
import authGuard from "../../../middlewares/authGuard.middleware";
import { UserRole } from "../../../../prisma/generated/prisma/enums";
import validateRequest from "../../../middlewares/validateRequest.middleware";
import { PropertyValidation } from "./property.validation";

const router: Router = Router();

router.post(
  "/",
  authGuard(UserRole.LANDLORD),
  validateRequest(PropertyValidation.createPropertyValidationSchema),
  PropertyController.createProperty,
);

router.put(
  "/:id",
  authGuard(UserRole.LANDLORD),
  validateRequest(PropertyValidation.updatePropertyValidationSchema),
  PropertyController.updateProperty,
);

router.get("/", PropertyController.getAllProperties);

router.get(
  "/me",
  authGuard(UserRole.LANDLORD),
  PropertyController.getPropertiesMe,
);

router.get("/:id", PropertyController.getSingleProperty);

export const PropertyRoutes = router;
