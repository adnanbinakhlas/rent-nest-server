import { Router } from "express";
import { UserController } from "./user.controller";
import validateRequest from "../../../middlewares/validateRequest.middleware";
import { UserValidation } from "./user.validation";
import authGuard from "../../../middlewares/authGuard.middleware";
import { UserRole } from "../../../../prisma/generated/prisma/enums";

const router: Router = Router();

router.post(
  "/",
  validateRequest(UserValidation.registerValidationSchema),
  UserController.register,
);

router.get(
  "/me",
  authGuard(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT),
  UserController.profileMe,
);

export const UserRoutes = router;
