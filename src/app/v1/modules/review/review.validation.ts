import z from "zod";

const createReviewValidationSchema = z.object({
  rentalRequestId: z.uuid("Invalid rental request id."),

  rating: z.coerce
    .number({
      error: "Rating is required.",
    })
    .min(1, "Rating must be at least 1.")
    .max(5, "Rating cannot be greater than 5."),

  comment: z
    .string({
      error: "Comment is required.",
    })
    .trim()
    .min(10, "Comment must be at least 10 characters.")
    .max(1000, "Comment cannot exceed 1000 characters."),
});

const updateReviewValidationSchema = z.object({
  rating: z.coerce
    .number({
      error: "Rating is required.",
    })
    .min(1, "Rating must be at least 1.")
    .max(5, "Rating cannot be greater than 5.")
    .optional(),

  comment: z
    .string({
      error: "Comment is required.",
    })
    .trim()
    .min(10, "Comment must be at least 10 characters.")
    .max(1000, "Comment cannot exceed 1000 characters.")
    .optional(),
});

export const ReviewValidation = {
  createReviewValidationSchema,
  updateReviewValidationSchema,
};
