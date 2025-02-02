import db from "@/config/db";
import { max } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

export const getLatestMonth = async <T extends PgTable>(
  table: T,
): Promise<string> => {
  const key = "month";

  try {
    const [{ month }] = await db.select({ month: max(table[key]) }).from(table);

    if (!month) {
      console.warn(`No data found for table: ${table}`);
      return null;
    }

    return month;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
