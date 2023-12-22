import { ApiHandler } from "sst/node/api";
import { Cars } from "@lta-cars-dataset/core/cars";
import { createResponse } from "./utils/createResponse";

export const electric = ApiHandler(async (_evt) => {
  const electricCars = await Cars.electric();

  return createResponse(electricCars);
});

export const petrol = ApiHandler(async (_evt) => {
  const petrolCars = await Cars.petrol();

  return createResponse(petrolCars);
});
