import { FuelType } from "@/types";

export const DEFAULT_CACHE_TTL = 24 * 60 * 60;

export const HYBRID_REGEX = new RegExp(
	`^(${FuelType.Diesel}|${FuelType.Petrol})-${FuelType.Electric}(\s\(Plug-In\))?$`,
	"i",
);
