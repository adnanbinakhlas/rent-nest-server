import z from "zod";
import { CategoryValidation } from "./category.validation";

export type TCreateCategoryInput = z.infer<
  typeof CategoryValidation.createCategoryValidationSchema
>;

export type TUpdateCategoryInput = z.infer<
  typeof CategoryValidation.updateCategoryValidationSchema
>;
