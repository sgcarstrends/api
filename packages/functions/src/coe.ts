import { ApiHandler, useQueryParam } from "sst/node/api";
import { COE } from "@lta-cars-dataset/core/coe";
import { createResponse } from "./utils/createResponse";
import { WithId } from "mongodb";
import { COEResult } from "@lta-cars-dataset/core/types";

export const list = ApiHandler(async (_evt) => {
  const result: WithId<COEResult>[] = await COE.list();
  return createResponse(result);
});

export const latest = ApiHandler(async (_evt) => {
  const month = useQueryParam("month");
  const result: WithId<COEResult>[] = await COE.getCOEResultByMonth(month);
  return createResponse(result);
});
