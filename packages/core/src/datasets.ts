export * as Datasets from "./datasets";
import fetch from "node-fetch";
import fs from "fs";
import AdmZip from "adm-zip";
import * as d3 from "d3";
import db from "../../config/db";

export const updater = async () => {
  const tempDir = "/tmp";
  const zipFileName = `Monthly New Registration of Cars by Make.zip`;
  const zipFilePath = `${tempDir}/${zipFileName}`;
  const csvFileName = `M03-Car_Regn_by_make.csv`;
  const csvFilePath = `${tempDir}/${csvFileName}`;
  const zipUrl = `https://datamall.lta.gov.sg/content/dam/datamall/datasets/Facts_Figures/Vehicle Registration/${zipFileName}`;

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
