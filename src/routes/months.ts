import { Hono } from "hono";
import db from "../config/db";
import { getLatestMonth } from "../lib/getLatestMonth";
import { groupMonthsByYear } from "../lib/groupMonthsByYear";
import type { Car } from "../types";

const app = new Hono();

app.get("/", async (c) => {
  const grouped = c.req.query("grouped");
  const months = await db.collection<Car>("cars").distinct("month");
  const sortedMonths = months.sort((a, b) => b.localeCompare(a));

  if (grouped) {
    return c.json(groupMonthsByYear(sortedMonths));
  }

  return c.json(sortedMonths);
});

app.get("/latest", async (c) => {
  const collection = c.req.query("collection");
  const dbCollections = ["cars", "coe"];

  const latestMonthObj = {};

  if (collection) {
    latestMonthObj[collection] = await getLatestMonth(collection);
  } else {
    for (const dbCollection of dbCollections) {
      latestMonthObj[dbCollection] = await getLatestMonth(dbCollection);
    }
  }

  return c.json(latestMonthObj);
});

export default app;
