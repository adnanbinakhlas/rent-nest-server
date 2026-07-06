import { Router } from "express";
import { UserController } from "./user.controller";
import validateRequest from "../../../middlewares/validateRequest.middleware";
import { UserValidation } from "./user.validation";

const router: Router = Router();

router.post(
  "/",
  validateRequest(UserValidation.registerValidationSchema),
  UserController.register,
);

export const userRoutes = router;
