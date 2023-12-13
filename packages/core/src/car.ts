import { Document, InferIdType } from "mongodb";
import { format, subMonths } from "date-fns";
import db from "../../config/db";
import { FUEL_TYPE } from "./config";
import type { CarType } from "./types";

export * as Car from "./car";

const today = new Date();
const trailingTwelveMonths = format(subMonths(today, 12), "yyyy-MM");

const getCarsByFuelType = async (
  fuelType: FUEL_TYPE,
): Promise<Document & { _id: InferIdType<Document> }> => {
  let cars = await db
    .collection("cars")
    .find({ fuel_type: fuelType, month: { $gte: trailingTwelveMonths } })
    .toArray();

  return cars.reduce((result: any, { _id, month, make, fuel_type, number }) => {
    const existingCar = result.find(
      (car: CarType) => car.month === month && car.make === make,
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
  });
};

export const electric = async (): Promise<
  Document & { _id: InferIdType<Document> }
> => getCarsByFuelType(FUEL_TYPE.ELECTRIC);

export const petrol = async (): Promise<
  Document & { _id: InferIdType<Document> }
> => getCarsByFuelType(FUEL_TYPE.PETROL);
