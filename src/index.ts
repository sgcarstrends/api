import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { showRoutes } from "hono/dev";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { WithId } from "mongodb";
import db from "./config/db";
import { getCarsByFuelType, getCOEResultByMonth } from "./lib";
import { Car, COEResult, FUEL_TYPE } from "./types";

const app = new Hono();

app.use(cors());
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

app.get("/cars/electric", async (c) => {
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

showRoutes(app);

export const handler = handle(app);
