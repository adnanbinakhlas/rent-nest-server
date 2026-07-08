/* eslint-disable no-console */
import Stripe from "stripe";
import prisma from "../../../libs/prisma";
import stripe from "../../../libs/stripe";
import { PaymentStatus } from "../../../../prisma/generated/prisma/enums";

const handleCheckoutSession = async (
  session: Stripe.Checkout.Session,
): Promise<void> => {
  try {
    const rentalId = session.metadata?.rentalId as string;
    const _propertyId = session.metadata?.propertyId as string;

    const paymentIntent = await stripe.paymentIntents.retrieve(
      session.payment_intent as string,
      { expand: ["latest_charge"] },
    );

    const charge = paymentIntent.latest_charge as Stripe.Charge;

    const receiptUrl = charge?.receipt_url;

    await prisma.rentalRequest.update({
      where: { id: rentalId },
      data: {
        status: "ACTIVE",
        payment: {
          update: {
            status: "SUCCEEDED",
            stripeCustomerId: session.customer as string,
            paymentMethod: session.payment_method_types[0] as string,
            currency: session.currency as string,
            paidAt: new Date().toISOString(),
            stripePaymentIntentId: session.payment_intent as string,
            receiptUrl,
          },
        },
      },
    });
  } catch (error: unknown) {
    console.error(error);
  }
};

const handlePaymentIntentFail = async (
  session: Stripe.PaymentIntent,
): Promise<void> => {
  try {
    const paymentIntentId = session.id;
    const rentalId = session.metadata?.rentalId as string;
    const status = PaymentStatus.FAILED;
    const failedAt = new Date().toISOString();
    const failedCode = session.last_payment_error?.code as string;
    const failedDeclineCode = session.last_payment_error
      ?.decline_code as string;
    const failedReason = session.last_payment_error?.message as string;

    if (
      !paymentIntentId ||
      !rentalId ||
      !failedCode ||
      !failedDeclineCode ||
      !failedReason
    ) {
      console.log("Webhook error: Required values not found.");
      return;
    }

    const data = {
      status,
      paymentIntentId,
      failedAt,
      failedCode,
      failedDeclineCode,
      failedReason,
    };

    const rental = await prisma.rentalRequest.findUnique({
      where: { id: rentalId },
      select: { payment: { select: { id: true } } },
    });

    await prisma.payment.update({
      where: { id: rental?.payment?.id as string },
      data,
    });
  } catch (error: unknown) {
    console.error(error);
  }
};

export const PaymentStripeWebhook = {
  handleCheckoutSession,
  handlePaymentIntentFail,
};
