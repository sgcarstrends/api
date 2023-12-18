export * as Datasets from "./datasets";
import fs from "fs/promises";
import AdmZip from "adm-zip";
import * as d3 from "d3";
import { downloadFile } from "./lib/downloadFile";
import db from "../../config/db";

// Constants
const EXTRACT_PATH: string = "/tmp";
const ZIP_FILE_NAME: string = `Monthly New Registration of Cars by Make.zip`;
const ZIP_URL: string = `https://datamall.lta.gov.sg/content/dam/datamall/datasets/Facts_Figures/Vehicle Registration/${ZIP_FILE_NAME}`;
const COLLECTION_NAME: string = "cars";

// Helper function to extract ZIP file
const extractZipFile = async (
  zipFilePath: string,
  extractToPath: string,
): Promise<string> => {
  const zip = new AdmZip(zipFilePath);
  zip.extractAllTo(extractToPath, true);
  const entry = zip.getEntries().find((entry) => !entry.isDirectory);
  return entry ? entry.entryName : "";
};

export const updater = async (): Promise<{ message: string }> => {
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

    let message: string;
    if (newDataToInsert.length > 0) {
      const result = await db
        .collection(COLLECTION_NAME)
        .insertMany(newDataToInsert);
      message = `${result.insertedCount} document(s) inserted`;
    } else {
      message =
        "No new data to insert. The provided data matches the existing records.";
    }

    return { message };
  } catch (error) {
    console.error(`An error has occurred:`, error);
    throw error;
  }
};
