import status from "http-status";
import { AppError } from "../../../helpers/AppError";
import prisma from "../../../libs/prisma";
import { TCreateRentalRequestInput } from "./rental.types";
import { RentalRequestModel } from "../../../../prisma/generated/prisma/models";

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

export const RentalService = {
  insertRentalIntoDb,
};
