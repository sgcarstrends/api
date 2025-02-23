import { format, subMonths } from "date-fns";

const getTrailingTwelveMonths = (dateString: string) => {
  const targetDate = new Date(`${dateString}-01`);
  return format(subMonths(targetDate, 11), "yyyy-MM");
};

export default getTrailingTwelveMonths;
