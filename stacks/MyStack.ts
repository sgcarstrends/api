import { Config, StackContext, Api, EventBus } from "sst/constructs";

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
  const bus = new EventBus(stack, "bus", {
    defaults: {
      retries: 10,
    },
  });

  const MONGODB_URI = new Config.Secret(stack, "MONGODB_URI");

  const api = new Api(stack, "api", {
    defaults: {
      throttle: { burst: 5, rate: 50 },
      function: {
        bind: [bus, MONGODB_URI],
      },
    },
    customDomain: CUSTOM_DOMAINS[stack.stage],
    cors: {
      allowOrigins: ["https://singapore-ev-trends.ruchern.xyz"],
    },
    routes: {
      "GET /": "packages/functions/src/car.list",
      "GET /todo": "packages/functions/src/todo.list",
      "POST /todo": "packages/functions/src/todo.create",
    },
  });

  bus.subscribe("todo.created", {
    handler: "packages/functions/src/events/todo-created.handler",
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
};
