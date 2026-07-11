import { Unit } from "../../../../prisma/generated/prisma/client";
import { PropertyModel } from "../../../../prisma/generated/prisma/models";
import { IMeta } from "../../../utils/sendResponse";

export type TCreatePropertyInput = {
  categoryId: string;
  title: string;
  description: string;
  address: string;
  city: string;
  area: string;
  latitude: number;
  longitude: number;
  monthlyRent: number;
  securityDeposit: number;
  bedrooms: number;
  bathrooms: number;
  floor: number;
  furnished: boolean;
  size: number;
  sizeUnit: Unit;
  availableFrom: Date;
  available: boolean;
  amenities: string[];
};

export type TUpdatePropertyInput = {
  categoryId?: string;
  title?: string;
  description?: string;
  address?: string;
  city?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
  monthlyRent?: number;
  securityDeposit?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  furnished?: boolean;
  size?: number;
  sizeUnit?: Unit;
  availableFrom?: Date;
  available?: boolean;
  amenities?: string[];
};

export type TPropertyReturnType = { properties: PropertyModel[]; meta: IMeta };

export type TImageFiles = {
  thumbnail: Express.Multer.File[];
  images?: Express.Multer.File[];
};
