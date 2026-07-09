import status from "http-status";
import { AppError } from "../../../helpers/AppError";
import prisma from "../../../libs/prisma";
import { TCreateReview } from "./review.types";
import { ReviewModel } from "../../../../prisma/generated/prisma/models";

const insertReviewIntoDb = async (
  payload: TCreateReview,
  userId: string,
): Promise<ReviewModel> => {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id: payload.rentalRequestId },
    select: { id: true, tenantId: true, status: true, propertyId: true },
  });

  if (!rental) {
    throw new AppError("Requested rental record not found.", status.NOT_FOUND);
  }

  if (userId !== rental.tenantId) {
    throw new AppError(
      "Reviews can only be submitted by tenants who have rented this property.",
      status.FORBIDDEN,
    );
  }

  if (rental.status !== "COMPLETED") {
    throw new AppError(
      "Reviews can only be submitted for completed rentals.",
      status.FORBIDDEN,
    );
  }

  const review = await prisma.review.create({
    data: {
      rentalRequestId: rental.id,
      tenantId: rental.tenantId,
      propertyId: rental.propertyId,
      comment: payload.comment,
      rating: payload.rating,
    },
  });

  return review;
};

const getAllReviewsFromDb = async (): Promise<ReviewModel[]> => {
  const reviews = await prisma.review.findMany();

  return reviews;
};

export const ReviewService = {
  insertReviewIntoDb,
  getAllReviewsFromDb,
};
