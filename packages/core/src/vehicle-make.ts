import db from "../../config/db";
import { Car } from "./types";
import { Flatten, WithId } from "mongodb";

const collection = db.collection<Car>("cars");

export const list = async (): Promise<Array<Flatten<WithId<Car>["make"]>>> =>
  collection.distinct("make");

export * as VehicleMake from "./vehicle-make";
