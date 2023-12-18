export * as Datasets from "./datasets";
import fs from "fs";
import AdmZip from "adm-zip";
import * as d3 from "d3";
import { downloadFile } from "./lib/downloadFile";
import db from "../../config/db";

export const updater = async () => {
  const extractToPath = "/tmp";
  const zipFileName = `Monthly New Registration of Cars by Make.zip`;
  const zipFilePath = `${extractToPath}/${zipFileName}`;
  const zipUrl = `https://datamall.lta.gov.sg/content/dam/datamall/datasets/Facts_Figures/Vehicle Registration/${zipFileName}`;

  await downloadFile({
    url: zipUrl,
    destination: zipFilePath,
  });

  const zip = new AdmZip(zipFilePath);
  zip.extractAllTo(`${extractToPath}`, true);
  const zipEntries = zip.getEntries();

  let destinationPath = extractToPath;
  zipEntries.forEach((entry) => {
    if (!entry.isDirectory) {
      const entryName = entry.entryName;

      destinationPath = `${extractToPath}/${entryName}`;

      const content = entry.getData();
      fs.writeFileSync(destinationPath, content);
    }
  });

  console.log(destinationPath);

  const csvData = fs.readFileSync(destinationPath, "utf-8");
  const parsedData = d3.csvParse(csvData);

  let message: string;

  const existingData = await db.collection("cars").find().toArray();
  if (existingData.length === 0) {
    const result = await db.collection("cars").insertMany(parsedData);
    message = `${result.insertedCount} document(s) inserted`;
  } else {
    const existingDataMap = new Map(
      existingData.map((item) => [item.month, item]),
    );
    const newDataToInsert = parsedData.filter(
      (newItem) => !existingDataMap.has(newItem.month),
    );

    if (newDataToInsert.length > 0) {
      const result = await db.collection("cars").insertMany(newDataToInsert);
      message = `${result.insertedCount} document(s) inserted`;
    } else {
      message =
        "No new data to insert. The provided data matches the existing records.";
    }
  }

  return { message };
};
