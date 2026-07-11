import { RentalRequestModel } from "../../../../prisma/generated/prisma/models";
import { IMeta } from "../../../utils/sendResponse";

export type TCreateRentalRequestInput = {
  propertyId: string;
  moveInDate: Date;
  rentalDuration: number;
  message?: string;
};

export type TUpdateRentalRequestInput = {
  moveInDate?: Date;
  rentalDuration?: number;
  message?: string;
};

export type TUpdateRentalStatusInput = {
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
};

export type TRentalReturnType = { rentals: RentalRequestModel[]; meta: IMeta };
