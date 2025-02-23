import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "proj_hdsezzyvvwvwzpyzlrat",
  runtime: "node",
  logLevel: "log",
  maxDuration: 60,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 6000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["./src/trigger"],
});
