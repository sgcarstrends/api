import { Hono } from "hono";
import db from "../config/db";
import { getCOEResultByMonth } from "../lib/getCOEResultByMonth";
import type { COEResult } from "../types";

const app = new Hono();

app.get("/", async (c) => {
  return c.json(
    await db
      .collection<COEResult>("coe")
      .find()
      .sort({ month: -1, bidding_no: -1, vehicle_class: 1 })
      .toArray(),
  );
});

app.get("/latest", async (c) => {
  const month = c.req.query("month");
  return c.json(await getCOEResultByMonth(month));
});

export default app;
