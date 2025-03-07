import { schedulers } from "@updater/config/schedulers";
import { updateCOEPQP } from "@updater/lib/updateCOEPQP";
import { createUpdateTask } from "@updater/utils/createUpdateTask";

export const updateCOEPQPTask = createUpdateTask(
  "coe-pqp",
  schedulers.coe,
  updateCOEPQP,
);
