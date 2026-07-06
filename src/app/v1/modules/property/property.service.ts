/* eslint-disable @typescript-eslint/no-unused-vars */
const insertPropertyIntoDb = async (payload: unknown): Promise<void> => {};

const updatePropertyFromDb = async (
  payload: unknown,
  id: string,
): Promise<void> => {};

const getAllPropertiesFromDb = async (): Promise<void> => {};

const getPropertyById = async (id: string): Promise<void> => {};

export const PropertyService = {
  insertPropertyIntoDb,
  updatePropertyFromDb,
  getAllPropertiesFromDb,
  getPropertyById,
};
