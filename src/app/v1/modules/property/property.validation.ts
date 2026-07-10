import z from "zod";

const amenitiesSchema = z.preprocess(
  (value) => {
    if (typeof value === "string") {
      try {
        return value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      } catch {
        return [];
      }
    }

    return value;
  },
  z.array(z.uuid("Invalid amenity id.")).min(1, "Select at least one amenity."),
);

const createPropertyValidationSchema = z.object({
  categoryId: z.uuid("Invalid category id."),

  title: z
    .string({ error: "Title is required." })
    .trim()
    .min(5, "Title must be at least 5 characters.")
    .max(150, "Title cannot exceed 150 characters."),

  description: z
    .string({ error: "Description is required." })
    .trim()
    .min(20, "Description must be at least 20 characters.")
    .max(3000, "Description cannot exceed 3000 characters."),

  address: z
    .string({ error: "Address is required." })
    .trim()
    .min(5, "Address is required."),

  city: z
    .string({ error: "City is required." })
    .trim()
    .min(2, "City is required."),

  area: z
    .string({ error: "Area is required." })
    .trim()
    .min(2, "Area is required."),

  latitude: z.coerce
    .number({ error: "Latitude is required." })
    .min(-90)
    .max(90),

  longitude: z.coerce
    .number({ error: "Longitude is required." })
    .min(-180)
    .max(180),

  monthlyRent: z.coerce
    .number({ error: "Monthly rent is required." })
    .positive("Monthly rent must be greater than 0."),

  securityDeposit: z.coerce
    .number({ error: "Security deposit is required." })
    .min(0),

  bedrooms: z.coerce.number({ error: "Bedrooms are required." }).int().min(1),

  bathrooms: z.coerce.number({ error: "Bathrooms are required." }).int().min(1),

  floor: z.coerce.number({ error: "Floor is required." }).int().min(0),

  furnished: z.coerce.boolean({
    error: "Furnished status is required.",
  }),

  size: z.coerce.number({ error: "Property size is required." }).positive(),

  sizeUnit: z.enum(["SQFT", "SQM"], {
    error: "Size unit is required.",
  }),

  availableFrom: z.coerce.date({
    error: "Available from date is required.",
  }),

  available: z.coerce.boolean({
    error: "Availability status is required.",
  }),

  amenities: amenitiesSchema,
});

const updatePropertyValidationSchema = z.object({
  categoryId: z.uuid("Invalid category id.").optional(),

  title: z
    .string({ error: "Title is required." })
    .trim()
    .min(5, "Title must be at least 5 characters.")
    .max(150, "Title cannot exceed 150 characters.")
    .optional(),

  description: z
    .string({ error: "Description is required." })
    .trim()
    .min(20, "Description must be at least 20 characters.")
    .max(3000, "Description cannot exceed 3000 characters.")
    .optional(),

  address: z
    .string({ error: "Address is required." })
    .trim()
    .min(5, "Address is required.")
    .optional(),

  city: z
    .string({ error: "City is required." })
    .trim()
    .min(2, "City is required.")
    .optional(),

  area: z
    .string({ error: "Area is required." })
    .trim()
    .min(2, "Area is required.")
    .optional(),

  latitude: z.coerce
    .number({ error: "Latitude is required." })
    .min(-90)
    .max(90)
    .optional(),

  longitude: z.coerce
    .number({ error: "Longitude is required." })
    .min(-180)
    .max(180)
    .optional(),

  monthlyRent: z.coerce
    .number({ error: "Monthly rent is required." })
    .positive("Monthly rent must be greater than 0.")
    .optional(),

  securityDeposit: z.coerce
    .number({ error: "Security deposit is required." })
    .min(0)
    .optional(),

  bedrooms: z.coerce
    .number({ error: "Bedrooms are required." })
    .int()
    .min(1)
    .optional(),

  bathrooms: z.coerce
    .number({ error: "Bathrooms are required." })
    .int()
    .min(1)
    .optional(),

  floor: z.coerce
    .number({ error: "Floor is required." })
    .int()
    .min(0)
    .optional(),

  furnished: z.coerce
    .boolean({
      error: "Furnished status is required.",
    })
    .optional(),

  size: z.coerce
    .number({ error: "Property size is required." })
    .positive()
    .optional(),

  sizeUnit: z
    .enum(["SQFT", "SQM"], {
      error: "Size unit is required.",
    })
    .optional(),

  availableFrom: z.coerce
    .date({
      error: "Available from date is required.",
    })
    .optional(),

  available: z.coerce
    .boolean({
      error: "Availability status is required.",
    })
    .optional(),

  amenities: amenitiesSchema.optional(),
});

export const PropertyValidation = {
  createPropertyValidationSchema,
  updatePropertyValidationSchema,
};
