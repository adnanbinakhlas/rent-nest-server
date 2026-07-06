import httpStatus from "http-status";
import { AmenityModel } from "../../../../prisma/generated/prisma/models";
import prisma from "../../../libs/prisma";
import { TCreateAmenityInput, TUpdateAmenityInput } from "./amenity.types";
import { AppError } from "../../../helpers/AppError";

const insertAmenityIntoDb = async (
  payload: TCreateAmenityInput,
): Promise<AmenityModel> => {
  const amenity = await prisma.amenity.create({
    data: payload,
  });

  return amenity;
};

const updateAmenityFromDb = async (
  payload: TUpdateAmenityInput,
  id: string,
): Promise<AmenityModel> => {
  const amenity = await prisma.amenity.update({
    where: { id },
    data: payload,
  });

  return amenity;
};

const getAllAmenitiesFromDb = async (): Promise<AmenityModel[]> => {
  const amenities = await prisma.amenity.findMany();

  return amenities;
};

const getAmenityById = async (id: string): Promise<AmenityModel> => {
  const amenity = await prisma.amenity.findUnique({
    where: { id },
  });

  if (!amenity) {
    throw new AppError("Requested amenity not found.", httpStatus.NOT_FOUND);
  }

  return amenity;
};

export const AmenityService = {
  insertAmenityIntoDb,
  getAllAmenitiesFromDb,
  getAmenityById,
  updateAmenityFromDb,
};
