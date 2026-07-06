import z from "zod";
import { UserValidation } from "./user.validation";

export type TRegisterInput = z.infer<
  typeof UserValidation.registerValidationSchema
>;
