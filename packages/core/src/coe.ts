import fs from "fs/promises";
import * as d3 from "d3";
import { downloadFile } from "./lib/downloadFile";
import { extractZipFile } from "./lib/extractZipFile";
import db from "../../config/db";

// Constants
const EXTRACT_PATH: string = "/tmp";
const ZIP_FILE_NAME: string = "COE Bidding Results.zip";
const ZIP_URL: string = `https://datamall.lta.gov.sg/content/dam/datamall/datasets/Facts_Figures/Vehicle Registration/${ZIP_FILE_NAME}`;
const COLLECTION_NAME: string = "coe";

export const updater = async () => {
  try {
    const zipFilePath = `${EXTRACT_PATH}/${ZIP_FILE_NAME}`;
    await downloadFile({ url: ZIP_URL, destination: zipFilePath });

    const extractedFileName = await extractZipFile(zipFilePath, EXTRACT_PATH);
    const destinationPath = `${EXTRACT_PATH}/${extractedFileName}`;
    console.log(`Destination path:`, destinationPath);

    const csvData = await fs.readFile(destinationPath, "utf-8");
    const parsedData = d3.csvParse(csvData);

    const existingData = await db.collection(COLLECTION_NAME).find().toArray();
    const existingDataMap = new Map(
      existingData.map((item) => [item.month, item]),
    );
    const newDataToInsert = parsedData.filter(
      (newItem) => !existingDataMap.has(newItem.month),
    );

    let message;
    if (newDataToInsert.length > 0) {
      const result = await db
        .collection(COLLECTION_NAME)
        .insertMany(newDataToInsert);
      message = `${result.insertedCount} document(s) inserted.`;
    } else {
      message =
        "No new data to insert. The provided data matches the existing records.";
    }
    return { message };
  } catch (error) {
    console.error("An error has occurred:", error);
    throw error;
  }
};

export * as COE from "./coe";
