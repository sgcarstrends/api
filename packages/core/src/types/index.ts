import { FUEL_TYPE } from "../config";

export type CarType = {
  month: string;
  make: string;
  fuel_type: FUEL_TYPE | string;
  number: number;
  selected?: boolean;
};
