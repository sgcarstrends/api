import db from "../config/db";
import redis from "../config/redis";

const CACHE_TTL = 60 * 60 * 24; // 1 day in seconds

export const getUniqueMonths = async (collection, key = "month") => {
  const CACHE_KEY = `${collection}:months`;

  let months: string[] = await redis.smembers(CACHE_KEY);
  if (months.length === 0) {
    months = await db.collection(collection).distinct(key);
    await redis.sadd(CACHE_KEY, ...months);
    await redis.expire(CACHE_KEY, CACHE_TTL);
  }

  return months.sort((a, b) => b.localeCompare(a));
};
