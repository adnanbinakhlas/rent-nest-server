import status from "http-status";
import {
  RentalRequestModel,
  RentalRequestUpdateInput,
} from "../../../../prisma/generated/prisma/models";
import { AppError } from "../../../helpers/AppError";
import { TQuery } from "../../../interfaces";
import prisma from "../../../libs/prisma";
import { queryBuilder } from "../../../utils/queryBuilder";
import {
  TCreateRentalRequestInput,
  TRentalReturnType,
  TUpdateRentalRequestInput,
  TUpdateRentalStatusInput,
} from "./rental.types";

const insertRentalIntoDb = async (
  payload: TCreateRentalRequestInput,
  userId: string,
): Promise<Pick<RentalRequestModel, "id">> => {
  const property = await prisma.property.findUnique({
    where: { id: payload.propertyId },
  });

  if (!property) {
    throw new AppError("Requested property not found.", status.NOT_FOUND);
  }

  const rental = await prisma.rentalRequest.create({
    data: {
      ...payload,
      tenantId: userId,
      landlordId: property.landlordId,
      monthlyRent: property.monthlyRent,
    },
    select: { id: true },
  });

  return rental;
};

const updateRentalFromDb = async (
  rentalId: string,
  payload: TUpdateRentalRequestInput,
  userId: string,
): Promise<RentalRequestModel> => {
  const exists = await prisma.rentalRequest.findUnique({
    where: { id: rentalId },
  });

  if (!exists) {
    throw new AppError("Requested rental not found.", status.NOT_FOUND);
  }

  if (userId !== exists.tenantId) {
    throw new AppError(
      "Permission denied. You are not permitted to update others rental",
      status.FORBIDDEN,
    );
  }

  const rental = await prisma.rentalRequest.update({
    where: { id: rentalId },
    data: payload,
  });

  return rental;
};

const updateRentalStatusFromDb = async (
  rentalId: string,
  payload: TUpdateRentalStatusInput,
): Promise<RentalRequestModel> => {
  const exists = await prisma.rentalRequest.findUnique({
    where: { id: rentalId },
  });

  if (!exists) {
    throw new AppError("Requested rental not found.", status.NOT_FOUND);
  }

  const data: RentalRequestUpdateInput = {};

  if (payload.status === "REJECTED") {
    data.rejectedAt = new Date().toISOString();
    data.status = "REJECTED";
    data.rejectionReason = payload.rejectionReason || null;
  } else {
    data.approvedAt = new Date().toISOString();
    data.status = payload.status;
  }

  const rental = await prisma.rentalRequest.update({
    where: { id: rentalId },
    data,
  });

  return rental;
};

const getAllRentalsFromDb = async (
  query: TQuery,
): Promise<TRentalReturnType> => {
  const pagination = queryBuilder.pagination(query);
  const sorting = queryBuilder.sorting(query);
  const totalRentals = await prisma.rentalRequest.count();
  const totalPages = queryBuilder.countPages(totalRentals, pagination.limit);
  const fields = queryBuilder.parseFields(query.fields);

  if (pagination.page >= totalPages) {
    pagination.nextPage = null;
  }

  const meta = {
    totalPages,
    totalRentals,
    limit: pagination.limit,
    page: pagination.page,
    nextPage: pagination.nextPage,
    prevPage: pagination.prevPage,
  };

  const rentals = await prisma.rentalRequest.findMany({
    select: fields,
    take: pagination.limit,
    skip: pagination.skip,
    orderBy: sorting,
  });

  return {
    rentals,
    meta,
  };
};

const getRentalById = async (
  id: string,
  query: TQuery,
): Promise<RentalRequestModel> => {
  const fields = queryBuilder.parseFields(query.fields);
  const rental = await prisma.rentalRequest.findUnique({
    where: { id },
    select: fields,
  });

  if (!rental) {
    throw new AppError("Request rental record not found.", status.NOT_FOUND);
  }

  return rental;
};

export const RentalService = {
  insertRentalIntoDb,
  updateRentalFromDb,
  updateRentalStatusFromDb,
  getAllRentalsFromDb,
  getRentalById,
};
