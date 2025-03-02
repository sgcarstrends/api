import { schedulers } from "@updater/config/schedulers";
import { updateCars } from "@updater/lib/updateCars";
import { createUpdateTask } from "@updater/utils/createUpdateTask";

export const updateCarsTask = createUpdateTask(
  "cars",
  schedulers.cars,
  updateCars,
);
