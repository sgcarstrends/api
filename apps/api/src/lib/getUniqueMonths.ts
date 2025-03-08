import { CACHE_TTL } from "@api/config";
import db from "@api/config/db";
import redis from "@api/config/redis";
import { desc, getTableName } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

export const getUniqueMonths = async <T extends PgTable>(
  table: T,
  key = "month",
) => {
  const tableName = getTableName(table);
  const CACHE_KEY = `${tableName}:months`;

  try {
    let months = await redis.zrange<string[]>(CACHE_KEY, 0, -1, { rev: true });
    if (months.length === 0) {
      const results = await db
        .selectDistinct({ month: table[key] })
        .from(table)
        .orderBy(desc(table[key]));

      months = results.map(({ month }) => month);

      let score = months.length;
      for (const month of months) {
        await redis.zadd(CACHE_KEY, { score, member: month });
        score--;
      }
      await redis.expire(CACHE_KEY, CACHE_TTL);
    }

    return months;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
