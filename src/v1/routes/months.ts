import { Hono } from "hono";
import db from "../../config/db";
import { getLatestMonth } from "../../lib/getLatestMonth";
import { groupMonthsByYear } from "../../lib/groupMonthsByYear";
import type { Car } from "../../types";
import redis from "../../config/redis";

const app = new Hono();

app.get("/", async (c) => {
  const CACHE_KEY = "months";
  const CACHE_TTL = 60 * 60 * 24;

  const grouped = c.req.query("grouped");

  let months: string[] = await redis.get(CACHE_KEY);
  let sortedMonths = months;
  if (!months) {
    months = await db.collection<Car>("cars").distinct("month");
    sortedMonths = months.toSorted((a, b) => b.localeCompare(a));
    await redis.set(CACHE_KEY, sortedMonths, { ex: CACHE_TTL });
  }

  if (grouped) {
    return c.json(groupMonthsByYear(sortedMonths));
  }

  return c.json(sortedMonths);
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
