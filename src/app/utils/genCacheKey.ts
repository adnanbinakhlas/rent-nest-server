import { Request } from "express";
import crypto from "crypto";

const genCacheKey = (req: Request): string => {
  const baseUrl = req.baseUrl || "";
  const queryString = req.originalUrl?.split("?")[1];

  let sortedParams = "";

  if (queryString) {
    sortedParams = queryString
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
  }

  const rawKey = `${baseUrl}:${sortedParams}`;

  const finalKey = crypto.createHash("md5").update(rawKey).digest("hex");

  return finalKey;
};

export default genCacheKey;
