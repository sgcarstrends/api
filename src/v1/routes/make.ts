import { Hono } from "hono";
import db from "../../config/db";
import redis from "../../config/redis";
import type { Car } from "../../types";
import { deslugify } from "../../utils/slugify";

const app = new Hono();

app.get("/", async (c) => {
	return c.json(await db.collection<Car>("cars").distinct("make"));
});

app.get("/:make", async (c) => {
	const { make } = c.req.param();
	const { month, fuelType, vehicleType } = c.req.query();

	const cacheKey = `make:${make}`;

	const cachedData = await redis.get(cacheKey);
	if (cachedData) {
		return c.json(cachedData);
	}

	const filter = {
		...(make && {
			make: new RegExp(`^${deslugify(make)}$`, "i"),
		}),
		...(month && { month }),
		...(fuelType && { fuel_type: new RegExp(`^${fuelType}$`, "i") }),
		...(vehicleType && { vehicle_type: new RegExp(vehicleType, "i") }),
	};

	const cars = await db
		.collection<Car>("cars")
		.find(filter)
		.sort({ month: -1, fuel_type: 1, vehicle_type: 1 })
		.toArray();

	await redis.set(cacheKey, JSON.stringify(cars), { ex: 86400 });

	return c.json(cars);
});

export default app;
