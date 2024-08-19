export const groupMonthsByYear = (
  months: string[],
): { year: string; months: string[] }[] => {
  const groupedData: Record<string, string[]> = {};

  months.forEach((item) => {
    const [year, month] = item.split("-");
    if (!groupedData[year]) {
      groupedData[year] = [];
    }
    groupedData[year].push(month);
  });

  return Object.entries(groupedData)
    .map(([year, months]) => ({
      year,
      months: months.sort((a, b) => b.localeCompare(a)),
    }))
    .sort((a, b) => b.year.localeCompare(a.year));
};
