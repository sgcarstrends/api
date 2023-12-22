import db from "../../config/db";

export const list = async () => db.collection("cars").distinct("make");

export * as VehicleMake from "./vehicle-make";
