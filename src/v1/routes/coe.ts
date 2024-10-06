import { Hono } from "hono";
import db from "../../config/db";
import type { Filter, Sort } from "mongodb";
import type { COEResult } from "../../types";
import { Collection, OrderBy } from "../../types";
import redis from "../../config/redis";
import { getLatestMonth } from "../../lib/getLatestMonth";
import { parse } from "date-fns";

type QueryParams = {
  sort?: string;
  orderBy?: OrderBy;
  month?: string;
  [key: string]: string | undefined;
};

const CACHE_TTL = 60 * 60 * 24; // 1 day in seconds

const app = new Hono();

app.get("/", async (c) => {
  const query = c.req.query() as QueryParams;
  const { sort, orderBy, ...filterQuery } = query;

  const CACHE_KEY = `coe:${JSON.stringify(query)}`;
  const cachedData = await redis.get<COEResult[]>(CACHE_KEY);
  if (cachedData) {
    return c.json(cachedData);
  }

  let sortQuery: Sort = { month: -1, bidding_no: 1, vehicle_class: 1 };
  if (sort) {
    const sortDirection = orderBy === OrderBy.DESC ? -1 : 1;
    sortQuery = { [sort]: sortDirection } as Sort;
  }

  const mongoQuery: Filter<COEResult> = {};
  if (!filterQuery.month) {
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

    const pastYearFormatted = pastYear.toISOString().slice(0, 7); // YYYY-MM format
    const currentMonthFormatted = latestMonth.toISOString().slice(0, 7); // YYYY-MM format

    mongoQuery.month = {
      $gte: pastYearFormatted,
      $lte: currentMonthFormatted,
    };
  }

  for (const [key, value] of Object.entries(filterQuery)) {
    mongoQuery[key] = value;
  }

  const result = await db
    .collection<COEResult[]>(Collection.COE)
    .find(mongoQuery)
    .sort(sortQuery)
    .toArray();

  await redis.set(CACHE_KEY, result, { ex: CACHE_TTL });

  return c.json(result);
});

app.get("/latest", async (c) => {
  const CACHE_KEY = `coe:latest`;
  const cachedData = await redis.get<COEResult[]>(CACHE_KEY);
  if (cachedData) {
    return c.json(cachedData);
  }

  const latestMonth = await getLatestMonth(Collection.COE);
  const result = await db
    .collection<COEResult[]>(Collection.COE)
    .find({ month: latestMonth })
    .sort({ bidding_no: 1, vehicle_class: 1 })
    .toArray();

  await redis.set(CACHE_KEY, result, { ex: CACHE_TTL });

  return c.json(result);
});

export default app;
