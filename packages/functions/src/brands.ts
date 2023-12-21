import { ApiHandler } from "sst/node/api";
import { Brands } from "@lta-datasets-updater/core/brands";
import { createResponse } from "./utils/createResponse";

export const list = ApiHandler(async (_evt) => {
  const brands = await Brands.list();

  return createResponse(brands);
});
