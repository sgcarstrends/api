import { SSTConfig } from "sst";
import { api } from "./stacks/MyStack";
import { scheduler } from "./stacks/Scheduler";

export default {
  config(_input) {
    return {
      name: "lta-datasets-updater",
      region: "ap-southeast-1",
    };
  },
  stacks(app) {
    app.stack(api);
    app.stack(scheduler);
  },
} satisfies SSTConfig;
