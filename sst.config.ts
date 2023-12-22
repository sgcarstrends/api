import { SSTConfig } from "sst";
import { api } from "./stacks/ApiStack";

export default {
  config(_input) {
    return {
      name: "lta-cars-dataset",
      region: "ap-southeast-1",
    };
  },
  stacks(app) {
    app.stack(api);
  },
} satisfies SSTConfig;
