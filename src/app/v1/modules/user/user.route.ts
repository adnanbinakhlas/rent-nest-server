import { Router } from "express";
import { UserController } from "./user.controller";
import validateRequest from "../../../middlewares/validateRequest.middleware";
import { UserValidation } from "./user.validation";
import authGuard from "../../../middlewares/authGuard.middleware";
import { UserRole } from "../../../../prisma/generated/prisma/enums";
import upload from "../../../middlewares/multer.middleware";

const router: Router = Router();

router.post(
  "/",
  upload.single("avatar"),
  validateRequest(UserValidation.registerValidationSchema),
  UserController.register,
);

router.get(
  "/me",
  authGuard(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT),
  UserController.profileMe,
);

router.get("/", authGuard(UserRole.ADMIN), UserController.getAllUsers);

router.get("/:id", authGuard(UserRole.ADMIN), UserController.getSingleUser);

router.patch(
  "/:id",
  authGuard(UserRole.ADMIN),
  validateRequest(UserValidation.updateUserStatusValidationSchema),
  UserController.updateUserStatus,
);

export const UserRoutes = router;
