import { ApiHandler, useQueryParam, useQueryParams } from "sst/node/api";
import { COE } from "@lta-cars-dataset/core/coe";
import { createResponse } from "./utils/createResponse";

export const list = ApiHandler(async (_evt) => {
  const result = await COE.list();
  return createResponse(result);
});

export const byMonth = ApiHandler(async (_evt) => {
  const month = useQueryParam("month");
  const coeResult = await COE.getCOEResultByMonth(month);

  return createResponse(coeResult);
});

export const latest = ApiHandler(async (_evt) => {
  const result = await COE.getCOEResultByMonth();
  return createResponse(result);
});
