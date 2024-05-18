import { update } from "./lib/update";

const createResponse = (collection: string, message: string) => {
  const response = {
    collection,
    message,
    timestamp: new Date().toISOString(),
  };

  console.log("Message:", response);

  return {
    statusCode: 200,
    body: response,
  };
};

export const cars = async () => {
  const COLLECTION_NAME: string = "cars";
  const ZIP_FILE_NAME: string = "Monthly New Registration of Cars by Make.zip";
  const ZIP_URL: string = `https://datamall.lta.gov.sg/content/dam/datamall/datasets/Facts_Figures/Vehicle Registration/${ZIP_FILE_NAME}`;

  const { message } = await update({
    collectionName: COLLECTION_NAME,
    zipFileName: ZIP_FILE_NAME,
    zipUrl: ZIP_URL,
    keyFields: ["month"],
  });

  return createResponse(COLLECTION_NAME, message);
};

export const coe = async () => {
  const COLLECTION_NAME: string = "coe";
  const ZIP_FILE_NAME: string = "COE Bidding Results.zip";
  const ZIP_URL: string = `https://datamall.lta.gov.sg/content/dam/datamall/datasets/Facts_Figures/Vehicle Registration/${ZIP_FILE_NAME}`;

  const { message } = await update({
    collectionName: COLLECTION_NAME,
    zipFileName: ZIP_FILE_NAME,
    zipUrl: ZIP_URL,
    keyFields: ["month", "bidding_no"],
  });

  return createResponse(COLLECTION_NAME, message);
};
