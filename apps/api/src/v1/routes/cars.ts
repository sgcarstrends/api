import { CACHE_TTL, HYBRID_REGEX } from "@api/config";
import db from "@api/config/db";
import redis from "@api/config/redis";
import { getLatestMonth } from "@api/lib/getLatestMonth";
import { getUniqueMonths } from "@api/lib/getUniqueMonths";
import { groupMonthsByYear } from "@api/lib/groupMonthsByYear";
import { CarQuerySchema, MonthsQuerySchema } from "@api/schemas";
import type { Make } from "@api/types";
import { zValidator } from "@hono/zod-validator";
import { cars } from "@sgcarstrends/schema";
import { getTrailingTwelveMonths } from "@sgcarstrends/utils";
import { and, asc, between, desc, eq, ilike, sql } from "drizzle-orm";
import { Hono } from "hono";

const app = new Hono();

app.get("/", zValidator("query", CarQuerySchema), async (c) => {
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
      if (key === "fuel_type" && value.toLowerCase() === "hybrid") {
        filters.push(sql`${cars.fuel_type} ~ ${HYBRID_REGEX.source}::text`);
        continue;
      }

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

app.get("/months", zValidator("query", MonthsQuerySchema), async (c) => {
  const { grouped } = c.req.query();

  const months = await getUniqueMonths(cars);
  if (grouped) {
    return c.json(groupMonthsByYear(months));
  }

  return c.json(months);
});

app.get("/makes", async (c) => {
  const CACHE_KEY = "makes";

  let makes = await redis.smembers<Make[]>(CACHE_KEY);

  if (makes.length === 0) {
    makes = await db
      .selectDistinct({ make: cars.make })
      .from(cars)
      .orderBy(asc(cars.make))
      .then((res) => res.map(({ make }) => make));

    await redis.sadd(CACHE_KEY, makes);
    await redis.expire(CACHE_KEY, CACHE_TTL);
  }

  makes.sort((a, b) => a.localeCompare(b));

  return c.json(makes);
});

export default app;
