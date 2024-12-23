import db from "@/config/db";
import redis from "@/config/redis";
import { getLatestMonth } from "@/lib/getLatestMonth";
import { getUniqueMonths } from "@/lib/getUniqueMonths";
import { groupMonthsByYear } from "@/lib/groupMonthsByYear";
import { cars } from "@/schema";
import type { Make } from "@/types";
import getTrailingTwelveMonths from "@/utils/getTrailingTwelveMonths";
import { and, asc, between, desc, eq, ilike } from "drizzle-orm";
import { Hono } from "hono";

const app = new Hono();

app.get("/", async (c) => {
  const query = c.req.query();
  const { month, ...queries } = query;

  // const CACHE_KEY = `cars:${JSON.stringify(query)}`;
  //
  // const cachedData = await redis.get(CACHE_KEY);
  // if (cachedData) {
  //   return c.json(cachedData);
  // }

  try {
    const latestMonth = !month && (await getLatestMonth(cars));

    const filters = [
      month
        ? eq(cars.month, month)
        : between(
            cars.month,
            getTrailingTwelveMonths(latestMonth),
            latestMonth,
          ),
    ];

    for (const [key, value] of Object.entries(queries)) {
      filters.push(ilike(cars[key], value.split("-").join("%")));
    }

    const results = await db
      .select()
      .from(cars)
      .where(and(...filters))
      .orderBy(desc(cars.month));

    // await redis.set(CACHE_KEY, JSON.stringify(results), { ex: 86400 });

    return c.json(results);
  } catch (e) {
    console.error("Car query error:", e);
    return c.json(
      {
        error: "An error occurred while fetching cars",
        details: e.message,
      },
      500,
    );
  }
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
