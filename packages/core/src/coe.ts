import { WithId } from "mongodb";
import db from "../../config/db";
import { COEResult } from "./types";

const collection = db.collection<COEResult>("coe");

export const list = async (): Promise<WithId<COEResult>[]> =>
  collection.find().toArray();

const getLatestMonth = async (): Promise<string> => {
  const months = await collection.distinct("month");
  return months[months.length - 1];
};

export const getCOEResultByMonth = async (
  month?: string,
): Promise<WithId<COEResult>[]> => {
  const selectedMonth = month || (await getLatestMonth());
  return collection
    .find({ month: selectedMonth })
    .sort({ bidding_no: 1, vehicle_class: 1 })
    .toArray();
};

export * as COE from "./coe";
