import type { WithId } from "mongodb";
import { format, subMonths } from "date-fns";
import db from "../config/db";
import type { Car, FUEL_TYPE } from "../types";

const trailingTwelveMonths = format(subMonths(new Date(), 12), "yyyy-MM");

export const getCarsByFuelType = async (
  fuelType: FUEL_TYPE | RegExp,
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
    (result: WithId<Car>[], { month, make, number, ...car }: WithId<Car>) => {
      const existingCar: WithId<Car> = result.find(
        (car) => car.month === month && car.make === make,
      );

      if (existingCar) {
        existingCar["number"] += Number(number);
      } else {
        result.push({
          ...car,
          month,
          make,
          number: Number(number),
        });
      }

      return result;
    },
    [],
  );
};
