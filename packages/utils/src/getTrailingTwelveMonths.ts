import { format, subMonths } from "date-fns";

/**
 * Gets the month from 12 months before the given date string
 *
 * @param dateString - Date string in the format "yyyy-MM"
 * @returns Date string 12 months prior in the format "yyyy-MM"
 */
export const getTrailingTwelveMonths = (dateString: string): string => {
  const targetDate = new Date(`${dateString}-01`);
  return format(subMonths(targetDate, 11), "yyyy-MM");
};
