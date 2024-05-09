/// <reference path="./.sst/platform/config.d.ts" />

const DOMAIN = {
  development: "dev.api.sgmotortrends.com",
  production: "api.sgmotortrends.com",
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
    const hono = new sst.aws.Function("Hono", {
      architecture: "arm64",
      description: "Hono API for LTA Datasets",
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

    return {
      api: hono.url,
    };
  },
});
