import { ApiHandler } from "sst/node/api";
import { Updater } from "@lta-datasets-updater/core/updater";
import { createResponse } from "./utils/createResponse";

export const cars = ApiHandler(async (_evt, context) => {
  const ZIP_FILE_NAME: string = "Monthly New Registration of Cars by Make.zip";
  const ZIP_URL: string = `https://datamall.lta.gov.sg/content/dam/datamall/datasets/Facts_Figures/Vehicle Registration/${ZIP_FILE_NAME}`;

  const { message } = await Updater.update({
    collectionName: "cars",
    zipFileName: ZIP_FILE_NAME,
    zipUrl: ZIP_URL,
  });

  console.log(`Message:`, message);

  return createResponse({
    status: 200,
    message,
    timestamp: new Date().toISOString(),
  });
});

export const coe = ApiHandler(async (_evt) => {
  const ZIP_FILE_NAME: string = "COE Bidding Results.zip";
  const ZIP_URL: string = `https://datamall.lta.gov.sg/content/dam/datamall/datasets/Facts_Figures/Vehicle Registration/${ZIP_FILE_NAME}`;

  const { message } = await Updater.update({
    collectionName: "coe",
    zipFileName: ZIP_FILE_NAME,
    zipUrl: ZIP_URL,
  });

  console.log(`Message:`, message);

  return createResponse({
    status: 200,
    message,
    timestamp: new Date().toISOString(),
  });
});
