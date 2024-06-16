export enum FUEL_TYPE {
  DIESEL = "Diesel",
  ELECTRIC = "Electric",
  OTHERS = "Others",
  PETROL = "Petrol",
}

export interface Car {
  month: string;
  make: string;
  fuel_type: FUEL_TYPE;
  number: number;
  selected?: boolean;
}

export interface COEResult {
  month: string;
  bidding_no: string;
  vehicle_class: string;
  quota: string;
  bids_success: string;
  bids_received: string;
  premium: string;
}

export interface UpdateParams {
  collectionName: string;
  zipFileName: string;
  zipUrl: string;
  keyFields: string[];
}

export interface LatestMonth {
  _id: null;
  latestMonth: string;
}
