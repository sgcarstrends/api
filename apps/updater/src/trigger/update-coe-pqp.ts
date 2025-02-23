import { schedulers } from "@/config/schedulers";
import { updateCOEPQP } from "@/lib/updateCOEPQP";
import { createUpdateTask } from "@/utils/createUpdateTask";

export const updateCOEPQPTask = createUpdateTask(
  "coe-pqp",
  schedulers.coe,
  updateCOEPQP,
);
