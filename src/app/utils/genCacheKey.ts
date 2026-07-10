import crypto from "node:crypto";
import { Request } from "express";

export const genCacheKey = (req: Request, meta: string): string => {
  const baseUrl = req.baseUrl || "";
  const queryString = req.originalUrl?.split("?")[1];
  const resourceId = req.params?.id;

  const prefix = meta.replace(/\//g, ":");

  let sortedParams = "";

  if (queryString) {
    sortedParams = queryString
      .split("&")
      .map((param) => {
        const [key, value] = param.split("=");

        if (
          ["fields", "sort", "include", "populate"].includes(key as string) &&
          value
        ) {
          return `${key}=${value.split(",").sort().join(",")}`;
        }

        return param;
      })
      .sort()
      .join("&");
  }

  const rawKey = [baseUrl, resourceId, sortedParams].filter(Boolean).join(":");

  const hashKey = crypto.createHash("md5").update(rawKey).digest("hex");

  return `${prefix}:${hashKey}`;
};

export default genCacheKey;
