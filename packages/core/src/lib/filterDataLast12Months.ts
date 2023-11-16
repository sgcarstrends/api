import { isWithinInterval, parseISO, subMonths } from "date-fns";
import type { CarType } from "../types";

export const filterDataLast12Months = (data: CarType) => {
  const currentDate = new Date();

  const startDate = subMonths(currentDate, 12);

  const itemDate = parseISO(data.month);

  return isWithinInterval(itemDate, {
    start: startDate,
    end: currentDate,
  });
};
