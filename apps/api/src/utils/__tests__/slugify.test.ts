import { describe, expect, it } from "vitest";
import { deslugify, slugify } from "@sgcarstrends/utils";

describe("slugify", () => {
  it("should convert basic string to slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("should handle multiple spaces and special chars", () => {
    expect(slugify("My  Example!!!  URL")).toBe("my-example-url");
  });

  it("should handle numbers correctly", () => {
    expect(slugify("Article 123")).toBe("article-123");
  });

  it("should trim leading and trailing spaces", () => {
    expect(slugify("  Trim Spaces  ")).toBe("trim-spaces");
  });

  it("should handle consecutive special characters", () => {
    expect(slugify("Multiple!!!Special***Chars")).toBe(
      "multiple-special-chars",
    );
  });

  it("should handle empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("should maintain correct order of words", () => {
    expect(slugify("First Second Third")).toBe("first-second-third");
  });
});

describe("deslugify", () => {
  it("should convert basic slug to readable string", () => {
    expect(deslugify("hello-world")).toBe("Hello World");
  });

  it("should handle numbers in slug", () => {
    expect(deslugify("article-123")).toBe("Article 123");
  });

  it("should handle single word", () => {
    expect(deslugify("hello")).toBe("Hello");
  });

  it("should handle empty string", () => {
    expect(deslugify("")).toBe("");
  });

  it("should handle multiple consecutive hyphens", () => {
    expect(deslugify("multiple--hyphens")).toBe("Multiple Hyphens");
  });

  it("should maintain correct capitalization for each word", () => {
    expect(deslugify("first-second-third")).toBe("First Second Third");
  });
});
