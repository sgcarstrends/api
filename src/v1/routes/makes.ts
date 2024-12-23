import { DEFAULT_CACHE_TTL } from "@/config";
import db from "@/config/db";
import redis from "@/config/redis";
import { cars } from "@/schema";
import { and, asc, desc, eq, ilike } from "drizzle-orm";
import { Hono } from "hono";

const app = new Hono();

app.get("/", async (c) => {
  const CACHE_KEY = "makes";

  let makes = await redis.smembers(CACHE_KEY);

  if (makes.length === 0) {
    makes = await db
      .selectDistinct({ make: cars.make })
      .from(cars)
      .then((res) => res.map(({ make }) => make));

    await redis.sadd(CACHE_KEY, ...makes);
    await redis.expire(CACHE_KEY, DEFAULT_CACHE_TTL);
  }

  makes.sort((a, b) => a.localeCompare(b));

  return c.json(makes);
});

app.get("/:make", async (c) => {
  const { make } = c.req.param();
  const { month, fuel_type, vehicle_type } = c.req.query();

  const CACHE_KEY = `make:${make}`;

  const cachedData = await redis.get(CACHE_KEY);
  if (cachedData) {
    return c.json(cachedData);
  }

  const filters = [
    ilike(cars.make, make.split("-").join("%")),
    month && eq(cars.month, month),
    fuel_type && ilike(cars.fuel_type, fuel_type.split("-").join("%")),
    vehicle_type && ilike(cars.vehicle_type, vehicle_type.split("-").join("%")),
  ].filter(Boolean);

  const result = await db
    .select()
    .from(cars)
    .where(and(...filters))
    .orderBy(desc(cars.month), asc(cars.fuel_type), asc(cars.vehicle_type));

  await redis.set(CACHE_KEY, JSON.stringify(result), { ex: 86400 });

  return c.json(result);
});

export default app;
