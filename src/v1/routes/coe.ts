import { DEFAULT_CACHE_TTL } from "@/config";
import db from "@/config/db";
import redis from "@/config/redis";
import { getLatestMonth } from "@/lib/getLatestMonth";
import { getUniqueMonths } from "@/lib/getUniqueMonths";
import { groupMonthsByYear } from "@/lib/groupMonthsByYear";
import { coe } from "@/schema";
import type { COEResult } from "@/types";
import { and, asc, desc, eq, gte, lte } from "drizzle-orm";
import { Hono } from "hono";

const app = new Hono();

const getCachedData = <T>(cacheKey: string) => redis.get<T>(cacheKey);

const setCachedData = <T>(cacheKey: string, data: T) =>
  redis.set(cacheKey, data, { ex: DEFAULT_CACHE_TTL });

app.get("/", async (c) => {
  const query = c.req.query();
  const { sort, orderBy, month, from, to } = query;

  const CACHE_KEY = `coe:${JSON.stringify(query)}`;

  const cachedData = await getCachedData<COEResult[]>(CACHE_KEY);
  if (cachedData) {
    return c.json(cachedData);
  }

  const filters = [
    month && eq(coe.month, month),
    from && gte(coe.month, from),
    to && lte(coe.month, to),
  ];

  const results = await db
    .select()
    .from(coe)
    .where(and(...filters))
    .orderBy(desc(coe.month), asc(coe.bidding_no), asc(coe.vehicle_class));

  await setCachedData(CACHE_KEY, result);

  return c.json(result);
});

app.get("/months", async (c) => {
  const { grouped } = c.req.query();

  const months = await getUniqueMonths(coe);
  if (grouped) {
    return c.json(groupMonthsByYear(months));
  }

  return c.json(months);
});

app.get("/latest", async (c) => {
  const CACHE_KEY = "coe:latest";

  const cachedData = await getCachedData<COEResult[]>(CACHE_KEY);
  if (cachedData) {
    return c.json(cachedData);
  }

  const latestMonth = await getLatestMonth(coe);
  const results = await db
    .select()
    .from(coe)
    .where(eq(coe.month, latestMonth))
    .orderBy(asc(coe.bidding_no), asc(coe.vehicle_class));

  await setCachedData(CACHE_KEY, result);

  return c.json(result);
});

export default app;
