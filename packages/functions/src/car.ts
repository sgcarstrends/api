import { ApiHandler } from "sst/node/api";
import { Car } from "@lta-datasets-updater/core/car";

export const electric = ApiHandler(async (_evt) => {
  const electricCars = await Car.electric();

  return {
    statusCode: 200,
    body: JSON.stringify(electricCars),
  };
});

export const petrol = ApiHandler(async (_evt) => {
  const petrolCars = await Car.petrol();

  return {
    statusCode: 200,
    body: JSON.stringify(petrolCars),
  };
});
c;
