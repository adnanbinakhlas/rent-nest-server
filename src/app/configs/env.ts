import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const env = {
  PORT: process.env.PORT as string,
  NODE_ENV: process.env.NODE_ENV as string,
  DATABASE_URL: process.env.DATABASE_URL as string,
  BCRYPT_SALT: process.env.BCRYPT_SALT as string,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN as string,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN as string,
};

export default env;
