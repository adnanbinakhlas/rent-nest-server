import {
  CategoryCreateInput,
  CategoryModel,
} from "../../../../prisma/generated/prisma/models";
import prisma from "../../../libs/prisma";
import { TCreateCategoryInput } from "./category.types";

const insertCategoryIntoDb = async (
  payload: TCreateCategoryInput,
): Promise<CategoryModel> => {
  const category = await prisma.category.create({
    data: payload as CategoryCreateInput,
  });

  return category;
};

export const CategoryService = {
  insertCategoryIntoDb,
};
