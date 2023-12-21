import db from "../../config/db";

const collection = db.collection("coe");

export const latest = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const formattedMonth = [year, month].join("-");

  return collection.find({ month: formattedMonth }).toArray();
};

export * as COE from "./coe";
