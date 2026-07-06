import { Response } from "express";
import env from "../configs/env";

const setCookie = (
  res: Response,
  name: string,
  data: string,
  age: number,
): void => {
  res.cookie(name, `Bearer ${data}`, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: age,
  });
};

const clearCookie = (res: Response, name: string): void => {
  res.clearCookie(name);
};

export const cookieUtils = {
  setCookie,
  clearCookie,
};
