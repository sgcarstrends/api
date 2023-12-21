import { ApiHandler } from "sst/node/api";
import { COE } from "@lta-datasets-updater/core/coe";
import { createResponse } from "./utils/createResponse";

export const latest = ApiHandler(async (_evt) => {
  const coeResult = await COE.latest();

  return createResponse(coeResult);
});
