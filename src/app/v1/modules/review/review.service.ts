import status from "http-status";
import { AppError } from "../../../helpers/AppError";
import prisma from "../../../libs/prisma";
import { TCreateReview } from "./review.types";
import { ReviewModel } from "../../../../prisma/generated/prisma/models";
import { TQuery } from "../../../interfaces";
import { queryBuilder } from "../../../utils/queryBuilder";
import { IMeta } from "../../../utils/sendResponse";

const insertReviewIntoDb = async (
  payload: TCreateReview,
  userId: string,
): Promise<Pick<ReviewModel, "id">> => {
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
    select: { id: true },
  });

  return review;
};

const getAllReviewsFromDb = async (
  query: TQuery,
): Promise<{ reviews: ReviewModel[]; meta: IMeta }> => {
  const pagination = queryBuilder.pagination(query);
  const sorting = queryBuilder.sorting(query);
  const totalReviews = await prisma.review.count();
  const totalPages = queryBuilder.countPages(totalReviews, pagination.limit);
  const fields = queryBuilder.parseFields(query.fields);

  if (pagination.page >= totalPages) {
    pagination.nextPage = null;
  }

  const reviews = await prisma.review.findMany({
    select: fields,
    take: pagination.limit,
    skip: pagination.skip,
    orderBy: sorting,
  });

  return {
    reviews,
    meta: {
      totalPages,
      totalReviews,
      limit: pagination.limit,
      page: pagination.page,
      nextPage: pagination.nextPage,
      prevPage: pagination.prevPage,
    },
  };
};

export const ReviewService = {
  insertReviewIntoDb,
  getAllReviewsFromDb,
};
