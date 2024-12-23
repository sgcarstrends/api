export const groupMonthsByYear = (
  months: string[],
): { year: string; months: string[] }[] => {
  const groupedData: Record<string, string[]> = {};

  for (const item of months) {
    const [year, month] = item.split("-");
    if (!groupedData[year]) {
      groupedData[year] = [];
    }
    groupedData[year].push(month);
  }

  return Object.entries(groupedData)
    .map(([year, months]) => {
      // Sort by latest
      const sortedMonths = months.toSorted((a, b) => b.localeCompare(a));
      return { year, months: sortedMonths };
    })
    .sort((a, b) => b.year.localeCompare(a.year));
};
