import z from "zod";

const createPaymentValidationSchema = z.object({
  rentalRequestId: z.uuid("Invalid rental request id."),
});

export const PaymentValidation = {
  createPaymentValidationSchema,
};
