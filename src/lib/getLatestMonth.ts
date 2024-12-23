import db from "@/config/db";
import { desc, max } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

export const getLatestMonth = async <T extends PgTable>(
  table: T,
): Promise<string> => {
  const key = "month";

  try {
    const results = await db
      .select({ month: max(table[key]) })
      .from(table)
      .orderBy(desc(max(table[key])))
      .limit(1);

    if (!results) {
      throw new Error(`No data found for table: ${table}`);
    }

    return results[0].month;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
