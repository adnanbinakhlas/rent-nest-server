import { Request } from "express";

const genCacheKey = (req: Request): string => {
  const baseUrl = req.baseUrl || "";
  const queryString = req.originalUrl?.split("?")[1];

  if (!queryString) {
    return `${baseUrl}:`;
  }

  const sortedParams = queryString
    .split("&")
    .map((param) => {
      const [key, value] = param.split("=");

      if (key === "fields" && value) {
        const sortedFields = value.split(",").sort().join(",");
        return `${key}=${sortedFields}`;
      }

      return param;
    })
    .sort()
    .join("&");

  return `${baseUrl}:${sortedParams}`;
};

export default genCacheKey;
