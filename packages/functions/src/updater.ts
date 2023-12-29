import { ApiHandler } from "sst/node/api";
import { Updater } from "@lta-cars-dataset/core/updater";
import { createResponse } from "./utils/createResponse";

export const cars = ApiHandler(async (_evt) => {
  const COLLECTION_NAME: string = "cars";
  const ZIP_FILE_NAME: string = "Monthly New Registration of Cars by Make.zip";
  const ZIP_URL: string = `https://datamall.lta.gov.sg/content/dam/datamall/datasets/Facts_Figures/Vehicle Registration/${ZIP_FILE_NAME}`;

  const { message } = await Updater.update({
    collectionName: COLLECTION_NAME,
    zipFileName: ZIP_FILE_NAME,
    zipUrl: ZIP_URL,
    keyFields: ["month"],
  });

  console.log(`Message:`, message);

  return createResponse({
    status: 200,
    collection: COLLECTION_NAME,
    message,
    timestamp: new Date().toISOString(),
  });
});

export const coe = ApiHandler(async (_evt) => {
  const COLLECTION_NAME: string = "coe";
  const ZIP_FILE_NAME: string = "COE Bidding Results.zip";
  const ZIP_URL: string = `https://datamall.lta.gov.sg/content/dam/datamall/datasets/Facts_Figures/Vehicle Registration/${ZIP_FILE_NAME}`;

  const { message } = await Updater.update({
    collectionName: COLLECTION_NAME,
    zipFileName: ZIP_FILE_NAME,
    zipUrl: ZIP_URL,
    keyFields: ["month", "bidding_no"],
  });

  console.log(`Message:`, message);

  return createResponse({
    status: 200,
    collection: COLLECTION_NAME,
    message,
    timestamp: new Date().toISOString(),
  });
});
