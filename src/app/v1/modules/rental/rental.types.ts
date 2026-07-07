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
