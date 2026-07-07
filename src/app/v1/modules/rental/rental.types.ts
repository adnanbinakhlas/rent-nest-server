export type TCreateRentalRequestInput = {
  propertyId: string;
  moveInDate: Date;
  rentalDuration: number;
  message?: string;
};

export type TUpdateRentalRequestInput = {
  moveInDate?: Date | undefined;
  rentalDuration?: number | undefined;
  message?: string | undefined;
};

export type TUpdateRentalStatusInput = {
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
};
