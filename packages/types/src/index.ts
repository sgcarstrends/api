// Re-export schema types
export type {
  InsertCar,
  SelectCar,
  InsertCOE,
  SelectCOE,
  InsertCOEPQP,
  SelectCOEPQP,
} from "@sgcarstrends/schema";

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
  COEPQP = "coe_pqp",
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

// Common interfaces for data (before database insertion)
export interface Car {
  month: string;
  make: string;
  importer_type: string;
  fuel_type: string;
  vehicle_type: string;
  number: number;
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

export interface PQP {
  month: string;
  vehicle_class: string;
  pqp: number;
}

// Additional interfaces
export interface UpdateParams {
  collectionName: string;
  zipFileName: string;
  zipUrl: string;
  keyFields: string[];
}

export interface LatestMonth {
  latestMonth: string;
}

export interface CleanSpecialCharsOptions {
  separator?: string;
  joinSeparator?: string;
}
