import { Router } from "express";
import authGuard from "../../../middlewares/authGuard.middleware";
import { UserRole } from "../../../../prisma/generated/prisma/enums";
import { ReviewController } from "./review.controller";
import validateRequest from "../../../middlewares/validateRequest.middleware";
import { ReviewValidation } from "./review.validation";

const router: Router = Router();

router.post(
  "/",
  authGuard(UserRole.TENANT),
  validateRequest(ReviewValidation.createReviewValidationSchema),
  ReviewController.createReview,
);

router.get("/", ReviewController.getAllReviews);

export const ReviewRoutes = router;
