import { ObjectId } from "mongodb";
import { format, subMonths } from "date-fns";
import db from "../../config/db";
import { FUEL_TYPE } from "./config";
import type { CarType } from "./types";

// TODO: Will return to clean up the types
interface CarDocument extends CarType {
  _id: ObjectId;
}

const today = new Date();
const trailingTwelveMonths = format(subMonths(today, 12), "yyyy-MM");

const getCarsByFuelType = async (
  fuelType: FUEL_TYPE,
  month?: string,
): Promise<CarDocument[]> => {
  const filter = {
    fuel_type: fuelType,
    month: month ?? { $gte: trailingTwelveMonths },
  };

  let cars = await db.collection<CarDocument>("cars").find(filter).toArray();

  return cars.reduce(
    (result: CarDocument[], { _id, month, make, fuel_type, number }) => {
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
    },
    [],
  );
};

export const electric = async ({
  month,
}: {
  month?: string;
}): Promise<CarDocument[]> => getCarsByFuelType(FUEL_TYPE.ELECTRIC, month);

export const petrol = async ({
  month,
}: {
  month?: string;
}): Promise<CarDocument[]> => getCarsByFuelType(FUEL_TYPE.PETROL, month);

export * as Cars from "./cars";
