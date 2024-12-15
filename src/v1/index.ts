import { getCarsByFuelType } from "@/lib/getCarsByFuelType";
import { FuelType } from "@/types";
import { Hono } from "hono";
import cars from "./routes/cars";
import coe from "./routes/coe";
import make from "./routes/make";
import months from "./routes/months";

const v1 = new Hono();

v1.get("/", async (c) => {
	const month = c.req.query("month");
	return c.json(await getCarsByFuelType(FuelType.Petrol, month));
});

v1.route("/cars", cars);
v1.route("/coe", coe);
v1.route("/make", make);
v1.route("/months", months);

export default v1;
