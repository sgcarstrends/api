import { Ratelimit } from "@upstash/ratelimit";
import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { bearerAuth } from "hono/bearer-auth";
import { compress } from "hono/compress";
import { showRoutes } from "hono/dev";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { Resource } from "sst";
import redis from "./config/redis";
import { getCarsByFuelType } from "./lib/getCarsByFuelType";
import { FuelType } from "./types";
import v1 from "./v1";

const ratelimit = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(10, "10 s"),
	analytics: true,
});

const app = new Hono();

const rateLimitMiddleware = async (c, next) => {
	const ip = c.req.header("x-forwarded-for") || "unknown";
	const { success, limit, remaining, reset } = await ratelimit.limit(ip);

	c.header("X-RateLimit-Limit", limit.toString());
	c.header("X-RateLimit-Remaining", remaining.toString());
	c.header("X-RateLimit-Reset", reset.toString());

	if (!success) {
		return c.text("Rate limit exceeded", 429);
	}

	await next();
};

app.use(bearerAuth({ token: Resource.SG_CARS_TRENDS_API_TOKEN.value }));
app.use(logger());
app.use(compress());
app.use(prettyJSON());
if (process.env.FEATURE_FLAG_RATE_LIMIT) {
	app.use("*", rateLimitMiddleware);
}
// app.use("*", (c, next) => {
//   c.res.headers.append("Cache-Control", "public, max-age=86400");
//   return next();
// });

app.onError((err, c) => {
	if (err instanceof HTTPException) {
		return c.json({ status: err.status, message: err.message }, 500);
	}
});

app.notFound((c) =>
	c.json({ message: `Resource not found: ${c.req.path}` }, 404),
);

app.get("/", async (c) => {
	const month = c.req.query("month");
	return c.json(await getCarsByFuelType(FuelType.Petrol, month));
});

app.route("/v1", v1);

showRoutes(app);

export const handler = handle(app);
