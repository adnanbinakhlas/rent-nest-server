import { Router } from "express";
import { PropertyController } from "./property.controller";
import authGuard from "../../../middlewares/authGuard.middleware";
import { UserRole } from "../../../../prisma/generated/prisma/enums";

const router: Router = Router();

router.post(
  "/",
  authGuard(UserRole.LANDLORD),
  PropertyController.createProperty,
);

router.put(
  "/:id",
  authGuard(UserRole.LANDLORD),
  PropertyController.updateProperty,
);

router.get("/", PropertyController.getAllProperties);

router.get("/:id", PropertyController.getSingleProperty);

export const PropertyRoutes = router;
