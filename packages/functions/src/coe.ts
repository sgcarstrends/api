import { ApiHandler } from "sst/node/api";
import { COE } from "@lta-datasets-updater/core/coe";

export const updater = ApiHandler(async (_evt) => {
  const { message } = await COE.updater();

  return {
    statusCode: 200,
    body: JSON.stringify({ status: 200, message }),
  };
});
