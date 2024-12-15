/// <reference path="./.sst/platform/config.d.ts" />

import type { Stage } from "@/types";

const DOMAIN_NAME = "sgcarstrends.com";

const CORS: Record<Stage, unknown> = {
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

const DOMAIN: Record<Stage, unknown> = {
	dev: { name: `dev.api.${DOMAIN_NAME}` },
	staging: { name: `staging.api.${DOMAIN_NAME}` },
	prod: { name: `api.${DOMAIN_NAME}` },
};

// const INVALIDATION = {
//   dev: false,
//   staging: true,
//   prod: true,
// };

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
		const MONGODB_URI = new sst.Secret("MONGODB_URI", process.env.MONGODB_URI);
		const SG_CARS_TRENDS_API_TOKEN = new sst.Secret(
			"SG_CARS_TRENDS_API_TOKEN",
			process.env.SG_CARS_TRENDS_API_TOKEN,
		);
		const UPSTASH_REDIS_REST_TOKEN = new sst.Secret(
			"UPSTASH_REDIS_REST_TOKEN",
			process.env.UPSTASH_REDIS_REST_TOKEN,
		);
		const UPSTASH_REDIS_REST_URL = new sst.Secret(
			"UPSTASH_REDIS_REST_URL",
			process.env.UPSTASH_REDIS_REST_URL,
		);

		const { url } = new sst.aws.Function("Hono", {
			link: [
				MONGODB_URI,
				SG_CARS_TRENDS_API_TOKEN,
				UPSTASH_REDIS_REST_TOKEN,
				UPSTASH_REDIS_REST_URL,
			],
			architecture: "arm64",
			memory: "10240 MB",
			description: "API for SG Cars Trends",
			environment: {
				FEATURE_FLAG_RATE_LIMIT: process.env.FEATURE_FLAG_RATE_LIMIT ?? "",
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
			// TODO: Will enable later
			// invalidation: INVALIDATION[$app.stage],
			routes: {
				"/*": url,
			},
		});
	},
});
