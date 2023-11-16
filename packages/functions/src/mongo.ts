import { ApiHandler } from "sst/node/api";
import { Config } from "sst/node/config";
import * as mongodb from "mongodb";
import fetch from "node-fetch";
import fs from "fs";
import AdmZip from "adm-zip";
import * as d3 from "d3";
import { FUEL_TYPE } from "@lta-datasets-updater/core/config";

const MongoClient = mongodb.MongoClient;

let cachedDb: mongodb.Db | null = null;

const connectToDatabase = async (): Promise<mongodb.Db> => {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await MongoClient.connect(Config.MONGODB_URI);
  cachedDb = await client.db("main");

  return cachedDb;
};

export const handler = ApiHandler(async (event, context) => {
  const tempDir: string = "/tmp";
  const zipFileName: string = `Monthly New Registration of Cars by Make.zip`;
  const zipFilePath: string = `${tempDir}/${zipFileName}`;
  const csvFileName: string = `M03-Car_Regn_by_make.csv`;
  const csvFilePath: string = `${tempDir}/${csvFileName}`;
  const zipUrl: string = `https://datamall.lta.gov.sg/content/dam/datamall/datasets/Facts_Figures/Vehicle Registration/${zipFileName}`;

  const response = await fetch(zipUrl);
  if (!response.ok) {
    throw new Error(`Failed to download the ZIP file: ${response.statusText}`);
  }
  const data = await response.buffer();
  fs.writeFileSync(zipFilePath, data);

  const zip = new AdmZip(zipFilePath);
  zip.extractAllTo(`${tempDir}`, true);

  const csvData = fs.readFileSync(csvFilePath, "utf-8");
  const parsedData = d3.csvParse(csvData);

  context.callbackWaitsForEmptyEventLoop = false;

  const db = await connectToDatabase();

  const existingData = await db.collection("cars").find().toArray();
  if (existingData.length === 0) {
    const result = await db.collection("cars").insertMany(parsedData);
    console.log(`${result.insertedCount} document(s) inserted`);
  } else {
    const newDataToInsert = parsedData.filter(
      (newItem) =>
        !existingData.some(
          (existingItem) => existingItem.month === newItem.month,
        ),
    );

    if (newDataToInsert.length > 0) {
      const result = await db.collection("cars").insertMany(newDataToInsert);
      console.log(`${result.insertedCount} document(s) inserted`);
    } else {
      console.log("No new data to insert");
    }
  }

  const cars = await db
    .collection("cars")
    .find({ fuel_type: FUEL_TYPE.ELECTRIC })
    .toArray();

  return {
    statusCode: 200,
    body: JSON.stringify(cars),
  };
});