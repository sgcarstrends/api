import db from "@/config/db";
import { type Car, FuelType } from "@/types";
import { format, subMonths } from "date-fns";

const FUEL_TYPE_MAP: Record<string, FuelType | RegExp> = {
	DIESEL: FuelType.Diesel,
	ELECTRIC: FuelType.Electric,
	HYBRID: new RegExp(
		`^(${FuelType.Diesel}|${FuelType.Petrol})-${FuelType.Electric}(\s\(Plug-In\))?$`,
	),
	OTHERS: FuelType.Others,
	PETROL: FuelType.Petrol,
};

const trailingTwelveMonths = format(subMonths(new Date(), 12), "yyyy-MM");

export const getCarsByFuelType = async (fuelType: string, month?: string) => {
	const normalisedFuelType = fuelType.toUpperCase();

	const filter = {
		fuel_type: FUEL_TYPE_MAP[normalisedFuelType],
		month: month ?? { $gte: trailingTwelveMonths },
	};

	const cars = await db
		.collection<Car>("cars")
		.find(filter)
		.sort({ month: -1, make: 1 })
		.toArray();

	return cars.reduce<Car[]>((result, { month, make, number, ...car }) => {
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
