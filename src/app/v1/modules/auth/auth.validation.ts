import z from "zod";

export const loginValidationSchema = z.object({
  email: z.email("Please provide a valid email address.").trim().toLowerCase(),

  password: z
    .string({
      error: "Password is required.",
    })
    .min(1, "Password is required."),
});

export const AuthValidation = { loginValidationSchema };
