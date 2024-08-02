import { Hono } from "hono";
import { getCarsByFuelType } from "../lib/getCarsByFuelType";
import cars from "./routes/cars";
import coe from "./routes/coe";
import make from "./routes/make";
import months from "./routes/months";
import { FUEL_TYPE } from "../types";

const v1 = new Hono();

v1.get("/", async (c) => {
  const month = c.req.query("month");
  return c.json(await getCarsByFuelType(FUEL_TYPE.PETROL, month));
});

v1.route("/cars", cars);
v1.route("/coe", coe);
v1.route("/make", make);
v1.route("/months", months);

export default v1;
