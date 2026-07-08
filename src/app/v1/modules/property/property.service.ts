import { UploadApiResponse } from "cloudinary";
import status from "http-status";
import { PropertyModel } from "../../../../prisma/generated/prisma/models";
import { AppError } from "../../../helpers/AppError";
import prisma from "../../../libs/prisma";
import imageUpload from "../../../utils/imageUpload";
import {
  TCreatePropertyInput,
  TImageFiles,
  TUpdatePropertyInput,
} from "./property.types";

const insertPropertyIntoDb = async (
  payload: TCreatePropertyInput,
  userId: string,
  files: TImageFiles,
): Promise<PropertyModel> => {
  const { amenities, ...rest } = payload;

  const thumbnailFile = files.thumbnail?.[0];
  const imageFiles = files.images || [];

  const imageCreates: {
    imageUrl: string;
    isPrimary: boolean;
  }[] = [];

  if (thumbnailFile) {
    const thumbnail = (await imageUpload(
      thumbnailFile.path,
      "rent-nest/properties",
    )) as UploadApiResponse;

    imageCreates.push({
      imageUrl: thumbnail.secure_url,
      isPrimary: true,
    });
  }

  if (imageFiles.length) {
    const uploadedImages = (await Promise.all(
      imageFiles.map((file) => imageUpload(file.path, "rent-nest/properties")),
    )) as UploadApiResponse[];

    imageCreates.push(
      ...uploadedImages.map((image) => ({
        imageUrl: image.secure_url,
        isPrimary: false,
      })),
    );
  }

  const data = {
    ...rest,
    landlordId: userId,
    availableFrom: new Date(rest.availableFrom).toISOString(),
    images: { create: imageCreates },
    propertyAmenity: {
      create: amenities.map((amenityId) => ({ amenityId })),
    },
  };

  const property = await prisma.property.create({
    data,
  });

  return property;
};

const updatePropertyFromDb = async (
  payload: TUpdatePropertyInput,
  id: string,
): Promise<PropertyModel> => {
  const { images, amenities, availableFrom, ...rest } = payload;

  const property = await prisma.property.update({
    where: { id },
    data: {
      ...rest,
      ...(availableFrom
        ? { availableFrom: new Date(availableFrom).toISOString() }
        : {}),
      ...(images ? { images: { create: images } } : {}),
      ...(amenities
        ? {
            propertyAmenity: {
              create: amenities.map((amenityId: string) => ({ amenityId })),
            },
          }
        : {}),
    },

    include: {
      images: { select: { imageUrl: true, isPrimary: true } },
      propertyAmenity: { select: { amenity: { select: { name: true } } } },
    },
  });

  return property;
};

const getAllPropertiesFromDb = async (): Promise<PropertyModel[]> => {
  const properties = await prisma.property.findMany({
    include: { images: true, propertyAmenity: { include: { amenity: true } } },
  });

  return properties;
};

const getPropertiesMeFromDb = async (
  userId: string,
): Promise<PropertyModel[]> => {
  const properties = await prisma.property.findMany({
    where: { landlordId: userId },
  });

  return properties;
};

const getPropertyById = async (id: string): Promise<PropertyModel> => {
  const property = await prisma.property.findUnique({
    where: { id },
    include: { images: true, propertyAmenity: { include: { amenity: true } } },
  });

  if (!property) {
    throw new AppError("Request property not found.", status.NOT_FOUND);
  }

  return property;
};

export const PropertyService = {
  insertPropertyIntoDb,
  updatePropertyFromDb,
  getAllPropertiesFromDb,
  getPropertiesMeFromDb,
  getPropertyById,
};
