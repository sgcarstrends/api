import db from "../config/db";
import type { Collection } from "../types";

export const getLatestMonth = async (
  collection: typeof Collection,
): Promise<string> => {
  const latestMonthFromDb = await db
    .collection(collection)
    .aggregate([
      {
        $group: {
          _id: null,
          latestMonth: { $max: "$month" },
        },
      },
      { $sort: { month: -1 } },
      { $limit: 1 },
    ])
    .next();

  return latestMonthFromDb.latestMonth;
};
