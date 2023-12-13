import { Cron, StackContext } from "sst/constructs";

const cronScheduler = `0/60 12-18 ? * MON-FRI *`;

export const scheduler = ({ stack }: StackContext) => {
  new Cron(stack, "cron", {
    schedule: `cron(${cronScheduler})`,
    job: "packages/functions/src/datasets.updater",
    enabled: stack.stage === "prod",
  });
};
