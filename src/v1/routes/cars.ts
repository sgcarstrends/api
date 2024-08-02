import { Hono } from "hono";
import db from "../../config/db";
import { getCarsByFuelType } from "../../lib/getCarsByFuelType";
import type { Car } from "../../types";

const app = new Hono();

app.get("/", async (c) => {
  const month = c.req.query("month");
  return c.json(await db.collection<Car>("cars").find({ month }).toArray());
});

app.get("/:fuelType", async (c) => {
  const fuelType = c.req.param("fuelType");
  const month = c.req.query("month");
  return c.json(await getCarsByFuelType(fuelType, month));
});

export default app;
