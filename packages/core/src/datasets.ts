export * as Datasets from "./datasets";
import fetch from "node-fetch";
import fs from "fs";
import AdmZip from "adm-zip";
import * as d3 from "d3";
import db from "../../config/db";

export const updater = async () => {
  const extractToPath = "/tmp";
  const zipFileName = `Monthly New Registration of Cars by Make.zip`;
  const zipFilePath = `${extractToPath}/${zipFileName}`;
  const csvFileName = `M03-Car_Regn_by_make.csv`;
  const csvFilePath = `${extractToPath}/${csvFileName}`;
  const zipUrl = `https://datamall.lta.gov.sg/content/dam/datamall/datasets/Facts_Figures/Vehicle Registration/${zipFileName}`;

  const response = await fetch(zipUrl);
  if (!response.ok) {
    throw new Error(`Failed to download the ZIP file: ${response.statusText}`);
  }

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

  const csvData = fs.readFileSync(destinationPath, "utf-8");
  const parsedData = d3.csvParse(csvData);

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
};
