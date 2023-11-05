import { ApiHandler } from "sst/node/api";
import fs from "fs";
import fetch from "node-fetch";
import * as d3 from "d3";
import AdmZip from "adm-zip";
import { FUEL_TYPE } from "./config";
import { sortByMake } from "./lib/sortByMake";
import type { Car } from "./types";

export const handler = ApiHandler(async (_evt) => {
  const tempDir: string = "/tmp";
  const zipFileName: string = `Monthly New Registration of Cars by Make.zip`;
  const zipFilePath: string = `${tempDir}/${zipFileName}`;
  const csvFileName: string = `M03-Car_Regn_by_make.csv`;
  const csvFilePath: string = `${tempDir}/${csvFileName}`;
  const zipUrl: string = `https://datamall.lta.gov.sg/content/dam/datamall/datasets/Facts_Figures/Vehicle Registration/${zipFileName}`;

  try {
    const response = await fetch(zipUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to download the ZIP file: ${response.statusText}`,
          );
        }
        return response.buffer();
      })
      .then((data) => {
        fs.writeFileSync(zipFilePath, data);
      })
      .catch((error) =>
        console.error("Error while downloading the ZIP file:", error),
      );

    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(`${tempDir}`, true);

    const csvData = fs.readFileSync(csvFilePath, "utf-8");

    const parsedData = d3.csvParse(csvData);

    const electricCars: Car[] = parsedData
      .filter(
        ({ fuel_type, number }) =>
          fuel_type === FUEL_TYPE.ELECTRIC && +number !== 0,
      )
      .reduce((result: Car[], { month, make, fuel_type, number }) => {
        const existingCar = result.find(
          (car) => car.month === month && car.make === make,
        );

        if (existingCar) {
          existingCar.number += Number(number);
        } else {
          result.push({
            month,
            make,
            fuel_type,
            number: Number(number),
          });
        }

        return result;
      }, [])
      .map((car) => ({ ...car, number: +car.number }))
      .sort(sortByMake);

    console.table(electricCars);

    return {
      statusCode: 200,
      body: JSON.stringify(electricCars),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: "Error occurred while processing the ZIP file.",
    };
  }
});
