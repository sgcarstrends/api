import { WithId } from "mongodb";
import db from "../config/db";
import { COEResult } from "../types";

const getLatestMonth = async (): Promise<string> => {
  const months = await db.collection<COEResult>("coe").distinct("month");
  return months[months.length - 1];
};

export const getCOEResultByMonth = async (
  month?: string,
): Promise<WithId<COEResult>[]> => {
  const selectedMonth = month || (await getLatestMonth());
  return db
    .collection<COEResult>("coe")
    .find({ month: selectedMonth })
    .sort({ bidding_no: 1, vehicle_class: 1 })
    .toArray();
};
