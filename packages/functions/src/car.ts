import { ApiHandler, useQueryParams } from "sst/node/api";
import { Car } from "@lta-datasets-updater/core/car";
import db from "../../config/db";
import { FUEL_TYPE } from "@lta-datasets-updater/core/config";

export const list = ApiHandler(async (_evt) => {
  const params = useQueryParams();
  const cars = await Car.list();

  const filteredCars =
    Object.keys(params).length > 0
      ? cars.filter(({ month }) => {
          const [year] = month.split("-");

          return year === params.year;
        })
      : cars;

  return {
    statusCode: 200,
    body: JSON.stringify(filteredCars),
  };
});

export const electric = ApiHandler(async (_evt) => {
  const electricCars = await db
    .collection("cars")
    .find({ fuel_type: FUEL_TYPE.ELECTRIC })
    .toArray();

  return {
    statusCode: 200,
    body: JSON.stringify(electricCars),
  };
});
