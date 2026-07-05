import { Response } from "express";

interface IMeta {
  page: number;
  limit: number;
  total: number;
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
    ...(data?.data && { data: data.data }),
    ...(data?.meta && { meta: data.meta }),
    ...(data?.links && { links: data.links }),
  });
};
