import z from "zod";
import { PropertyValidation } from "./property.validation";

export type TCreatePropertyInput = z.infer<
  typeof PropertyValidation.createPropertyValidationSchema
>;

export type TUpdatePropertyInput = z.infer<
  typeof PropertyValidation.updatePropertyValidationSchema
>;
