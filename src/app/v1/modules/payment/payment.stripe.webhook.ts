import Stripe from "stripe";
import prisma from "../../../libs/prisma";
import stripe from "../../../libs/stripe";

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
    // eslint-disable-next-line no-console
    console.error(error);
    throw error;
  }
};

export const PaymentStripeWebhook = {
  handleCheckoutSession,
};
