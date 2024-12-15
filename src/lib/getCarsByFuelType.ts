import db from "@/config/db";
import { type Car, FUEL_TYPE } from "@/types";
import { format, subMonths } from "date-fns";

const FUEL_TYPE_MAP: Record<string, FUEL_TYPE | RegExp> = {
	DIESEL: FUEL_TYPE.DIESEL,
	ELECTRIC: FUEL_TYPE.ELECTRIC,
	HYBRID: new RegExp(
		`^(${FUEL_TYPE.DIESEL}|${FUEL_TYPE.PETROL})-${FUEL_TYPE.ELECTRIC}(\\s\\(Plug-In\\))?$`,
	),
	OTHERS: FUEL_TYPE.OTHERS,
	PETROL: FUEL_TYPE.PETROL,
};

const trailingTwelveMonths = format(subMonths(new Date(), 12), "yyyy-MM");

export const getCarsByFuelType = async (fuelType: string, month?: string) => {
	const fuelTypeUpperCase = fuelType.toUpperCase();

	const filter = {
		fuel_type: FUEL_TYPE_MAP[fuelTypeUpperCase],
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
