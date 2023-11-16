import { ApiHandler } from "sst/node/api";
import { Datasets } from "@lta-datasets-updater/core/datasets";

export const updater = ApiHandler(async (event, context) => {
  await Datasets.updater();

  return {
    statusCode: 200,
    body: JSON.stringify("Data has been successfully updated"),
  };
});
