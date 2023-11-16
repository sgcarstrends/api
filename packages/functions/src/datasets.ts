import { ApiHandler } from "sst/node/api";
import { FUEL_TYPE } from "@lta-datasets-updater/core/config";
import db from "../../config/db";

export const handler = ApiHandler(async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const cars = await db
    .collection("cars")
    .find({ fuel_type: FUEL_TYPE.ELECTRIC })
    .toArray();

  return {
    statusCode: 200,
    body: JSON.stringify(cars),
  };
});
