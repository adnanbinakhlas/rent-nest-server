import { Response } from "express";

export interface IMeta {
  page: number;
  limit: number;
  totalPages: number;
  nextPage: number | null;
  prevPage: number | null;
  [key: string]: unknown;
}

interface ILink {
  [key: string]: string;
}

interface IResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: IMeta;
  links?: ILink;
}

export const sendResponse = <T>(res: Response, data: IResponse<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    ...(data?.meta && { meta: data.meta }),
    ...(data?.data && { data: data.data }),
    ...(data?.links && { links: data.links }),
  });
};
