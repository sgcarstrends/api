import { Ratelimit } from "@upstash/ratelimit";
import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { compress } from "hono/compress";
import { showRoutes } from "hono/dev";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import packageJson from "../package.json" assert { type: "json" };
import redis from "./config/redis";
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
    // Use the original exception's status code
    return c.json(
      {
        status: err.status,
        message: err.message,
      },
      err.status,
    );
  }

  // Fallback for unexpected errors
  console.error(err);
  return c.json(
    {
      status: 500,
      message: "Internal Server Error",
    },
    500,
  );
});

app.notFound((c) =>
  c.json({ message: `Resource not found: ${c.req.path}` }, 404),
);

app.get("/", async (c) =>
  c.json({
    version: packageJson.version,
    timestamp: new Date().toISOString(),
    message: "Welcome to the SG Cars Trends API",
  }),
);

app.route("/v1", v1);

showRoutes(app);

export const handler = handle(app);
