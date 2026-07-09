import status from "http-status";
import {
  CategoryCreateInput,
  CategoryModel,
  CategoryUpdateInput,
} from "../../../../prisma/generated/prisma/models";
import { AppError } from "../../../helpers/AppError";
import prisma from "../../../libs/prisma";
import { TCreateCategoryInput, TUpdateCategoryInput } from "./category.types";

const insertCategoryIntoDb = async (
  payload: TCreateCategoryInput,
): Promise<Pick<CategoryModel, "id">> => {
  const category = await prisma.category.create({
    data: payload as CategoryCreateInput,
    select: { id: true },
  });

  return category;
};

const updateCategoryFromDb = async (
  payload: TUpdateCategoryInput,
  id: string,
): Promise<CategoryModel> => {
  const category = await prisma.category.update({
    where: { id },
    data: payload as CategoryUpdateInput,
  });

  return category;
};

const getAllCategoriesFromDb = async (): Promise<CategoryModel[]> => {
  const categories = await prisma.category.findMany();

  return categories;
};

const getCategoryById = async (id: string): Promise<CategoryModel> => {
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    throw new AppError("Requested Category not found.", status.NOT_FOUND);
  }

  return category;
};

export const CategoryService = {
  insertCategoryIntoDb,
  updateCategoryFromDb,
  getAllCategoriesFromDb,
  getCategoryById,
};
