import { Hono } from "hono";
import db from "../../config/db";
import redis from "../../config/redis";
import { getCarsByFuelType } from "../../lib/getCarsByFuelType";
import type { Car, Make } from "../../types";

const app = new Hono();

app.get("/", async (c) => {
  const month = c.req.query("month");
  return c.json(await db.collection<Car>("cars").find({ month }).toArray());
});

app.get("/makes", async (c) => {
  const CACHE_KEY = "makes";
  const CACHE_TTL = 60 * 60 * 24; // 1 day in seconds

  let makes: Make[] = await redis.smembers(CACHE_KEY);
  if (makes.length === 0) {
    makes = await db.collection<Car>("cars").distinct("make");
    await redis.sadd(CACHE_KEY, ...makes);
    await redis.expire(CACHE_KEY, CACHE_TTL);
  }

  makes.sort((a, b) => a.localeCompare(b));

  return c.json(makes);
});

app.get("/:fuelType", async (c) => {
  const fuelType = c.req.param("fuelType");
  const month = c.req.query("month");
  return c.json(await getCarsByFuelType(fuelType, month));
});

export default app;
