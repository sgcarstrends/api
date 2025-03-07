import { getLatestMonth } from "@api/lib/getLatestMonth";
import { LatestMonthQuerySchema } from "@api/schemas";
import { zValidator } from "@hono/zod-validator";
import { cars, coe } from "@sgcarstrends/schema";
import { Hono } from "hono";

const app = new Hono();

const TABLES_MAP = {
  cars,
  coe,
} as const;

const TABLES = Object.keys(TABLES_MAP);

app.get("/latest", zValidator("query", LatestMonthQuerySchema), async (c) => {
  const { type } = c.req.query();

  const tablesToCheck = type && TABLES.includes(type) ? [type] : TABLES;

  const latestMonthObj = await Promise.all(
    tablesToCheck.map(async (tableType) => ({
      [tableType]: await getLatestMonth(TABLES_MAP[tableType]),
    })),
  ).then((results) => Object.assign({}, ...results));

  return c.json(latestMonthObj);
});

export default app;
