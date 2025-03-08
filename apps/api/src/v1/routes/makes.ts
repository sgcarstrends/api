import { CACHE_TTL } from "@api/config";
import db from "@api/config/db";
import redis from "@api/config/redis";
import { MakeParamSchema, MakeQuerySchema } from "@api/schemas";
import type { Make } from "@api/types";
import { zValidator } from "@hono/zod-validator";
import { cars } from "@sgcarstrends/schema";
import { and, asc, desc, eq, ilike } from "drizzle-orm";
import { Hono } from "hono";

const app = new Hono();

app.get("/", async (c) => {
  const CACHE_KEY = "makes";

  let makes = await redis.zrange<Make[]>(CACHE_KEY, 0, -1);
  if (makes.length === 0) {
    makes = await db
      .selectDistinct({ make: cars.make })
      .from(cars)
      .orderBy(asc(cars.make))
      .then((res) => res.map(({ make }) => make));

    for (const make of makes) {
      await redis.zadd<Make>(CACHE_KEY, { score: 0, member: make });
    }
    await redis.expire(CACHE_KEY, CACHE_TTL);
  }

  return c.json(makes);
});

app.get(
  "/:make",
  zValidator("param", MakeParamSchema),
  zValidator("query", MakeQuerySchema),
  async (c) => {
    try {
      const param = c.req.valid("param");
      const { make } = param;
      const query = c.req.valid("query");
      const { month, fuel_type, vehicle_type } = query;

      const CACHE_KEY = `make:${make}:${JSON.stringify(query)}`;

      const cachedData = await redis.get(CACHE_KEY);
      if (cachedData) {
        return c.json(cachedData);
      }

      const filters = [
        ilike(cars.make, make.split("-").join("%")),
        month && eq(cars.month, month),
        fuel_type && ilike(cars.fuel_type, fuel_type.split("-").join("%")),
        vehicle_type &&
          ilike(cars.vehicle_type, vehicle_type.split("-").join("%")),
      ].filter(Boolean);

      const results = await db
        .select()
        .from(cars)
        .where(and(...filters))
        .orderBy(desc(cars.month), asc(cars.fuel_type), asc(cars.vehicle_type));

      await redis.set(CACHE_KEY, JSON.stringify(results), { ex: 86400 });

      return c.json(results);
    } catch (e) {
      console.error(e);
      return c.json({ error: e.message }, 500);
    }
  },
);

export default app;
