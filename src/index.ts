import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { bearerAuth } from "hono/bearer-auth";
import { compress } from "hono/compress";
import { showRoutes } from "hono/dev";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { getCarsByFuelType } from "./lib/getCarsByFuelType";
import { FUEL_TYPE } from "./types";
import v1 from "./v1";

const app = new Hono();

app.use(bearerAuth({ token: process.env.SG_CARS_TRENDS_API_TOKEN }));
app.use(logger());
app.use(compress());
app.use(prettyJSON());
// app.use("*", (c, next) => {
//   c.res.headers.append("Cache-Control", "public, max-age=86400");
//   return next();
// });

app.get("/", async (c) => {
  const month = c.req.query("month");
  return c.json(await getCarsByFuelType(FUEL_TYPE.PETROL, month));
});

app.route("/v1", v1);

showRoutes(app);

export const handler = handle(app);
