import z from "zod";

const createRentalRequestValidationSchema = z.object({
  propertyId: z.uuid("Property is required."),

  moveInDate: z.coerce
    .date({
      error: "Move-in date is required.",
    })
    .refine((date) => date > new Date(), {
      message: "Move-in date must be in the future.",
    }),

  rentalDuration: z
    .number({
      error: "Rental duration is required.",
    })
    .int("Rental duration must be an integer.")
    .min(1, "Minimum rental duration is 1 month.")
    .max(60, "Maximum rental duration is 60 months."),

  message: z
    .string()
    .trim()
    .max(500, "Message cannot exceed 500 characters.")
    .optional(),
});

const updateRentalRequestValidationSchema = z
  .object({
    moveInDate: z.coerce
      .date()
      .refine((date) => date > new Date(), {
        message: "Move-in date must be in the future.",
      })
      .optional(),

    rentalDuration: z.number().int().min(1).max(60).optional(),

    message: z.string().trim().max(500).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required.",
  });

const updateRentalStatusValidationSchema = z
  .object({
    status: z.enum(["APPROVED", "REJECTED"], {
      error: "Status is required.",
    }),

    rejectionReason: z.string().trim().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.status === "REJECTED" &&
      (!data.rejectionReason || data.rejectionReason.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rejectionReason"],
        message: "Rejection reason is required when rejecting a request.",
      });
    }
  });

export const RentalValidation = {
  createRentalRequestValidationSchema,
  updateRentalRequestValidationSchema,
  updateRentalStatusValidationSchema,
};
