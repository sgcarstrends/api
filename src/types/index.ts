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

export enum VehicleClass {
  CategoryA = "Category A",
  CategoryB = "Category B",
  CategoryC = "Category C",
  CategoryD = "Category D",
  CategoryE = "Category E",
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

export interface COE {
  month: string;
  bidding_no: number;
  vehicle_class: string;
  quota: number;
  bids_success: number;
  bids_received: number;
  premium: number;
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
