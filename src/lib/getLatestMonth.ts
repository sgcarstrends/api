import db from "@/config/db";
import { desc, max } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

export const getLatestMonth = async <T extends PgTable>(table: T) => {
  const key = "month";

  try {
    const result = await db
      .select({ month: max(table[key]) })
      .from(table)
      .orderBy(desc(max(table[key])))
      .limit(1);

    if (!result) {
      throw new Error(`No data found for table: ${table}`);
    }

    return result[0].month;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
