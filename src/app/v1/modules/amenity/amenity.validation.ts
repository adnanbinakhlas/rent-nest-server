import z from "zod";

const createAmenityValidationSchema = z.object({
  name: z
    .string({
      error: "Amenity name is required.",
    })
    .trim()
    .min(2, "Amenity name must be at least 2 characters.")
    .max(50, "Amenity name cannot exceed 50 characters."),
});

const updateAmenityValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Amenity name must be at least 2 characters.")
    .max(50, "Amenity name cannot exceed 50 characters."),
});

export const AmenityValidation = {
  createAmenityValidationSchema,
  updateAmenityValidationSchema,
};
