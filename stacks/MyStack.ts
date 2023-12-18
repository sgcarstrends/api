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
      "GET /": "packages/functions/src/car.electric",
      "GET /brands": "packages/functions/src/brand.brands",
      "GET /car/electric": "packages/functions/src/car.electric",
      "GET /car/petrol": "packages/functions/src/car.petrol",
      "GET /updater": "packages/functions/src/datasets.updater",
    },
  });

  const cronScheduler = `0/60 04-10 ? * MON-FRI *`;
  new Cron(stack, "cron", {
    schedule: `cron(${cronScheduler})`,
    job: {
      function: {
        handler: "packages/functions/src/datasets.updater",
        bind: [MONGODB_URI],
      },
    },
    enabled: stack.stage === "prod",
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
};
