import { ApiHandler } from "sst/node/api";
import { Brand } from "@lta-datasets-updater/core/brand";

export const brands = ApiHandler(async (_evt) => {
  const brands = await Brand.brands();

  return {
    statusCode: 200,
    body: JSON.stringify(brands),
  };
});
