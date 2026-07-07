import status from "http-status";
import { RentalRequestModel } from "../../../../prisma/generated/prisma/models";
import { AppError } from "../../../helpers/AppError";
import prisma from "../../../libs/prisma";
import {
  TCreateRentalRequestInput,
  TUpdateRentalRequestInput,
} from "./rental.types";

const insertRentalIntoDb = async (
  payload: TCreateRentalRequestInput,
  userId: string,
): Promise<RentalRequestModel> => {
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

export const RentalService = {
  insertRentalIntoDb,
  updateRentalFromDb,
};
