import { updateCOEPQP } from "@/lib/updateCOEPQP";
import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { bearerAuth } from "hono/bearer-auth";
import { showRoutes } from "hono/dev";
import { Resource } from "sst";
import { updateCOE } from "./lib/updateCOE";
import { updateCars } from "./lib/updateCars";

const app = new Hono();

app.get("/", async (c) => {
  return c.json({
    status: "ok",
    version: "1.0.0",
    endpoints: {
      "POST /process/cars": "Process cars data",
      "POST /process/coe-result": "Process COE result data",
      "POST /process/coe-pqp": "Process COE PQP data",
    },
  });
});

app.use("/process/*", bearerAuth({ token: Resource.UPDATER_API_TOKEN.value }));

app.post("/process/cars", async (c) => {
  const response = await updateCars();
  return c.json(response);
});

app.post("/process/coe-result", async (c) => {
  const response = await updateCOE();
  return c.json(response);
});

app.post("/process/coe-pqp", async (c) => {
  const response = await updateCOEPQP();
  return c.json(response);
});

showRoutes(app);

export const handler = handle(app);
