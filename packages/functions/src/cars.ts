import { ApiHandler, useQueryParam } from "sst/node/api";
import { Cars } from "@lta-cars-dataset/core/cars";
import { createResponse } from "./utils/createResponse";

export const electric = ApiHandler(async (_evt) => {
  const month = useQueryParam("month");
  const electricCars = await Cars.electric({ month });

  return createResponse(electricCars);
});

export const petrol = ApiHandler(async (_evt) => {
  const month = useQueryParam("month");
  const petrolCars = await Cars.petrol({ month });

  return createResponse(petrolCars);
});
