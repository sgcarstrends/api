import { ApiHandler } from "sst/node/api";
import { Car } from "@lta-datasets-updater/core/car";

export const list = ApiHandler(async (_evt) => ({
  statusCode: 200,
  body: JSON.stringify(await Car.list()),
}));
