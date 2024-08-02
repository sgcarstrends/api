import { Hono } from "hono";
import db from "../../config/db";
import { getCOEResultByMonth } from "../../lib/getCOEResultByMonth";
import type { Sort } from "mongodb";
import type { COEResult } from "../../types";

const app = new Hono();

app.get("/", async (c) => {
  const orderBy = c.req.query("orderBy")?.toLowerCase();

  let sortQuery: Sort = { month: -1, bidding_no: 1, vehicle_class: 1 };
  if (orderBy) {
    sortQuery = { ...sortQuery, month: orderBy === "asc" ? 1 : -1 };
  }

  return c.json(
    await db.collection<COEResult>("coe").find().sort(sortQuery).toArray(),
  );
});

app.get("/latest", async (c) => {
  const month = c.req.query("month");
  return c.json(await getCOEResultByMonth(month));
});

export default app;
