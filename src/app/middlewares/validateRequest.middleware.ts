import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";
import { asyncHandler } from "../utils/asyncHandler";

const validateRequest = (schema: ZodObject) =>
  asyncHandler(
    async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      const bodyParse = await schema.parseAsync(req.body);
      req.body = bodyParse;

      next();
    },
  );

export default validateRequest;
