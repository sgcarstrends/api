import { FUEL_TYPE } from "@/types";

export const HYBRID_REGEX = new RegExp(
	`^(${FUEL_TYPE.DIESEL}|${FUEL_TYPE.PETROL})-${FUEL_TYPE.ELECTRIC}(\\s\\(Plug-In\\))?$`,
	"i",
);
