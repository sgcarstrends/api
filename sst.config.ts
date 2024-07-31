/// <reference path="./.sst/platform/config.d.ts" />

const DOMAIN_NAME = "sgmotortrends.com";

const CORS = {
  dev: {
    allowOrigins: ["*"],
  },
  staging: {
    allowOrigins: ["*"],
  },
  prod: {
    allowOrigins: [`https://${DOMAIN_NAME}`],
    maxAge: "1 day",
  },
};

const DOMAIN = {
  dev: `dev.api.${DOMAIN_NAME}`,
  staging: `staging.api.${DOMAIN_NAME}`,
  prod: `api.${DOMAIN_NAME}`,
} as const;

export default $config({
  app(input) {
    return {
      name: "lta-cars-dataset",
      removal: input?.stage === "prod" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "ap-southeast-1",
        },
      },
    };
  },
  async run() {
    const api = new sst.aws.Function("Api", {
      architecture: "arm64",
      description: "API for LTA Cars Datasets",
      environment: {
        MONGODB_URI: process.env.MONGODB_URI,
      },
      handler: "src/index.handler",
      url: {
        cors: CORS[$app.stage],
      },
    });

    new sst.aws.Router("LTACarsDataset", {
      domain: DOMAIN[$app.stage],
      routes: {
        "/*": api.url,
      },
    });

    return {
      api: api.url,
    };
  },
});
