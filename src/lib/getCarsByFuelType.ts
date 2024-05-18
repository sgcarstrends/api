import { WithId } from "mongodb";
import db from "../config/db";
import { Car, FUEL_TYPE } from "../types";
import { format, subMonths } from "date-fns";

const trailingTwelveMonths = format(subMonths(new Date(), 12), "yyyy-MM");

export const getCarsByFuelType = async (
  fuelType: FUEL_TYPE,
  month?: string,
): Promise<WithId<Car>[]> => {
  const filter = {
    fuel_type: fuelType,
    month: month ?? { $gte: trailingTwelveMonths },
  };

  const cars: WithId<Car>[] = await db
    .collection<Car>("cars")
    .find(filter)
    .toArray();

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
