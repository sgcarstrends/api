import db from "@/config/db";
import { type Car, FuelType } from "@/types";
import { format, subMonths } from "date-fns";
import { and, asc, desc, gte, ilike, or } from "drizzle-orm";
import { cars } from "../../migrations/schema";

const HYBRID_TYPES = [
  "Diesel-Electric",
  "Diesel-Electric (Plug-In)",
  "Petrol-Electric",
  "Petrol-Electric (Plug-In)",
];

const FUEL_TYPE_MAP = {
  DIESEL: [FuelType.Diesel],
  ELECTRIC: [FuelType.Electric],
  OTHERS: [FuelType.Others],
  PETROL: [FuelType.Petrol],
};

const trailingTwelveMonths = format(subMonths(new Date(), 12), "yyyy-MM");

export const getCarsByFuelType = async (fuelType: string, month?: string) => {
  const normalisedFuelType = fuelType.toUpperCase();

  const filters = [
    fuelType &&
      or(
        ilike(cars.fuelType, FUEL_TYPE_MAP[normalisedFuelType]),
        ...HYBRID_TYPES.map((type) => ilike(cars.fuelType, type)),
      ),
    month && gte(cars.month, trailingTwelveMonths),
  ];

  const result = await db
    .select()
    .from(cars)
    .where(and(...filters))
    .orderBy(desc(cars.month), asc(cars.make));

  return result.reduce((result, { month, make, number, ...car }) => {
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
};
