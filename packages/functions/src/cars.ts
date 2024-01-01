import { ApiHandler, useQueryParam } from "sst/node/api";
import { Cars } from "@lta-cars-dataset/core/cars";
import { createResponse } from "./utils/createResponse";
import { WithId } from "mongodb";
import { Car } from "@lta-cars-dataset/core/types";

export const electric = ApiHandler(async (_evt) => {
  const month = useQueryParam("month");
  const cars: WithId<Car>[] = await Cars.electric({ month });
  return createResponse(cars);
});

export const petrol = ApiHandler(async (_evt) => {
  const month = useQueryParam("month");
  const cars: WithId<Car>[] = await Cars.petrol({ month });
  return createResponse(cars);
});
