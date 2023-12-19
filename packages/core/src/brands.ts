import db from "../../config/db";

export const list = async () => {
  try {
    return db.collection("cars").distinct("make");
  } catch (error) {
    console.error(error);
  }
};

export * as Brands from "./brands";
