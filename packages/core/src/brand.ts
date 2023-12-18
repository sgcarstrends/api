export * as Brand from "./brand";
import db from "../../config/db";

export const brands = async () => {
  try {
    return db.collection("cars").distinct("make");
  } catch (error) {
    console.error(error);
  }
};
