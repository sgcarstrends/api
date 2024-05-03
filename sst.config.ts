/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "lta-cars-dataset",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "cloudflare",
    };
  },
  async run() {
    const database = new sst.cloudflare.D1("Database");
    const hono = new sst.cloudflare.Worker("Api", {
      handler: "src/index.ts",
      link: [database],
      url: true,
    });

    return {
      api: hono.url,
    };
  },
});
