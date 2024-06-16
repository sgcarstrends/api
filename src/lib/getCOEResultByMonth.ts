import db from "../config/db";
import { getLatestMonth } from "./getLatestMonth";
import type { COEResult } from "../types";

export const getCOEResultByMonth = async (month?: string) => {
  let selectedMonth = month;

  if (!month) {
    selectedMonth = await getLatestMonth("coe");
  }

  return db
    .collection<COEResult>("coe")
    .find({ month: selectedMonth })
    .sort({ bidding_no: -1, vehicle_class: 1 })
    .toArray();
};
