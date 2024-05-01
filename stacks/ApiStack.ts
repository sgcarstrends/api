// import {
//   Config,
//   StackContext,
//   Api,
//   Cron,
//   ApiDomainProps,
//   ApiCorsProps,
// } from "sst/constructs";
//
// const DOMAIN: string = "sgmotortrends.com";
// const SITE_URL: string = `https://${DOMAIN}`;
// const DEV_API_DOMAIN: string = `dev.api.${DOMAIN}`;
// const PROD_API_DOMAIN: string = `api.${DOMAIN}`;
//
// const CUSTOM_DOMAINS: Record<string, ApiDomainProps> = {
//   dev: {
//     domainName: DEV_API_DOMAIN,
//     hostedZone: DOMAIN,
//   },
//   prod: {
//     domainName: PROD_API_DOMAIN,
//     hostedZone: DOMAIN,
//   },
// };
//
// const CORS_SETTINGS: Record<string, ApiCorsProps> = {
//   dev: {
//     allowMethods: ["GET"],
//     allowOrigins: ["*"],
//   },
//   prod: {
//     allowMethods: ["GET"],
//     allowOrigins: [SITE_URL],
//   },
// };
//
// export const api = ({ stack }: StackContext) => {
//   const MONGODB_URI = new Config.Secret(stack, "MONGODB_URI");
//
//   const api = new Api(stack, "api", {
//     defaults: {
//       throttle: { burst: 5, rate: 50 },
//       function: {
//         bind: [MONGODB_URI],
//       },
//     },
//     customDomain: CUSTOM_DOMAINS[stack.stage],
//     cors: {
//       ...CORS_SETTINGS[stack.stage],
//     },
//     routes: {
//       "GET /": "packages/functions/src/cars.electric",
//       "GET /cars/electric": "packages/functions/src/cars.electric",
//       "GET /cars/petrol": "packages/functions/src/cars.petrol",
//       "GET /coe": "packages/functions/src/coe.list",
//       "GET /coe/latest": "packages/functions/src/coe.latest",
//       "GET /updater/cars": "packages/functions/src/updater.cars",
//       "GET /updater/coe": "packages/functions/src/updater.coe",
//       "GET /vehicle-make": "packages/functions/src/vehicle-make.list",
//     },
//   });
//
//   new Cron(stack, "cars-cron", {
//     schedule: "cron(0/60 0-10 ? * MON-FRI *)",
//     job: {
//       function: {
//         handler: "packages/functions/src/updater.cars",
//         bind: [MONGODB_URI],
//       },
//     },
//     enabled: stack.stage === "prod",
//   });
//
//   new Cron(stack, "coe-cron", {
//     schedule: "cron(0/60 0-10 ? * MON-FRI *)",
//     job: {
//       function: {
//         handler: "packages/functions/src/updater.coe",
//         bind: [MONGODB_URI],
//       },
//     },
//     enabled: stack.stage === "prod",
//   });
//
//   new Cron(stack, "coe-first-bidding-cron", {
//     schedule: "cron(0/10 8-10 ? * 4#1 *)",
//     job: {
//       function: {
//         handler: "packages/functions/src/updater.coe",
//         bind: [MONGODB_URI],
//       },
//     },
//     enabled: stack.stage === "prod",
//   });
//
//   new Cron(stack, "coe-second-bidding-cron", {
//     schedule: "cron(0/10 8-10 ? * 4#3 *)",
//     job: {
//       function: {
//         handler: "packages/functions/src/updater.coe",
//         bind: [MONGODB_URI],
//       },
//     },
//     enabled: stack.stage === "prod",
//   });
//
//   stack.addOutputs({
//     ApiEndpoint: api.url,
//   });
// };
