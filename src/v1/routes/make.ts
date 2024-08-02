import { Hono } from "hono";
import db from "../../config/db";
import type { Car } from "../../types";

const app = new Hono();

app.get("/", async (c) => {
  return c.json(await db.collection<Car>("cars").distinct("make"));
});

app.get("/:make", async (c) => {
  const make = c.req.param("make");
  const { month, fuelType, vehicleType } = c.req.query();

  const filter = {
    ...(make && { make: new RegExp(make, "i") }),
    ...(month && { month }),
    ...(fuelType && { fuel_type: new RegExp(`^${fuelType}$`, "i") }),
    ...(vehicleType && { vehicle_type: new RegExp(vehicleType, "i") }),
  };

  return c.json(
    await db
      .collection<Car>("cars")
      .find(filter)
      .sort({ month: -1, fuel_type: 1, vehicle_type: 1 })
      .toArray(),
  );
});

export default app;
