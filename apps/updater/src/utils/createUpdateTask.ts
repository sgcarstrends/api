import redis from "@/config/redis";
import type { ScheduleOptions, SchedulerName } from "@/config/schedulers";
import type { UpdaterResult } from "@/lib/updater";
import { AbortTaskRunError, logger, schedules } from "@trigger.dev/sdk/v3";

type UpdaterFunction = () => Promise<UpdaterResult>;

export const createUpdateTask = (
  id: SchedulerName,
  cron: ScheduleOptions,
  updaterFn: UpdaterFunction,
) => {
  return schedules.task({
    id,
    cron,
    run: async (payload: any, { ctx }) => {
      logger.log("Starting updater task", { payload, ctx });

      try {
        const response = await updaterFn();

        logger.log("Update completed", {
          recordsProcessed: response.recordsProcessed,
          message: response.message,
          timestamp: response.timestamp,
        });

        return response;
      } catch (error) {
        logger.error("Update task failed", { error });
        throw new AbortTaskRunError(error);
      }
    },
    onSuccess: async () => {
      const now = Date.now();
      await redis.set(`lastUpdated:${id.toLowerCase()}`, now);
      logger.log("Last updated", { timestamp: now });
    },
    onFailure: async (payload, error, { ctx }) => {
      logger.error("Update Task Permanent Failure", { error, payload, ctx });
      // TODO Send the error to Sentry
    },
  });
};
