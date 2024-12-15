import { FuelType } from "@/types";

export const HYBRID_REGEX = new RegExp(
	`^(${FuelType.Diesel}|${FuelType.Petrol})-${FuelType.Electric}(\s\(Plug-In\))?$`,
	"i",
);
