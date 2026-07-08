/* eslint-disable no-console */
import Stripe from "stripe";
import prisma from "../../../libs/prisma";
import stripe from "../../../libs/stripe";
import {
  PaymentStatus,
  RentalRequestStatus,
} from "../../../../prisma/generated/prisma/enums";
import { RentalRequestUpdateInput } from "../../../../prisma/generated/prisma/models";

const handleCheckoutSession = async (
  session: Stripe.Checkout.Session,
): Promise<void> => {
  try {
    const rentalId = session.metadata?.rentalId as string;
    const paymentIntentId = session.payment_intent as string;
    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId,
      { expand: ["latest_charge"] },
    );
    const charge = paymentIntent.latest_charge as Stripe.Charge;
    const receiptUrl = charge?.receipt_url as string;
    const rentalStatus = RentalRequestStatus.ACTIVE;
    const paymentStatus = PaymentStatus.SUCCEEDED;
    const paidAt = new Date().toISOString();

    if (!rentalId || !receiptUrl || !paymentIntentId) {
      console.log("Webhook error: missing payment success required values.");
      return;
    }

    const data: RentalRequestUpdateInput = {
      status: rentalStatus,
      payment: {
        update: {
          status: paymentStatus,
          stripePaymentIntentId: paymentIntentId,
          receiptUrl,
          paidAt,
        },
      },
    };

    await prisma.rentalRequest.update({
      where: { id: rentalId },
      data,
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
      console.log("Webhook error: missing payment fail required values.");
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
