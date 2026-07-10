import { Request } from "express";
import crypto from "crypto";

const genCacheKey = (req: Request, meta: string): string => {
  const baseUrl = req.baseUrl || "";
  const queryString = req.originalUrl?.split("?")[1];
  const str = meta.replace(/\//g, ":");

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

  const hashKey = crypto.createHash("md5").update(rawKey).digest("hex");

  const finalKey = `${str}:${hashKey}`;

  return finalKey;
};

export default genCacheKey;
