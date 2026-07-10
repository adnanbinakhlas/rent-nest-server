/* eslint-disable no-console */
import { createClient } from "redis";
import env from "../configs/env";

const redis = createClient({ url: env.REDIS_URL });

redis.on("error", (err) => {
  console.log("Redis client error: ", err);
});

await redis.connect();

export default redis;
