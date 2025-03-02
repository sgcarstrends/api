import { getTrailingTwelveMonths } from "@sgcarstrends/utils";
import { describe, expect, it } from "vitest";

describe("getTrailingTwelveMonths", () => {
  // Basic functionality tests
  describe("Standard date inputs", () => {
    it("should return correct trailing 12 months start date for mid-year input", () => {
      expect(getTrailingTwelveMonths("2023-07")).toBe("2022-08");
    });

    it("should return correct trailing 12 months start date for year-end", () => {
      expect(getTrailingTwelveMonths("2023-12")).toBe("2023-01");
    });

    it("should return correct trailing 12 months start date for year-start", () => {
      expect(getTrailingTwelveMonths("2023-01")).toBe("2022-02");
    });
  });

  // Edge case tests
  describe("Edge cases", () => {
    it("should handle single-digit month inputs", () => {
      expect(getTrailingTwelveMonths("2023-03")).toBe("2022-04");
    });

    it("should handle year transitions correctly", () => {
      expect(getTrailingTwelveMonths("2024-01")).toBe("2023-02");
    });
  });

  // Leap year considerations
  describe("Leap year handling", () => {
    it("should work correctly across leap year boundaries", () => {
      expect(getTrailingTwelveMonths("2024-02")).toBe("2023-03");
    });
  });
});
