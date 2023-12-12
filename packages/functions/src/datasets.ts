import { ApiHandler } from "sst/node/api";
import { Datasets } from "@lta-datasets-updater/core/datasets";

export const updater = ApiHandler(async (_evt, context) => {
  const { message } = await Datasets.updater();

  return {
    statusCode: 200,
    body: JSON.stringify({ message }),
  };
});
