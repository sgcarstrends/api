export type { InsertCar, SelectCar, InsertCOE, SelectCOE, InsertCOEPQP, SelectCOEPQP, } from "@sgcarstrends/schema";
export declare enum FuelType {
    Diesel = "Diesel",
    Electric = "Electric",
    Hybrid = "Hybrid",
    Petrol = "Petrol",
    Others = "Others"
}
export declare enum Collection {
    Cars = "cars",
    COE = "coe",
    COEPQP = "coe_pqp"
}
export declare enum OrderBy {
    ASC = "asc",
    DESC = "desc"
}
export declare enum VehicleClass {
    CategoryA = "Category A",
    CategoryB = "Category B",
    CategoryC = "Category C",
    CategoryD = "Category D",
    CategoryE = "Category E"
}
export type Stage = "dev" | "staging" | "prod";
export interface RawCar {
    month: string;
    make: string;
    importer_type: string;
    fuel_type: string;
    vehicle_type: string;
    number: number;
}
export interface RawCOE {
    month: string;
    bidding_no: number;
    vehicle_class: string;
    quota: number;
    bids_success: number;
    bids_received: number;
    premium: number;
}
export interface RawPQP {
    month: string;
    vehicle_class: string;
    pqp: number;
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
export interface CleanSpecialCharsOptions {
    separator?: string;
    joinSeparator?: string;
}
