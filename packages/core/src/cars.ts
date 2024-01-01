import { format, subMonths } from "date-fns";
import db from "../../config/db";
import { Car, FUEL_TYPE } from "./types";
import { WithId } from "mongodb";

const collection = db.collection<Car>("cars");

const today = new Date();
const trailingTwelveMonths = format(subMonths(today, 12), "yyyy-MM");

const getCarsByFuelType = async (
  fuelType: FUEL_TYPE,
  month?: string,
): Promise<WithId<Car>[]> => {
  const filter = {
    fuel_type: fuelType,
    month: month ?? { $gte: trailingTwelveMonths },
  };

  const cars: WithId<Car>[] = await collection.find(filter).toArray();

  return cars.reduce(
    (result: WithId<Car>[], { _id, month, make, fuel_type, number }) => {
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
    },
    [],
  );
};

export const electric = async ({
  month,
}: {
  month?: string;
}): Promise<WithId<Car>[]> => getCarsByFuelType(FUEL_TYPE.ELECTRIC, month);

export const petrol = async ({
  month,
}: {
  month?: string;
}): Promise<WithId<Car>[]> => getCarsByFuelType(FUEL_TYPE.PETROL, month);

export * as Cars from "./cars";
