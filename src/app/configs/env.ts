import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const env = {
  PORT: process.env.PORT as string,
  NODE_ENV: process.env.NODE_ENV as string,
  DATABASE_URL: process.env.DATABASE_URL as string,
  BCRYPT_SALT: process.env.BCRYPT_SALT as string,
};

export default env;
