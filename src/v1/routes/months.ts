import { Hono } from "hono";
import { getLatestMonth } from "../../lib/getLatestMonth";

const app = new Hono();

app.get("/latest", async (c) => {
  const collection = c.req.query("collection");
  const dbCollections = ["cars", "coe"];

  const latestMonthObj = {};

  if (collection) {
    latestMonthObj[collection] = await getLatestMonth(collection);
  } else {
    for (const dbCollection of dbCollections) {
      latestMonthObj[dbCollection] = await getLatestMonth(dbCollection);
    }
  }

  return c.json(latestMonthObj);
});

export default app;
