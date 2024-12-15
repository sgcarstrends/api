import { isValid, parse } from "date-fns";
import { Hono } from "hono";
import type { Filter, Sort } from "mongodb";
import db from "../../config/db";
import redis from "../../config/redis";
import { getLatestMonth } from "../../lib/getLatestMonth";
import { getUniqueMonths } from "../../lib/getUniqueMonths";
import { groupMonthsByYear } from "../../lib/groupMonthsByYear";
import type { COEResult } from "../../types";
import { Collection, OrderBy } from "../../types";

type QueryParams = {
	sort?: string;
	orderBy?: OrderBy;
	month?: string;
	from?: string;
	to?: string;
	[key: string]: string | undefined;
};

const CACHE_TTL = 60 * 60 * 24; // 1 day in seconds

const app = new Hono();

const getCachedData = <T>(cacheKey: string) => redis.get<T>(cacheKey);

const setCachedData = <T>(cacheKey: string, data: T) =>
	redis.set(cacheKey, data, { ex: CACHE_TTL });

const buildSortQuery = (
	sort?: string,
	orderBy: OrderBy = OrderBy.DESC,
): Sort => {
	const defaultSort: Sort = { month: -1, bidding_no: 1, vehicle_class: 1 };

	if (sort) {
		return { ...defaultSort, [sort]: orderBy === OrderBy.ASC ? 1 : -1 } as Sort;
	}

	return defaultSort;
};

const buildMongoQuery = async <T>(query: QueryParams): Promise<Filter<T>> => {
	const { sort, orderBy, from, to, ...filterQuery } = query;
	const mongoQuery: Filter<T> = {};

	if (from || to) {
		mongoQuery.month = {};
		if (from && isValid(parse(from, "yyyy-MM", new Date()))) {
			mongoQuery.month.$gte = from;
		}
		if (to && isValid(parse(to, "yyyy-MM", new Date()))) {
			mongoQuery.month.$lte = to;
		}
	} else if (!filterQuery.month) {
		const latestMonth = parse(
			await getLatestMonth(Collection.COE),
			"yyyy-MM",
			new Date(),
		);
		const pastYear = new Date(
			latestMonth.getFullYear() - 1,
			latestMonth.getMonth() + 1,
			1,
		);
		mongoQuery.month = {
			$gte: pastYear.toISOString().slice(0, 7),
			$lte: latestMonth.toISOString().slice(0, 7),
		};
	}

	return { ...mongoQuery, ...filterQuery };
};

const fetchData = <T>(mongoQuery: Filter<T>, sortQuery: Sort) =>
	db.collection<T>(Collection.COE).find(mongoQuery).sort(sortQuery).toArray();

app.get("/", async (c) => {
	const query = c.req.query() as QueryParams;
	const CACHE_KEY = `coe:${JSON.stringify(query)}`;
	const cachedData = await getCachedData<COEResult[]>(CACHE_KEY);
	if (cachedData) return c.json(cachedData);

	const sortQuery = buildSortQuery(query.sort, query.orderBy);
	const mongoQuery = await buildMongoQuery<COEResult>(query);
	const result = await fetchData(mongoQuery, sortQuery);

	await setCachedData(CACHE_KEY, result);
	return c.json(result);
});

app.get("/months", async (c) => {
	const { grouped } = c.req.query();

	const months = await getUniqueMonths(Collection.COE);
	if (grouped) {
		return c.json(groupMonthsByYear(months));
	}

	return c.json(months);
});

app.get("/latest", async (c) => {
	const CACHE_KEY = `${Collection.COE}:latest`;
	const cachedData = await getCachedData<COEResult[]>(CACHE_KEY);
	if (cachedData) return c.json(cachedData);

	const latestMonth = await getLatestMonth(Collection.COE);
	const result = await fetchData(
		{ month: latestMonth },
		{ bidding_no: 1, vehicle_class: 1 },
	);

	await setCachedData(CACHE_KEY, result);

	return c.json(result);
});

export default app;
