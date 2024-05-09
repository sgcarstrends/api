import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { compress } from "hono/compress";
import { showRoutes } from "hono/dev";
import { prettyJSON } from "hono/pretty-json";
import { logger } from "hono/logger";
import { Document, WithId } from "mongodb";
import { format, subMonths } from "date-fns";
import * as d3 from "d3";
import fs from "fs/promises";
import db from "./config/db";
import { downloadFile } from "./utils/downloadFile";
import { extractZipFile } from "./utils/extractZipFile";
import { Car, COEResult, FUEL_TYPE, UpdateParams } from "./types";

const app = new Hono();

app.use(logger());
app.use(compress());
app.use(prettyJSON());
app.use("*", (c, next) => {
  c.res.headers.append("Cache-Control", "public;max-age=86400");
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

const EXTRACT_PATH: string = "/tmp";

export const update = async ({
  collectionName,
  zipFileName,
  zipUrl,
  keyFields,
}: UpdateParams): Promise<{ message: string }> => {
  const collection = db.collection<Document>(collectionName);

  try {
    const zipFilePath = `${EXTRACT_PATH}/${zipFileName}`;
    await downloadFile({ url: zipUrl, destination: zipFilePath });

    const extractedFileName = await extractZipFile(zipFilePath, EXTRACT_PATH);
    const destinationPath = `${EXTRACT_PATH}/${extractedFileName}`;
    console.log(`Destination path:`, destinationPath);

    const csvData = await fs.readFile(destinationPath, "utf-8");
    const parsedData = d3.csvParse(csvData);

    const existingData: WithId<Document>[] = await collection.find().toArray();

    const createUniqueKey = <T extends object>(
      item: T,
      keyFields: Array<keyof T>,
    ): string =>
      keyFields
        .filter((field) => item[field])
        .map((field) => item[field])
        .join("-");

    const existingDataMap: Map<string, WithId<Document>> = new Map(
      existingData.map((item) => [createUniqueKey(item, keyFields), item]),
    );
    const newDataToInsert = parsedData.filter(
      (newItem) => !existingDataMap.has(createUniqueKey(newItem, keyFields)),
    );

    let message: string;
    if (newDataToInsert.length > 0) {
      const result = await collection.insertMany(newDataToInsert);
      message = `${result.insertedCount} document(s) inserted`;
    } else {
      message = `No new data to insert. The provided data matches the existing records.`;
    }

    return { message };
  } catch (error) {
    console.error(`An error has occurred:`, error);
    throw error;
  }
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

app.get("/updater/cars", async (c) => {
  const COLLECTION_NAME: string = "cars";
  const ZIP_FILE_NAME: string = "Monthly New Registration of Cars by Make.zip";
  const ZIP_URL: string = `https://datamall.lta.gov.sg/content/dam/datamall/datasets/Facts_Figures/Vehicle Registration/${ZIP_FILE_NAME}`;

  const { message } = await update({
    collectionName: COLLECTION_NAME,
    zipFileName: ZIP_FILE_NAME,
    zipUrl: ZIP_URL,
    keyFields: ["month"],
  });

  console.log(`Message:`, message);

  return c.json({
    status: 200,
    collection: COLLECTION_NAME,
    message,
    timestamp: new Date().toISOString(),
  });
});

app.get("/updater/coe", async (c) => {
  const COLLECTION_NAME: string = "coe";
  const ZIP_FILE_NAME: string = "COE Bidding Results.zip";
  const ZIP_URL: string = `https://datamall.lta.gov.sg/content/dam/datamall/datasets/Facts_Figures/Vehicle Registration/${ZIP_FILE_NAME}`;

  const { message } = await update({
    collectionName: COLLECTION_NAME,
    zipFileName: ZIP_FILE_NAME,
    zipUrl: ZIP_URL,
    keyFields: ["month", "bidding_no"],
  });

  console.log(`Message:`, message);

  return c.json({
    status: 200,
    collection: COLLECTION_NAME,
    message,
    timestamp: new Date().toISOString(),
  });
});

app.get("/vehicle-make", (c) => {
  return c.json(db.collection<Car>("cars").distinct("make"));
});

showRoutes(app);

export const handler = handle(app);
