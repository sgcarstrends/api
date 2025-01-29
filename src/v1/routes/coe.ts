import { CACHE_TTL } from "@/config";
import db from "@/config/db";
import redis from "@/config/redis";
import { getLatestMonth } from "@/lib/getLatestMonth";
import getPqpRates from "@/lib/getPqpRates";
import { getUniqueMonths } from "@/lib/getUniqueMonths";
import { groupMonthsByYear } from "@/lib/groupMonthsByYear";
import { type COE, COEQuerySchema, MonthsQuerySchema } from "@/schemas";
import { VehicleClass } from "@/types";
import { zValidator } from "@hono/zod-validator";
import { coe } from "@sgcarstrends/schema";
import { and, asc, desc, eq, gt, gte, lte, ne, sql } from "drizzle-orm";
import { Hono } from "hono";

const app = new Hono();

app.get("/", zValidator("query", COEQuerySchema), async (c) => {
  const query = c.req.query();
  const { sort, orderBy, month, from, to } = query;

  const CACHE_KEY = `coe:${JSON.stringify(query)}`;

  const cachedData = await redis.get<COE[]>(CACHE_KEY);
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

  await redis.set(CACHE_KEY, results, { ex: CACHE_TTL });

  return c.json(results);
});

app.get("/months", zValidator("query", MonthsQuerySchema), async (c) => {
  const { grouped } = c.req.query();

  const months = await getUniqueMonths(coe);
  if (grouped) {
    return c.json(groupMonthsByYear(months));
  }

  return c.json(months);
});

app.get("/latest", async (c) => {
  const CACHE_KEY = "coe:latest";

  const cachedData = await redis.get<COE[]>(CACHE_KEY);
  if (cachedData) {
    return c.json(cachedData);
  }

  const latestMonth = await getLatestMonth(coe);
  const results = await db
    .select()
    .from(coe)
    .where(eq(coe.month, latestMonth))
    .orderBy(asc(coe.bidding_no), asc(coe.vehicle_class));

  await redis.set(CACHE_KEY, results, { ex: CACHE_TTL });

  return c.json(results);
});

app.get("/pqp", async (c) => {
  const results = await db
    .select()
    .from(coe)
    .where(ne(coe.vehicle_class, VehicleClass.CategoryE)) // Category E COEs are not included in PQP calculation
    .orderBy(desc(coe.month), desc(coe.bidding_no), asc(coe.vehicle_class));

  const pqpRates = getPqpRates(results);

  return c.json(pqpRates);
});

export default app;
