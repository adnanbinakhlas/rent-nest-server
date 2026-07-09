import status from "http-status";
import {
  PaymentModel,
  PaymentWhereInput,
} from "../../../../prisma/generated/prisma/models";
import env from "../../../configs/env";
import { AppError } from "../../../helpers/AppError";
import prisma from "../../../libs/prisma";
import stripe from "../../../libs/stripe";
import { PaymentStripeWebhook } from "./payment.stripe.webhook";
import { queryBuilder } from "../../../utils/queryBuilder";
import { IMeta } from "../../../utils/sendResponse";
import { TQuery } from "../../../interfaces";

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
          stripeCustomerId,
          paymentMethod: session.payment_method_types[0] as string,
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
    case "payment_intent.payment_failed": {
      const session = event.data.object;
      PaymentStripeWebhook.handlePaymentIntentFail(session);
      break;
    }
    default:
      // Unexpected event type
      // eslint-disable-next-line no-console
      console.log(`Unhandled event type ${event.type}.`);
  }
};

const getAllPaymentsFromDb = async (
  query: Record<string, string | undefined>,
): Promise<{ payments: PaymentModel[]; meta: IMeta }> => {
  const pagination = queryBuilder.pagination(query);
  const sorting = queryBuilder.sorting(query);
  const fields = queryBuilder.parseFields(query.fields);

  const totalPayments = await prisma.property.count();
  const totalPages = queryBuilder.countPages(totalPayments, pagination.limit);
  if (pagination.page >= totalPages) {
    pagination.nextPage = null;
  }

  const payments = await prisma.payment.findMany({
    select: fields,
    take: pagination.limit,
    skip: pagination.skip,
    orderBy: sorting,
  });

  return {
    payments,
    meta: {
      totalPages,
      totalPayments,
      limit: pagination.limit,
      page: pagination.page,
      nextPage: pagination.nextPage,
      prevPage: pagination.prevPage,
    },
  };
};

const getAllPaymentsMeFromDb = async (
  userId: string,
  query: Record<string, string | undefined>,
): Promise<{ payments: PaymentModel[]; meta: IMeta }> => {
  const pagination = queryBuilder.pagination(query);
  const sorting = queryBuilder.sorting(query);
  const fields = queryBuilder.parseFields(query.fields);

  const whereInput: PaymentWhereInput = {
    OR: [{ tenantId: userId }, { landlordId: userId }],
  };

  const totalPayments = await prisma.payment.count({ where: whereInput });
  const totalPages = queryBuilder.countPages(totalPayments, pagination.limit);
  if (pagination.page >= totalPages) {
    pagination.nextPage = null;
  }

  const payments = await prisma.payment.findMany({
    where: whereInput,
    select: fields,
    take: pagination.limit,
    skip: pagination.skip,
    orderBy: sorting,
  });

  return {
    payments,
    meta: {
      totalPages,
      totalPayments,
      limit: pagination.limit,
      page: pagination.page,
      nextPage: pagination.nextPage,
      prevPage: pagination.prevPage,
    },
  };
};

const getPaymentById = async (
  query: TQuery,
  userId: string,
  isAdmin: boolean,
  paymentId: string,
): Promise<PaymentModel> => {
  const fields = queryBuilder.parseFields(query.fields);
  const payment = await prisma.payment.findUnique({
    select: fields,
    where: { id: paymentId },
  });

  if (!payment) {
    throw new AppError("Requested payment record not found.", status.NOT_FOUND);
  }

  if (
    !isAdmin &&
    userId !== payment.landlordId &&
    userId !== payment.tenantId
  ) {
    throw new AppError(
      "Access forbidden. You are not authorized to view others payment",
    );
  }

  return payment;
};

export const PaymentService = {
  createPayment,
  handleStripeEvents,
  getAllPaymentsFromDb,
  getAllPaymentsMeFromDb,
  getPaymentById,
};
