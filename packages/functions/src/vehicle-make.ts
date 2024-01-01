import { ApiHandler } from "sst/node/api";
import { VehicleMake } from "@lta-cars-dataset/core/vehicle-make";
import { createResponse } from "./utils/createResponse";

export const list = ApiHandler(async (_evt) => {
  const make: string[] = await VehicleMake.list();
  return createResponse(make);
});
