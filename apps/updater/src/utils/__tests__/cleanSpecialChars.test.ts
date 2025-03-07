import { cleanSpecialChars } from "@sgcarstrends/utils";
import { describe, expect, it } from "vitest";

describe("cleanSpecialChars", () => {
  it("should handle trailing periods", () => {
    expect(cleanSpecialChars("B.M.W.", { separator: "." })).toBe("BMW");
  });

  it("should handle strings with slashes and spaces", () => {
    expect(
      cleanSpecialChars("Coupe/ Convertible", {
        separator: "/",
        joinSeparator: "/",
      }),
    ).toBe("Coupe/Convertible");
  });

  it("should return an empty string for an empty input", () => {
    expect(cleanSpecialChars("")).toBe("");
  });
});
