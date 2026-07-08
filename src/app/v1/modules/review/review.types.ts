export type TCreateReview = {
  rentalRequestId: string;
  rating: number;
  comment: string;
};

export type TUpdateReview = {
  rating?: number;
  comment?: string;
};
