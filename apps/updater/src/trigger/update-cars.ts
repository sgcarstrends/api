import { schedulers } from "@/config/schedulers";
import { updateCars } from "@/lib/updateCars";
import { createUpdateTask } from "@/utils/createUpdateTask";

export const updateCarsTask = createUpdateTask(
  "cars",
  schedulers.cars,
  updateCars,
);
