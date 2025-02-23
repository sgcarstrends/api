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
