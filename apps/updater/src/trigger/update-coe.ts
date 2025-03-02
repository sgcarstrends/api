import { schedulers } from "@updater/config/schedulers";
import { updateCOE } from "@updater/lib/updateCOE";
import { createUpdateTask } from "@updater/utils/createUpdateTask";

export const updateCOETask = createUpdateTask("coe", schedulers.coe, updateCOE);
