import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { compress } from "hono/compress";
import { showRoutes } from "hono/dev";
import { prettyJSON } from "hono/pretty-json";
import { logger } from "hono/logger";
import { WithId } from "mongodb";
import { format, subMonths } from "date-fns";
import db from "./config/db";
import { Car, COEResult, FUEL_TYPE } from "./types";

const app = new Hono();

app.use(logger());
app.use(compress());
app.use(prettyJSON());
app.use("*", (c, next) => {
  c.res.headers.append("Cache-Control", "public, max-age=86400");
  return next();
});

const trailingTwelveMonths = format(subMonths(new Date(), 12), "yyyy-MM");

const getCarsByFuelType = async (
  fuelType: FUEL_TYPE,
  month?: string,
): Promise<WithId<Car>[]> => {
  const filter = {
    fuel_type: fuelType,
    month: month ?? { $gte: trailingTwelveMonths },
  };

  const cars: WithId<Car>[] = await db
    .collection<Car>("cars")
    .find(filter)
    .toArray();

  return cars.reduce(
    (result: WithId<Car>[], { _id, month, make, fuel_type, number }) => {
      const existingCar = result.find(
        (car) => car.month === month && car.make === make,
      );

      if (existingCar) {
        existingCar.number += Number(number);
      } else {
        result.push({
          _id,
          month,
          make,
          fuel_type,
          number: Number(number),
        });
      }

      return result;
    },
    [],
  );
};

const getLatestMonth = async (): Promise<string> => {
  const months = await db.collection<COEResult>("coe").distinct("month");
  return months[months.length - 1];
};

export const getCOEResultByMonth = async (
  month?: string,
): Promise<WithId<COEResult>[]> => {
  const selectedMonth = month || (await getLatestMonth());
  return db
    .collection<COEResult>("coe")
    .find({ month: selectedMonth })
    .sort({ bidding_no: 1, vehicle_class: 1 })
    .toArray();
};

app.get("/", async (c) => {
  const month = c.req.query("month");

  const cars: WithId<Car>[] = await getCarsByFuelType(
    FUEL_TYPE.ELECTRIC,
    month,
  );

  return c.json(cars);
});

app.get("/electric", async (c) => {
  const month = c.req.query("month");

  const cars: WithId<Car>[] = await getCarsByFuelType(
    FUEL_TYPE.ELECTRIC,
    month,
  );

  return c.json(cars);
});

app.get("/petrol", async (c) => {
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
