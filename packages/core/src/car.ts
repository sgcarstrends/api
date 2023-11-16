export * as Car from "./car";
import db from "../../config/db";
import { FUEL_TYPE } from "./config";
import { filterDataLast12Months } from "./lib/filterDataLast12Months";
import { sortByMake } from "./lib/sortByMake";
import type { CarType } from "./types";

export const electric = async (): Promise<CarType[]> => {
  let electricCars = await db
    .collection("cars")
    .find({
      fuel_type: FUEL_TYPE.ELECTRIC,
    })
    .toArray();

  return electricCars
    .reduce((result: any[], { _id, month, make, fuel_type, number }) => {
      const existingCar = result.find(
        (car) => car.month === month && car.make === make,
      );

      if (existingCar) {
        existingCar.number += Number(number);
      } else {
        result.push({
          _id,
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
};
