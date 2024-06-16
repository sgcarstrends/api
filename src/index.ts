import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { compress } from "hono/compress";
import { showRoutes } from "hono/dev";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import type { WithId } from "mongodb";
import db from "./config/db";
import { getCarsByFuelType, getCOEResultByMonth } from "./lib";
import { type Car, type COEResult, FUEL_TYPE } from "./types";

const app = new Hono();

app.use(logger());
app.use(compress());
app.use(prettyJSON());
app.use("*", (c, next) => {
  c.res.headers.append("Cache-Control", "public, max-age=86400");
  return next();
});

app.get("/", async (c) => {
  const month = c.req.query("month");

  const cars: WithId<Car>[] = await getCarsByFuelType(
    FUEL_TYPE.ELECTRIC,
    month,
  );

  return c.json(cars);
});

app.get("/cars/petrol", async (c) => {
  const month = c.req.query("month");

  const cars: WithId<Car>[] = await getCarsByFuelType(FUEL_TYPE.PETROL, month);

  return c.json(cars);
});

app.get("/cars/hybrid", async (c) => {
  const hybridRegex = /(?=.*Diesel).*Electric|(?=.*Petrol).*Electric/;

  return c.json(
    await db
      .collection("cars")
      .find({ fuel_type: { $regex: hybridRegex } })
      .toArray(),
  );
});

app.get("/cars/electric", async (c) => {
  const month = c.req.query("month");

  const cars: WithId<Car>[] = await getCarsByFuelType(
    FUEL_TYPE.ELECTRIC,
    month,
  );

  return c.json(cars);
});

app.get("/cars/diesel", async (c) => {
  const month = c.req.query("month");

  const cars: WithId<Car>[] = await getCarsByFuelType(FUEL_TYPE.DIESEL, month);

  return c.json(cars);
});

app.get("/coe", async (c) => {
  return c.json(await db.collection<COEResult>("coe").find().toArray());
});

app.get("/coe/latest", async (c) => {
  const month = c.req.query("month");
  const result: WithId<COEResult>[] = await getCOEResultByMonth(month);
  return c.json(result);
});

app.get("/vehicle-make", async (c) => {
  return c.json(await db.collection<Car>("cars").distinct("make"));
});

app.get("/months", async (c) => {
  const group = c.req.query("group");
  const months = await db.collection<Car>("cars").distinct("month");

  const sortedMonths = months.sort((a, b) => b.localeCompare(a));

  if (group) {
    return c.json(
      sortedMonths.reduce((acc: Record<string, string[]>, date) => {
        const [year, month] = date.split("-");

        if (!acc[year]) {
          acc[year] = [];
        }

        acc[year].push(month);

        return acc;
      }, {}),
    );
  }

  return c.json(sortedMonths);
});

showRoutes(app);

export const handler = handle(app);
