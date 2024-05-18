/// <reference path="./.sst/platform/config.d.ts" />

const DOMAIN_NAME = "sgmotortrends.com";

const DOMAIN = {
  development: `dev.api.${DOMAIN_NAME}`,
  staging: `staging.api.${DOMAIN_NAME}`,
  production: `api.${DOMAIN_NAME}`,
} as const;

export default $config({
  app(input) {
    return {
      name: "lta-cars-dataset",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "ap-southeast-1",
        },
      },
    };
  },
  async run() {
    const hono = new sst.aws.Function("Api", {
      architecture: "arm64",
      description: "Hono API for LTA Cars Datasets",
      environment: {
        MONGODB_URI: process.env.MONGODB_URI,
      },
      handler: "src/index.handler",
      url: {
        cors: {
          maxAge: "1 day",
        },
      },
    });

    new sst.aws.Router("LTACarsDataset", {
      domain: DOMAIN[$app.stage],
      routes: {
        "/*": hono.url,
      },
    });

    return {
      api: hono.url,
    };
  },
});
