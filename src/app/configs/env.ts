import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const env = {
  PORT: process.env.PORT,
};

export default env;
