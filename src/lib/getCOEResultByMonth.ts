import db from "../config/db";
import type { COEResult } from "../types";

export const getCOEResultByMonth = async (month?: string) => {
  let selectedMonth = month;

  if (!month) {
    const latestMonthFromDb = await db
      .collection<COEResult>("coe")
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

    selectedMonth = latestMonthFromDb.latestMonth;
  }

  return db
    .collection<COEResult>("coe")
    .find({ month: selectedMonth })
    .sort({ bidding_no: -1, vehicle_class: 1 })
    .toArray();
};
