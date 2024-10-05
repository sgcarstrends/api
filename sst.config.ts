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
      name: "sgcarstrends-api",
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
    const api = new sst.aws.Function("Hono", {
      architecture: "arm64",
      description: "API for SG Cars Trends",
      environment: {
        MONGODB_URI: process.env.MONGODB_URI,
        SG_CARS_TRENDS_API_TOKEN: process.env.SG_CARS_TRENDS_API_TOKEN,
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
        FEATURE_FLAG_RATE_LIMIT: process.env.FEATURE_FLAG_RATE_LIMIT,
      },
      handler: "src/index.handler",
      url: {
        cors: CORS[$app.stage],
      },
    });

    new sst.aws.Router("SGCarsTrends", {
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
