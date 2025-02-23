import { schedulers } from "@/config/schedulers";
import { updateCOE } from "@/lib/updateCOE";
import { createUpdateTask } from "@/utils/createUpdateTask";

export const updateCOETask = createUpdateTask("coe", schedulers.coe, updateCOE);
