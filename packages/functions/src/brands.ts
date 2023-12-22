import { ApiHandler } from "sst/node/api";
import { Brands } from "@lta-cars-dataset/core/brands";
import { createResponse } from "./utils/createResponse";

export const list = ApiHandler(async (_evt) => {
  const brands = await Brands.list();

  return createResponse(brands);
});
