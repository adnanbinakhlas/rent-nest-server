import status from "http-status";
import { PaymentModel } from "../../../../prisma/generated/prisma/models";
import env from "../../../configs/env";
import { AppError } from "../../../helpers/AppError";
import prisma from "../../../libs/prisma";
import stripe from "../../../libs/stripe";
import { PaymentStripeWebhook } from "./payment.stripe.webhook";

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
              unit_amount: Math.round(Number(rental.monthlyRent) * 100),
              product_data: {
                name: rental.property.title,
              },
            },
          },
        ],
        metadata: {
          propertyId: rental.propertyId,
          rentalId: rental.id,
        },
        success_url: `${env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.CLIENT_URL}/payment/cancel`,
      });

      const payment = await tx.payment.create({
        data: {
          rentalRequestId: rental.id,
          tenantId: rental.tenantId,
          landlordId: rental.landlordId,
          stripeSessionId: session.id,
          amount: session.amount_total as number,
          currency: session.currency as string,
        },
      });

      return { checkoutUrl: session.url as string, payment };
    },
  );

  return result;
};

const handleStripeEvents = async (
  payload: Buffer,
  signature: string,
): Promise<void> => {
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    env.STRIPE_WEBHOOK_SECRET,
  );

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      PaymentStripeWebhook.handleCheckoutSession(session);
      break;
    }
    default:
      // Unexpected event type
      // eslint-disable-next-line no-console
      console.log(`Unhandled event type ${event.type}.`);
  }
};

export const PaymentService = {
  createPayment,
  handleStripeEvents,
};
