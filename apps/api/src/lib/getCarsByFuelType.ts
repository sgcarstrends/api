import db from "@api/config/db";
import { getLatestMonth } from "@api/lib/getLatestMonth";
import type { FuelType } from "@api/types";
import getTrailingTwelveMonths from "@api/utils/getTrailingTwelveMonths";
import { cars } from "@sgcarstrends/schema";
import { and, asc, between, desc, eq, ilike, or } from "drizzle-orm";

const HYBRID_TYPES = [
  "Diesel-Electric",
  "Diesel-Electric (Plug-In)",
  "Petrol-Electric",
  "Petrol-Electric (Plug-In)",
];

export const getCarsByFuelType = async (fuelType: FuelType, month?: string) => {
  const latestMonth = await getLatestMonth(cars);

  const filters = [
    fuelType &&
      or(
        ilike(cars.fuel_type, fuelType),
        ...HYBRID_TYPES.map((type) => ilike(cars.fuel_type, type)),
      ),
    month
      ? eq(cars.month, month)
      : between(cars.month, getTrailingTwelveMonths(latestMonth), latestMonth),
  ];

  try {
    const results = await db
      .select()
      .from(cars)
      .where(and(...filters))
      .orderBy(desc(cars.month), asc(cars.make));

    return results.reduce((result, { month, make, number, ...car }) => {
      const existingCar = result.find(
        (car) => car.month === month && car.make === make,
      );

      if (existingCar) {
        existingCar.number += Number(number);
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
  } catch (e) {
    console.error(e);
    throw e;
  }
};
