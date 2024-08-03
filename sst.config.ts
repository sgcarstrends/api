/// <reference path="./.sst/platform/config.d.ts" />

const DOMAIN_NAME = "sgcarstrends.com";

const CORS = {
  dev: {
    allowOrigins: ["*"],
  },
  staging: {
    allowOrigins: ["*"],
  },
  prod: {
    allowOrigins: [
      `https://${DOMAIN_NAME}`,
      // TODO: To be removed
      "https://sgmotortrends.com",
    ],
    maxAge: "1 day",
  },
};

const DOMAIN = {
  dev: { name: `dev.api.${DOMAIN_NAME}` },
  staging: { name: `staging.api.${DOMAIN_NAME}` },
  prod: { name: `api.${DOMAIN_NAME}` },
};

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
        cloudflare: true,
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
      domain: {
        ...DOMAIN[$app.stage],
        dns: sst.cloudflare.dns(),
      },
      routes: {
        "/*": api.url,
      },
    });

    return {
      api: api.url,
    };
  },
});
