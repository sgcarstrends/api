import { ApiHandler } from "sst/node/api";
import { Brands } from "@lta-datasets-updater/core/brands";

export const list = ApiHandler(async (_evt) => {
  const brands = await Brands.list();

  return {
    statusCode: 200,
    body: JSON.stringify(brands),
  };
});
