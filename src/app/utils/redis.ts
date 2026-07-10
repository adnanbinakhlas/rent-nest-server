import client from "../libs/redis";

const redisSet = async <T>(
  key: string,
  data: T,
  expiry: number,
): Promise<void> => {
  await client.set(key, JSON.stringify(data), {
    EX: expiry,
    NX: true,
  });
};

const redisGet = async <T>(key: string): Promise<T | null> => {
  const data = await client.get(key);

  if (!data) {
    return null;
  }

  return JSON.parse(data);
};

export const redisUtils = {
  redisSet,
  redisGet,
};
