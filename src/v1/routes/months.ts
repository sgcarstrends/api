import { Hono } from "hono";
import db from "../../config/db";
import { getLatestMonth } from "../../lib/getLatestMonth";
import { groupMonthsByYear } from "../../lib/groupMonthsByYear";
import type { Car, Month } from "../../types";
import redis from "../../config/redis";

const app = new Hono();

app.get("/", async (c) => {
  const CACHE_KEY = "months";
  const CACHE_TTL = 60 * 60 * 24; // 1 day in seconds

  const grouped = c.req.query("grouped");

  let months: Month[] = await redis.smembers(CACHE_KEY);
  if (months.length === 0) {
    months = await db.collection<Car>("cars").distinct("month");
    await redis.sadd(CACHE_KEY, ...months);
    await redis.expire(CACHE_KEY, CACHE_TTL);
  }

  months.sort((a, b) => b.localeCompare(a));

  if (grouped) {
    return c.json(groupMonthsByYear(months));
  }

  return c.json(months);
});

app.get("/latest", async (c) => {
  const collection = c.req.query("collection");
  const dbCollections = ["cars", "coe"];

  const latestMonthObj = {};

  if (collection) {
    latestMonthObj[collection] = await getLatestMonth(collection);
  } else {
    for (const dbCollection of dbCollections) {
      latestMonthObj[dbCollection] = await getLatestMonth(dbCollection);
    }
  }

  return c.json(latestMonthObj);
});

export default app;
