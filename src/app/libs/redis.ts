/* eslint-disable no-console */
import { createClient } from "redis";
import env from "../configs/env";

const client = createClient({
  url: env.REDIS_URL,
});

console.log(env.REDIS_URL);

client.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

export async function connectRedis() {
  try {
    await client.connect();
  } catch (error: unknown) {
    console.error(error);
  }
}

export default client;
