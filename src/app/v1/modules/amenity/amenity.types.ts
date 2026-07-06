import z from "zod";
import { AmenityValidation } from "./amenity.validation";

export type TCreateAmenityInput = z.infer<
  typeof AmenityValidation.createAmenityValidationSchema
>;

export type TUpdateAmenityInput = z.infer<
  typeof AmenityValidation.updateAmenityValidationSchema
>;
