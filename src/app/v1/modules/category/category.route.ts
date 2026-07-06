import { Router } from "express";
import authGuard from "../../../middlewares/authGuard.middleware";
import { UserRole } from "../../../../prisma/generated/prisma/enums";
import { CategoryController } from "./category.controller";
import validateRequest from "../../../middlewares/validateRequest.middleware";
import { CategoryValidation } from "./category.validation";

const router: Router = Router();

router.post(
  "/",
  authGuard(UserRole.ADMIN),
  validateRequest(CategoryValidation.createCategoryValidationSchema),
  CategoryController.createCategory,
);

router.put(
  "/:id",
  authGuard(UserRole.ADMIN),
  validateRequest(CategoryValidation.updateCategoryValidationSchema),
  CategoryController.updateCategory,
);

router.get("/", CategoryController.getAllCategories);

router.get("/:id", CategoryController.getSingleCategory);

export const CategoryRoutes = router;
