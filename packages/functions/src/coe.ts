import { ApiHandler } from "sst/node/api";
import db from "../../config/db";

export const result = ApiHandler(async (_evt) => {
  const result = await db
    .collection("coe")
    .find({ month: "2023-12" })
    .toArray();

  console.log(`COE result:`, result);

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
});
