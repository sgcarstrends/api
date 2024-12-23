// Enums
export enum FuelType {
  Diesel = "Diesel",
  Electric = "Electric",
  Hybrid = "Hybrid",
  Petrol = "Petrol",
  Others = "Others",
}

export enum Collection {
  Cars = "cars",
  COE = "coe",
}

export enum OrderBy {
  ASC = "asc",
  DESC = "desc",
}

// Base types
export type Stage = "dev" | "staging" | "prod";
export type Make = Car["make"];

// Interfaces
export interface Car {
  month: string;
  make: string;
  fuel_type: FuelType;
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
  latestMonth: string;
}
