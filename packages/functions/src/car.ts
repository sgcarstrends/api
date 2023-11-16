import { ApiHandler } from "sst/node/api";
import { Car } from "@lta-datasets-updater/core/car";
import { FUEL_TYPE } from "@lta-datasets-updater/core/config";
import db from "../../config/db";

export const electric = ApiHandler(async (_evt) => {
  const electricCars = await Car.electric();

  return {
    statusCode: 200,
    body: JSON.stringify(electricCars),
  };
});

export const petrol = ApiHandler(async (_evt) => {
  const petrolCars = await db
    .collection("cars")
    .find({ fuel_type: { $ne: FUEL_TYPE.PETROL } })
    .toArray();

  return {
    statusCode: 200,
    body: JSON.stringify(petrolCars),
  };
});
