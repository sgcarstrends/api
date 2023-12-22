import { Config, StackContext, Api, Cron } from "sst/constructs";

const CUSTOM_DOMAINS: Record<string, any> = {
  dev: {
    domainName: "dev.api.singapore-ev-trends.ruchern.xyz",
    hostedZone: "ruchern.xyz",
  },
  prod: {
    domainName: "api.singapore-ev-trends.ruchern.xyz",
    hostedZone: "ruchern.xyz",
  },
};

export const api = ({ stack }: StackContext) => {
  const MONGODB_URI = new Config.Secret(stack, "MONGODB_URI");

  const api = new Api(stack, "api", {
    defaults: {
      throttle: { burst: 5, rate: 50 },
      function: {
        bind: [MONGODB_URI],
      },
    },
    customDomain: CUSTOM_DOMAINS[stack.stage],
    cors: {
      allowOrigins: ["https://singapore-ev-trends.ruchern.xyz"],
    },
    routes: {
      "GET /": "packages/functions/src/cars.electric",
      "GET /brands": "packages/functions/src/brands.list",
      "GET /cars/electric": "packages/functions/src/cars.electric",
      "GET /cars/petrol": "packages/functions/src/cars.petrol",
      "GET /coe": "packages/functions/src/coe.latest",
      "GET /updater/cars": "packages/functions/src/updater.cars",
      "GET /updater/coe": "packages/functions/src/updater.coe",
    },
  });

  new Cron(stack, "cars-cron", {
    schedule: "cron(0/60 0-10 ? * MON-FRI *)",
    job: {
      function: {
        handler: "packages/functions/src/updater.cars",
        bind: [MONGODB_URI],
      },
    },
    enabled: stack.stage === "prod",
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
};
