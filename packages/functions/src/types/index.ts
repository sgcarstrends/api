import { FUEL_TYPE } from "../config";

export interface Car {
  month: string;
  make: string;
  fuel_type: FUEL_TYPE | string;
  number: number;
  selected?: boolean;
}

export type Dataset = {
  label: string;
  data: number[];
};

export interface ChartDataset extends Dataset {
  borderColor: string;
  checked: boolean;
}
