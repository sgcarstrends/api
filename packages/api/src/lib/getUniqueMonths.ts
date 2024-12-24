import { CACHE_TTL } from "@/config";
import db from "@/config/db";
import redis from "@/config/redis";
import { desc, getTableName } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

export const getUniqueMonths = async <T extends PgTable>(
  table: T,
  key = "month"
) => {
  const tableName = getTableName(table);
  const CACHE_KEY = `${tableName}:months`;

  try {
    let months = await redis.smembers(CACHE_KEY);

    if (months.length === 0) {
      const results = await db
        .selectDistinct({ month: table[key] })
        .from(table)
        .orderBy(desc(table[key]));

      months = results.map(({ month }) => month);

      await redis.sadd(CACHE_KEY, ...months);
      await redis.expire(CACHE_KEY, CACHE_TTL);
    }

    return months.sort((a, b) => b.localeCompare(a));
  } catch (e) {
    console.error(e);
    throw e;
  }
};
