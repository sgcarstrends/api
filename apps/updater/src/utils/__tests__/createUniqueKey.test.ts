import { createUniqueKey } from "@sgcarstrends/utils";
import { describe, expect, it } from "vitest";

describe("createUniqueKey", () => {
  it("should create a unique key from a single field", () => {
    const item = { id: "123", name: "John" };
    const keyFields = ["id"];
    expect(createUniqueKey(item, keyFields)).toBe("123");
  });

  it("should create a unique key from multiple fields", () => {
    const item = { id: "123", name: "John", age: 30 };
    const keyFields = ["id", "name"];
    expect(createUniqueKey(item, keyFields)).toBe("123-John");
  });

  it("should handle missing fields", () => {
    const item = { id: "123", name: "John" };
    const keyFields = ["id", "age"];
    expect(createUniqueKey(item, keyFields)).toBe("123-");
  });

  it("should return an empty string for empty keyFields", () => {
    const item = { id: "123", name: "John" };
    const keyFields: string[] = [];
    expect(createUniqueKey(item, keyFields)).toBe("");
  });

  it("should handle non-string values", () => {
    const item = { id: 123, name: "John", isActive: true, score: 85.5 };
    const keyFields = ["id", "isActive", "score"];
    expect(createUniqueKey(item, keyFields)).toBe("123-true-85.5");
  });
});
