import z from "zod";
import { UserValidation } from "./user.validation";

export type RegisterInput = z.infer<
  typeof UserValidation.registerValidationSchema
>;
