import db from "../../config/db";

export const list = async () => {
  return db.collection("cars").distinct("make");
};

export * as Brands from "./brands";
