import db from "../config/db";

export const getLatestMonth = async (collection: string) => {
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
