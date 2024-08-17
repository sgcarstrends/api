import { Hono } from "hono";
import db from "../../config/db";
import redis from "../../config/redis";
import { getCarsByFuelType } from "../../lib/getCarsByFuelType";
import type { Car } from "../../types";

const app = new Hono();

app.get("/", async (c) => {
  const month = c.req.query("month");
  return c.json(await db.collection<Car>("cars").find({ month }).toArray());
});

app.get("/makes", async (c) => {
  const CACHE_KEY = "car_makes";
  const CACHE_TTL = 3600;

  let makes = await redis.get(CACHE_KEY);
  if (!makes) {
    makes = await db.collection<Car>("cars").distinct("make");
    await redis.set(CACHE_KEY, makes, { ex: CACHE_TTL });
  }

  makes.sort();

  return c.json(makes as string);
});

app.get("/:fuelType", async (c) => {
  const fuelType = c.req.param("fuelType");
  const month = c.req.query("month");
  return c.json(await getCarsByFuelType(fuelType, month));
});

export default app;
