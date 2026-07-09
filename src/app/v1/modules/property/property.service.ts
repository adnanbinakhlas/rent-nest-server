import { UploadApiResponse } from "cloudinary";
import status from "http-status";
import {
  PropertyModel,
  PropertyUpdateInput,
  PropertyWhereInput,
} from "../../../../prisma/generated/prisma/models";
import { AppError } from "../../../helpers/AppError";
import prisma from "../../../libs/prisma";
import imageUpload from "../../../utils/imageUpload";
import { queryBuilder } from "../../../utils/queryBuilder";
import { IMeta } from "../../../utils/sendResponse";
import {
  TCreatePropertyInput,
  TImageFiles,
  TUpdatePropertyInput,
} from "./property.types";

const insertPropertyIntoDb = async (
  payload: TCreatePropertyInput,
  userId: string,
  files: TImageFiles,
): Promise<Pick<PropertyModel, "id">> => {
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
    select: { id: true },
  });

  return property;
};

const updatePropertyFromDb = async (
  payload: TUpdatePropertyInput,
  id: string,
): Promise<PropertyModel> => {
  const property = await prisma.property.update({
    where: { id },
    data: payload as PropertyUpdateInput,

    include: {
      images: { select: { imageUrl: true, isPrimary: true } },
      propertyAmenity: { select: { amenity: { select: { name: true } } } },
    },
  });

  return property;
};

const getAllPropertiesFromDb = async (
  query: Record<string, string | undefined>,
): Promise<{ properties: PropertyModel[]; meta: IMeta }> => {
  const pagination = queryBuilder.pagination(query);
  const sorting = queryBuilder.sorting(query);
  const fields = queryBuilder.parseFields(query.fields);
  const totalProperties = await prisma.property.count();
  const totalPages = queryBuilder.countPages(totalProperties, pagination.limit);

  if (pagination.page === totalPages) {
    pagination.nextPage = null;
  }

  const properties = await prisma.property.findMany({
    select: fields,
    take: pagination.limit,
    skip: pagination.skip,
    orderBy: sorting,
  });

  return {
    properties,
    meta: {
      totalPages,
      totalProperties,
      limit: pagination.limit,
      page: pagination.page,
      nextPage: pagination.nextPage,
      prevPage: pagination.prevPage,
    },
  };
};

const getPropertiesMeFromDb = async (
  userId: string,
  query: Record<string, string | undefined>,
): Promise<{ properties: PropertyModel[]; meta: IMeta }> => {
  const whereInput: PropertyWhereInput = { landlordId: userId };
  const pagination = queryBuilder.pagination(query);
  const sorting = queryBuilder.sorting(query);
  const fields = queryBuilder.parseFields(query.fields);
  const totalProperties = await prisma.property.count({ where: whereInput });
  const totalPages = queryBuilder.countPages(totalProperties, pagination.limit);

  if (pagination.page === totalPages) {
    pagination.nextPage = null;
  }

  const properties = await prisma.property.findMany({
    where: whereInput,
    select: fields,
    take: pagination.limit,
    skip: pagination.skip,
    orderBy: sorting,
  });

  return {
    properties,
    meta: {
      totalPages,
      totalProperties,
      limit: pagination.limit,
      page: pagination.page,
      nextPage: pagination.nextPage,
      prevPage: pagination.prevPage,
    },
  };
};

const getPropertyById = async (
  id: string,
  query: Record<string, string | undefined>,
): Promise<PropertyModel> => {
  const fields = queryBuilder.parseFields(query.fields);
  const property = await prisma.property.findUnique({
    where: { id },
    ...(fields ? { select: fields } : {}),
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
