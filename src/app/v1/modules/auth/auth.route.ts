import { Router } from "express";
import { AuthController } from "./auth.controller";
import validateRequest from "../../../middlewares/validateRequest.middleware";
import { AuthValidation } from "./auth.validation";

const router: Router = Router();

router.post(
  "/login",
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.login,
);

export const AuthRoutes = router;
