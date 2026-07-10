/* eslint-disable no-console */
import { createClient } from "redis";
import env from "../configs/env";

const client = createClient({ url: env.REDIS_URL });

client.on("error", (err) => {
  console.log("Redis client error: ", err);
});

await client.connect();

export default client;
