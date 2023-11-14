export * as Car from "./car";
import fetch from "node-fetch";
import fs from "fs";
import AdmZip from "adm-zip";
import * as d3 from "d3";
import { Car } from "./types";
import { FUEL_TYPE } from "./config";
import { filterDataLast12Months } from "./lib/filterDataLast12Months";
import { sortByMake } from "./lib/sortByMake";

export const list = async () => {
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
    .filter(filterDataLast12Months)
    .sort(sortByMake);

  return electricCars;
};
