import { ApiHandler } from "sst/node/api";
import { Cars } from "@lta-datasets-updater/core/cars";

export const electric = ApiHandler(async (_evt) => {
  const electricCars = await Cars.electric();

  return {
    statusCode: 200,
    body: JSON.stringify(electricCars),
  };
});

export const petrol = ApiHandler(async (_evt) => {
  const petrolCars = await Cars.petrol();

  return {
    statusCode: 200,
    body: JSON.stringify(petrolCars),
  };
});
