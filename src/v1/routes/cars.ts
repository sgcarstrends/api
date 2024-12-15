import { HYBRID_REGEX } from "@/config";
import db from "@/config/db";
import redis from "@/config/redis";
import { getUniqueMonths } from "@/lib/getUniqueMonths";
import { groupMonthsByYear } from "@/lib/groupMonthsByYear";
import type { Car, Make } from "@/types";
import { Collection } from "@/types";
import { Hono } from "hono";
import type { WithId } from "mongodb";

const app = new Hono();

const collection = db.collection<Car>(Collection.Cars);

interface QueryParams {
	month?: string;
	fuel_type?: string;
	make?: string;
	[key: string]: string | undefined;
}

interface MongoQuery {
	month?: {
		$gte: string;
		$lte: string;
	};
	[key: string]: unknown;
}

app.get("/", async (c) => {
	const query: QueryParams = c.req.query();

	const cacheKey = `cars:${JSON.stringify(query)}`;

	const cachedData = await redis.get(cacheKey);
	if (cachedData) {
		return c.json(cachedData);
	}

	const mongoQuery: MongoQuery = {};

	if (!query.month) {
		const today = new Date();
		const pastYear = new Date(today.getFullYear() - 1, today.getMonth() + 1, 1);

		const pastYearFormatted = pastYear.toISOString().slice(0, 7); // YYYY-MM format
		const currentMonthFormatted = today.toISOString().slice(0, 7); // YYYY-MM format

		mongoQuery.month = {
			$gte: pastYearFormatted,
			$lte: currentMonthFormatted,
		};
	}

	for (const [key, value] of Object.entries(query)) {
		if (!value) continue;

		if (key === "fuel_type" && /Hybrid/i.test(value)) {
			mongoQuery[key] = { $regex: HYBRID_REGEX };
		} else {
			mongoQuery[key] = {
				$regex: new RegExp(
					`^${value.replace(/[^a-zA-Z0-9]/g, "[^a-zA-Z0-9]*")}$`,
					"i",
				),
			};
		}
	}

	const cars: WithId<Car>[] = await collection
		.find(mongoQuery)
		.sort({ month: -1 })
		.toArray();

	await redis.set(cacheKey, JSON.stringify(cars), { ex: 86400 });

	return c.json(cars);
});

app.get("/months", async (c) => {
	const { grouped } = c.req.query();

	const months = await getUniqueMonths(Collection.Cars);
	if (grouped) {
		return c.json(groupMonthsByYear(months));
	}

	return c.json(months);
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

export default app;
