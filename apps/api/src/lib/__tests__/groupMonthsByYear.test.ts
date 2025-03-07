import { describe, expect, it } from "vitest";
import { groupMonthsByYear } from "../groupMonthsByYear";

describe("groupMonthsByYear", () => {
  it("should group months by year", () => {
    const months = ["2022-01", "2022-12", "2023-01", "2023-02"];

    expect(Object.keys(groupMonthsByYear(months))).toHaveLength(2);
    expect(groupMonthsByYear(months)).toEqual([
      { year: "2023", months: ["02", "01"] },
      { year: "2022", months: ["12", "01"] },
    ]);
  });

  it("should handle empty array", () => {
    const months: string[] = [];

    const result = groupMonthsByYear(months);

    expect(Object.keys(result)).toHaveLength(0);
  });

  it("should handle single year", () => {
    const months = ["2023-01", "2023-02", "2023-03"];

    expect(Object.keys(groupMonthsByYear(months))).toHaveLength(1);
    expect(groupMonthsByYear(months)).toEqual([
      {
        year: "2023",
        months: ["03", "02", "01"],
      },
    ]);
  });
});
