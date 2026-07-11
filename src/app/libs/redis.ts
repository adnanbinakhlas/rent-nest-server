/* eslint-disable no-console */
import { createClient } from "redis";
import env from "../configs/env";

const client = createClient({
  url: env.REDIS_URL,
});

client.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

export async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
  }
}

export default client;
