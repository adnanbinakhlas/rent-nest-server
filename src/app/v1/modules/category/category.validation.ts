import z from "zod";

const createCategoryValidationSchema = z.object({
  name: z
    .string({
      error: "Category name is required.",
    })
    .trim()
    .min(2, "Category name must be at least 2 characters.")
    .max(50, "Category name cannot exceed 50 characters."),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters.")
    .optional(),
});

const updateCategoryValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters.")
    .max(50, "Category name cannot exceed 50 characters.")
    .optional(),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters.")
    .optional(),
});

export const CategoryValidation = {
  createCategoryValidationSchema,
  updateCategoryValidationSchema,
};
