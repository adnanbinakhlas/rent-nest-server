import z from "zod";
import { UserRole } from "../../../../prisma/generated/prisma/enums";

const registerValidationSchema = z.object({
  fullname: z
    .string({
      error: "Name is required.",
    })
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name cannot exceed 100 characters."),

  email: z.email("Please provide a valid email address.").trim().toLowerCase(),

  password: z
    .string({
      error: "Password is required.",
    })
    .min(8, "Password must be at least 8 characters.")
    .max(16, "Password cannot exceed 16 characters.")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/\d/, "Password must contain at least one number.")
    .regex(
      /[@$!%*?&^#()_\-+=]/,
      "Password must contain at least one special character.",
    ),

  phone: z
    .string({
      error: "Phone number is required.",
    })
    .trim()
    .regex(
      /^\+[1-9]\d{1,14}$/,
      "Phone number must be in E.164 format (e.g. +14155552671).",
    ),

  avatar: z.url("Profile image must be a valid URL.").optional(),

  role: z.enum([UserRole.LANDLORD, UserRole.TENANT], {
    error: "Role is required.",
  }),
});

export const UserValidation = {
  registerValidationSchema,
};
