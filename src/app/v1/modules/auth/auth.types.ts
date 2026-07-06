import z from "zod";
import { AuthValidation } from "./auth.validation";

export type TLoginInput = z.infer<typeof AuthValidation.loginValidationSchema>;
