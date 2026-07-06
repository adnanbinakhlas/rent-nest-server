import z from "zod";

const createPropertyValidationSchema = z.object({
  categoryId: z.uuid("Invalid category id."),

  title: z
    .string({
      error: "Title is required.",
    })
    .trim()
    .min(5, "Title must be at least 5 characters.")
    .max(150, "Title cannot exceed 150 characters."),

  description: z
    .string({
      error: "Description is required.",
    })
    .trim()
    .min(20, "Description must be at least 20 characters.")
    .max(3000, "Description cannot exceed 3000 characters."),

  address: z
    .string({
      error: "Address is required.",
    })
    .trim()
    .min(5, "Address is required."),

  city: z
    .string({
      error: "City is required.",
    })
    .trim()
    .min(2, "City is required."),

  area: z
    .string({
      error: "Area is required.",
    })
    .trim()
    .min(2, "Area is required."),

  latitude: z
    .number({
      error: "Latitude is required.",
    })
    .min(-90)
    .max(90),

  longitude: z
    .number({
      error: "Longitude is required.",
    })
    .min(-180)
    .max(180),

  monthlyRent: z
    .number({
      error: "Monthly rent is required.",
    })
    .positive("Monthly rent must be greater than 0."),

  securityDeposit: z
    .number({
      error: "Security deposit is required.",
    })
    .min(0),

  bedrooms: z
    .number({
      error: "Bedrooms are required.",
    })
    .int()
    .min(1),

  bathrooms: z
    .number({
      error: "Bathrooms are required.",
    })
    .int()
    .min(1),

  floor: z
    .number({
      error: "Floor is required.",
    })
    .int()
    .min(0),

  furnished: z.boolean({
    error: "Furnished status is required.",
  }),

  size: z
    .number({
      error: "Property size is required.",
    })
    .positive(),

  sizeUnit: z.enum(["SQFT", "SQM"], {
    error: "Size unit is required.",
  }),

  availableFrom: z.coerce.date({
    error: "Available from date is required.",
  }),

  available: z.boolean({
    error: "Availability status is required.",
  }),

  amenities: z
    .array(z.string().uuid("Invalid amenity id."))
    .min(1, "Select at least one amenity."),

  images: z
    .array(
      z.object({
        imageUrl: z.url("Invalid image URL."),
        isPrimary: z.boolean().default(false),
      }),
    )
    .min(1, "At least one property image is required."),
});

const updatePropertyValidationSchema = z.object({
  categoryId: z.uuid("Invalid category id.").optional(),

  title: z
    .string({
      error: "Title is required.",
    })
    .trim()
    .min(5, "Title must be at least 5 characters.")
    .max(150, "Title cannot exceed 150 characters.")
    .optional(),

  description: z
    .string({
      error: "Description is required.",
    })
    .trim()
    .min(20, "Description must be at least 20 characters.")
    .max(3000, "Description cannot exceed 3000 characters.")
    .optional(),

  address: z
    .string({
      error: "Address is required.",
    })
    .trim()
    .min(5, "Address is required.")
    .optional(),

  city: z
    .string({
      error: "City is required.",
    })
    .trim()
    .min(2, "City is required.")
    .optional(),

  area: z
    .string({
      error: "Area is required.",
    })
    .trim()
    .min(2, "Area is required.")
    .optional(),

  latitude: z
    .number({
      error: "Latitude is required.",
    })
    .min(-90)
    .max(90)
    .optional(),

  longitude: z
    .number({
      error: "Longitude is required.",
    })
    .min(-180)
    .max(180)
    .optional(),

  monthlyRent: z
    .number({
      error: "Monthly rent is required.",
    })
    .positive("Monthly rent must be greater than 0.")
    .optional(),

  securityDeposit: z
    .number({
      error: "Security deposit is required.",
    })
    .min(0)
    .optional(),

  bedrooms: z
    .number({
      error: "Bedrooms are required.",
    })
    .int()
    .min(1)
    .optional(),

  bathrooms: z
    .number({
      error: "Bathrooms are required.",
    })
    .int()
    .min(1)
    .optional(),

  floor: z
    .number({
      error: "Floor is required.",
    })
    .int()
    .min(0)
    .optional(),

  furnished: z
    .boolean({
      error: "Furnished status is required.",
    })
    .optional(),

  size: z
    .number({
      error: "Property size is required.",
    })
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

  available: z
    .boolean({
      error: "Availability status is required.",
    })
    .optional(),

  amenities: z
    .array(z.string().uuid("Invalid amenity id."))
    .min(1, "Select at least one amenity.")
    .optional(),

  images: z
    .array(
      z.object({
        imageUrl: z.url("Invalid image URL."),
        isPrimary: z.boolean().default(false),
      }),
    )
    .min(1, "At least one property image is required.")
    .optional(),
});

export const PropertyValidation = {
  createPropertyValidationSchema,
  updatePropertyValidationSchema,
};
