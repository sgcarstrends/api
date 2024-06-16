import { format, subMonths } from "date-fns";
import db from "../config/db";
import { type Car, FUEL_TYPE } from "../types";

const FUEL_TYPE_MAP: Record<string, FUEL_TYPE | RegExp> = {
  DIESEL: FUEL_TYPE.DIESEL,
  ELECTRIC: FUEL_TYPE.ELECTRIC,
  HYBRID: /^(Diesel|Petrol)-(Electric)(\s\(Plug-In\))?$/,
  OTHERS: FUEL_TYPE.OTHERS,
  PETROL: FUEL_TYPE.PETROL,
};

const trailingTwelveMonths = format(subMonths(new Date(), 12), "yyyy-MM");

export const getCarsByFuelType = async (fuelType: string, month?: string) => {
  fuelType = fuelType.toUpperCase();

  const filter = {
    fuel_type: FUEL_TYPE_MAP[fuelType],
    month: month ?? { $gte: trailingTwelveMonths },
  };

  const cars = await db
    .collection<Car>("cars")
    .find(filter)
    .sort({ month: -1, make: 1 })
    .toArray();

  return cars.reduce((result, { month, make, number, ...car }) => {
    const existingCar = result.find(
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
  }, []);
};
