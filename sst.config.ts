import { SSTConfig } from "sst";
import { api } from "./stacks/MyStack";

export default {
  config(_input) {
    return {
      name: "lta-datasets-updater",
      region: "ap-southeast-1",
    };
  },
  stacks(app) {
    app.stack(api);
  },
} satisfies SSTConfig;
