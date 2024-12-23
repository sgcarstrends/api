import db from "@/config/db";
import redis from "@/config/redis";
import { getUniqueMonths } from "@/lib/getUniqueMonths";
import { groupMonthsByYear } from "@/lib/groupMonthsByYear";
import { cars } from "@/schema";
import type { Make } from "@/types";
import { and, asc, between, desc, ilike } from "drizzle-orm";
import { Hono } from "hono";

const app = new Hono();

app.get("/", async (c) => {
  const query = c.req.query();

  const cacheKey = `cars:${JSON.stringify(query)}`;

  const cachedData = await redis.get(cacheKey);
  if (cachedData) {
    return c.json(cachedData);
  }

  const today = new Date();
  const pastYear = new Date(today.getFullYear() - 1, today.getMonth() + 1, 1);
  const pastYearFormatted = pastYear.toISOString().slice(0, 7); // YYYY-MM format
  const currentMonthFormatted = today.toISOString().slice(0, 7); // YYYY-MM format

  const conditions = [
    ...(query.month
      ? []
      : [between(cars.month, pastYearFormatted, currentMonthFormatted)]),
  ];

  for (const [key, value] of Object.entries(query)) {
    if (!value) continue;

    conditions.push(ilike(cars[key], `%${value}%`));
  }

  const response = await db
    .select()
    .from(cars)
    .where(and(...conditions))
    .orderBy(desc(cars.month));

  await redis.set(cacheKey, JSON.stringify(response), { ex: 86400 });

  return c.json(response);
});

app.get("/months", async (c) => {
  const { grouped } = c.req.query();

  const months = await getUniqueMonths(cars);
  if (grouped) {
    return c.json(groupMonthsByYear(months));
  }

  return c.json(months);
});

app.get("/makes", async (c) => {
  const CACHE_KEY = "makes";
  const CACHE_TTL = 60 * 60 * 24; // 1 day in seconds

  let makes: Make[] = await redis.smembers(CACHE_KEY);

  if (makes.length === 0) {
    makes = await db
      .selectDistinct({ make: cars.make })
      .from(cars)
      .orderBy(asc(cars.make))
      .then((res) => res.map(({ make }) => make));

    await redis.sadd(CACHE_KEY, ...makes);
    await redis.expire(CACHE_KEY, CACHE_TTL);
  }

  makes.sort((a, b) => a.localeCompare(b));

  return c.json(makes);
});

export default app;
