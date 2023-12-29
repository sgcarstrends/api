import db from "../../config/db";

const collection = db.collection("coe");

export const list = async () => collection.find().toArray();

export const getCOEResultByMonth = async (month?: string) => {
  const date = new Date();
  const formattedMonth =
    month || [date.getFullYear(), date.getMonth() + 1].join("-");

  return collection
    .find({ month: formattedMonth })
    .sort({ bidding_no: 1, vehicle_class: 1 })
    .toArray();
};

export * as COE from "./coe";
