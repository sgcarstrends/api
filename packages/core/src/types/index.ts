import { ObjectId } from "mongodb";
import { FUEL_TYPE } from "../config";

export type CarType = {
  month: string;
  make: string;
  fuel_type: FUEL_TYPE | string;
  number: number;
  selected?: boolean;
};

export interface COEResult {
  // _id: ObjectId;
  month: string;
  bidding_no: string;
  vehicle_class: string;
  quota: string;
  bids_success: string;
  bids_received: string;
  premium: string;
}
