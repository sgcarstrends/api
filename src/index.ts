import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { compress } from "hono/compress";
import { showRoutes } from "hono/dev";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { getCarsByFuelType } from "./lib/getCarsByFuelType";
import cars from "./routes/cars";
import coe from "./routes/coe";
import make from "./routes/make";
import months from "./routes/months";
import { FUEL_TYPE } from "./types";

const app = new Hono();

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

app.route("/cars", cars);
app.route("/coe", coe);
app.route("/make", make);
app.route("/months", months);

showRoutes(app);

export const handler = handle(app);
