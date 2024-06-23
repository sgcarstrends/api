import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { compress } from "hono/compress";
import { showRoutes } from "hono/dev";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import db from "./config/db";
import {
  getCarsByFuelType,
  getCOEResultByMonth,
  groupMonthsByYear,
} from "./lib";
import { getLatestMonth } from "./lib/getLatestMonth";
import { type Car, type COEResult, FUEL_TYPE } from "./types";

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

app.get("/cars", async (c) => {
  const month = c.req.query("month");
  return c.json(await db.collection<Car>("cars").find({ month }).toArray());
});

app.get("/cars/:fuelType", async (c) => {
  const fuelType = c.req.param("fuelType");
  const month = c.req.query("month");
  return c.json(await getCarsByFuelType(fuelType, month));
});

app.get("/make", async (c) => {
  return c.json(await db.collection<Car>("cars").distinct("make"));
});

app.get("/make/:make", async (c) => {
  const make = c.req.param("make");
  const { month, fuelType, vehicleType } = c.req.query();

  const filter = {
    ...(make && { make: new RegExp(make, "i") }),
    ...(month && { month }),
    ...(fuelType && { fuel_type: new RegExp(`^${fuelType}$`, "i") }),
    ...(vehicleType && { vehicle_type: new RegExp(vehicleType, "i") }),
  };

  return c.json(
    await db
      .collection<Car>("cars")
      .find(filter)
      .sort({ month: -1, fuel_type: 1, vehicle_type: 1 })
      .toArray(),
  );
});

app.get("/coe", async (c) => {
  return c.json(
    await db
      .collection<COEResult>("coe")
      .find()
      .sort({ month: -1, bidding_no: -1, vehicle_class: 1 })
      .toArray(),
  );
});

app.get("/coe/latest", async (c) => {
  const month = c.req.query("month");
  return c.json(await getCOEResultByMonth(month));
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

app.get("/months/latest", async (c) => {
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

showRoutes(app);

export const handler = handle(app);
