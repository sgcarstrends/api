import type { COE, VehicleClass } from "@/types";

interface PQPResult {
  month: string;
  vehicle_class: string;
  pqp: number;
}

type COEByCategory = Record<VehicleClass, COE[]>;

const getPqpRates = (data: COE[]): Record<string, Record<string, number>> => {
  const groupedByCategory: COEByCategory = data.reduce((acc, coe) => {
    if (!acc[coe.vehicle_class]) {
      acc[coe.vehicle_class] = [];
    }
    acc[coe.vehicle_class].push(coe);
    return acc;
  }, {} as COEByCategory);

  const calculateMonthDifference = (currentMonth: string, bidMonth: string) => {
    const [currentYear, currentMonthNum] = currentMonth.split("-").map(Number);
    const [bidYear, bidMonthNum] = bidMonth.split("-").map(Number);
    return (currentYear - bidYear) * 12 + (currentMonthNum - bidMonthNum);
  };

  const calculatePqp = (coe: COE[]) =>
    Math.ceil(coe.reduce((sum, { premium }) => sum + premium, 0) / coe.length);

  const pqpResults: PQPResult[] = Object.entries(groupedByCategory).flatMap(
    ([vehicle_class, biddings]) => {
      const uniqueMonths = [...new Set(biddings.map(({ month }) => month))];

      return uniqueMonths
        .map((month) => {
          const relevantBids = biddings
            .filter((bid) => {
              const monthsDiff = calculateMonthDifference(month, bid.month);
              return monthsDiff >= 0 && monthsDiff <= 2;
            })
            .slice(0, 6);

          if (relevantBids.length !== 6) {
            return null;
          }

          const pqp = calculatePqp(relevantBids);

          return { month, vehicle_class, pqp };
        })
        .filter((result) => !!result);
    },
  );

  return pqpResults.reduce((acc, { month, vehicle_class, pqp }) => {
    if (!acc[month]) {
      acc[month] = {};
    }
    acc[month][vehicle_class] = pqp;
    return acc;
  }, {});
};

export default getPqpRates;
