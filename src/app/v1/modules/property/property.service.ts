import { UploadApiResponse } from "cloudinary";
import status from "http-status";
import {
  PropertyModel,
  PropertyUpdateInput,
  PropertyWhereInput,
} from "../../../../prisma/generated/prisma/models";
import { AppError } from "../../../helpers/AppError";
import { TQuery } from "../../../interfaces";
import prisma from "../../../libs/prisma";
import imageUpload from "../../../utils/imageUpload";
import { queryBuilder } from "../../../utils/queryBuilder";
import { redisUtils } from "../../../utils/redis";
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

  const keys = await redisUtils.redisGetKeys("properties*");
  await redisUtils.redisDelete(keys);

  return property;
};

const updatePropertyFromDb = async (
  payload: TUpdatePropertyInput,
  id: string,
): Promise<Pick<PropertyModel, "id">> => {
  const property = await prisma.property.update({
    where: { id },
    data: payload as PropertyUpdateInput,

    select: { id: true },
  });

  const keys = await redisUtils.redisGetKeys("properties*");
  await redisUtils.redisDelete(keys);

  return property;
};

const getAllPropertiesFromDb = async (
  query: TQuery,
  cacheKey: string,
): Promise<{ properties: PropertyModel[]; meta: IMeta }> => {
  const pagination = queryBuilder.pagination(query);
  const sorting = queryBuilder.sorting(query);
  const fields = queryBuilder.parseFields(query.fields);
  const searchOrConditions = queryBuilder.searching<PropertyModel>(query.q, [
    "title",
    "description",
  ]);

  const andConditions: PropertyWhereInput[] = [{ OR: searchOrConditions }];

  const whereInput: PropertyWhereInput = { AND: andConditions };
  const totalProperties = await prisma.property.count({ where: whereInput });
  const totalPages = queryBuilder.countPages(totalProperties, pagination.limit);
  if (pagination.page >= totalPages) {
    pagination.nextPage = null;
  }

  const cacheData = await redisUtils.redisGet<PropertyModel[]>(cacheKey);
  let properties: PropertyModel[];

  if (cacheData) {
    properties = cacheData;
  } else {
    properties = await prisma.property.findMany({
      where: whereInput,
      select: fields,
      take: pagination.limit,
      skip: pagination.skip,
      orderBy: sorting,
    });

    await redisUtils.redisSet(cacheKey, properties, 60 * 10);
  }

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
  query: TQuery,
  cacheKey: string,
): Promise<{ properties: PropertyModel[]; meta: IMeta }> => {
  const pagination = queryBuilder.pagination(query);
  const sorting = queryBuilder.sorting(query);
  const fields = queryBuilder.parseFields(query.fields);
  const searchOrConditions = queryBuilder.searching<PropertyModel>(query.q, [
    "title",
    "description",
  ]);

  const andConditions: PropertyWhereInput[] = [{ OR: searchOrConditions }];

  andConditions.push({ landlordId: userId });

  const whereInput: PropertyWhereInput = { AND: andConditions };
  const totalProperties = await prisma.property.count({ where: whereInput });
  const totalPages = queryBuilder.countPages(totalProperties, pagination.limit);
  if (pagination.page >= totalPages) {
    pagination.nextPage = null;
  }

  const cacheData = await redisUtils.redisGet<PropertyModel[]>(cacheKey);
  let properties: PropertyModel[];

  if (cacheData) {
    properties = cacheData;
  } else {
    properties = await prisma.property.findMany({
      where: whereInput,
      select: fields,
      take: pagination.limit,
      skip: pagination.skip,
      orderBy: sorting,
    });

    await redisUtils.redisSet(cacheKey, properties, 60 * 10);
  }

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
  query: TQuery,
  cacheKey: string,
): Promise<PropertyModel> => {
  const fields = queryBuilder.parseFields(query.fields);
  let property: PropertyModel | null;

  const cacheData = await redisUtils.redisGet<PropertyModel>(cacheKey);

  if (cacheData) {
    property = cacheData;
  } else {
    property = await prisma.property.findUnique({
      where: { id },
      ...(fields ? { select: fields } : {}),
    });

    if (!property) {
      throw new AppError(
        "Request property record not found.",
        status.NOT_FOUND,
      );
    }

    await redisUtils.redisSet(cacheKey, property, 60 * 30);
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
