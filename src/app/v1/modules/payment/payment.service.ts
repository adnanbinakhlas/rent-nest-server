import status from "http-status";
import { AppError } from "../../../helpers/AppError";
import prisma from "../../../libs/prisma";
import stripe from "../../../libs/stripe";
import env from "../../../configs/env";
import { PaymentModel } from "../../../../prisma/generated/prisma/models";

const createPayment = async (
  rentalId: string,
): Promise<{ checkoutUrl: string; payment: PaymentModel }> => {
  const result = await prisma.$transaction(
    async (tx): Promise<{ checkoutUrl: string; payment: PaymentModel }> => {
      const rental = await tx.rentalRequest.findUnique({
        where: { id: rentalId },
        include: {
          property: true,
          tenant: { include: { tenantPayments: true } },
        },
      });

      if (!rental) {
        throw new AppError(
          "Request rental record not found.",
          status.NOT_FOUND,
        );
      }

      if (rental.status !== "APPROVED") {
        throw new AppError(
          "You can not payment until landlord approves your rental request.",
        );
      }

      let stripeCustomerId = rental.tenant.tenantPayments[0]?.stripeCustomerId;

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          name: rental.tenant.fullname,
          email: rental.tenant.email,
          metadata: { userId: rental.tenantId },
        });

        stripeCustomerId = customer.id;
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer: stripeCustomerId,
        line_items: [
          {
            quantity: rental.rentalDuration,
            price_data: {
              currency: "usd",
              unit_amount: Number(rental.monthlyRent) * 100,

              product_data: {
                metadata: { propertyId: rental.propertyId },
                name: rental.property.title,
              },
            },
          },
        ],
        success_url: `${env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.CLIENT_URL}/payment/cancel`,
      });

      const payment = await tx.payment.create({
        data: {
          rentalRequestId: rental.id,
          tenantId: rental.tenantId,
          landlordId: rental.landlordId,
          stripePaymentIntentId: session.id,
          amount: session.amount_total as number,
          currency: session.currency as string,
        },
      });

      return { checkoutUrl: session.url as string, payment };
    },
  );

  return result;
};

export const PaymentService = {
  createPayment,
};
