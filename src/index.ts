import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { compress } from "hono/compress";
import { showRoutes } from "hono/dev";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import db from "./config/db";
import { getCarsByFuelType, getCOEResultByMonth } from "./lib";
import { type Car, type COEResult, FUEL_TYPE } from "./types";
import { groupMonthsByYear } from "./lib/groupMonthsByYear";

const app = new Hono();

app.use(logger());
app.use(compress());
app.use(prettyJSON());
// app.use("*", (c, next) => {
//   c.res.headers.append("Cache-Control", "public, max-age=86400");
//   return next();
// });

app.get("/", async (c) => {
  const month = c.req.query("month");
  return c.json(await getCarsByFuelType(FUEL_TYPE.PETROL, month));
});

app.get("/cars/:type", async (c) => {
  const type = c.req.param("type");
  const month = c.req.query("month");
  return c.json(await getCarsByFuelType(type, month));
});

app.get("/coe", async (c) => {
  return c.json(await db.collection<COEResult>("coe").find().toArray());
});

app.get("/coe/latest", async (c) => {
  const month = c.req.query("month");
  return c.json(await getCOEResultByMonth(month));
});

app.get("/vehicle-make", async (c) => {
  return c.json(await db.collection<Car>("cars").distinct("make"));
});

app.get("/months", async (c) => {
  const grouped = c.req.query("grouped");
  const months = await db.collection<Car>("cars").distinct("month");
  const sortedMonths = months.sort((a, b) => b.localeCompare(a));

  if (grouped) {
    return c.json(groupMonthsByYear(sortedMonths));
  }

  return c.json(sortedMonths);
});

showRoutes(app);

export const handler = handle(app);
