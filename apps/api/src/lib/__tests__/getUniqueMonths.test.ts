import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getUniqueMonths } from "../getUniqueMonths";
import db from "@api/config/db";
import redis from "@api/config/redis";
import { getTableName } from "drizzle-orm";

vi.mock("@api/config/db", () => ({
  default: {
    selectDistinct: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
  },
}));

vi.mock("@api/config/redis", () => ({
  default: {
    smembers: vi.fn(),
    sadd: vi.fn().mockResolvedValue(true),
    expire: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock("drizzle-orm", () => ({
  desc: vi.fn(),
  getTableName: vi.fn(),
}));

describe("getUniqueMonths", () => {
  const mockTable = { month: "month" } as any;
  const mockTableName = "test_table";
  
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getTableName).mockReturnValue(mockTableName);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return cached months if available", async () => {
    const cachedMonths = ["2023-12", "2023-11", "2023-10"];
    vi.mocked(redis.smembers).mockResolvedValue(cachedMonths);
    
    const result = await getUniqueMonths(mockTable);
    
    expect(redis.smembers).toHaveBeenCalledWith(`${mockTableName}:months`);
    expect(db.selectDistinct).not.toHaveBeenCalled();
    expect(result).toEqual(cachedMonths);
  });

  it("should fetch months from database when cache is empty", async () => {
    const dbMonths = [
      { month: "2023-12" },
      { month: "2023-11" },
      { month: "2023-10" },
    ];
    const expectedMonths = ["2023-12", "2023-11", "2023-10"];
    
    vi.mocked(redis.smembers).mockResolvedValue([]);
    vi.mocked(db.selectDistinct).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue(dbMonths),
    } as any);
    
    const result = await getUniqueMonths(mockTable);
    
    expect(redis.smembers).toHaveBeenCalledWith(`${mockTableName}:months`);
    expect(db.selectDistinct).toHaveBeenCalled();
    expect(redis.sadd).toHaveBeenCalledWith(`${mockTableName}:months`, expectedMonths);
    expect(redis.expire).toHaveBeenCalled();
    expect(result).toEqual(expectedMonths);
  });

  it("should handle custom key parameter", async () => {
    const customKey = "custom_month";
    const customTable = { [customKey]: customKey } as any;
    
    vi.mocked(redis.smembers).mockResolvedValue([]);
    vi.mocked(db.selectDistinct).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([]),
    } as any);
    
    await getUniqueMonths(customTable, customKey);
    
    expect(db.selectDistinct).toHaveBeenCalled();
  });

  it("should handle errors properly", async () => {
    const mockError = new Error("Redis error");
    
    vi.mocked(redis.smembers).mockRejectedValue(mockError);
    
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    await expect(getUniqueMonths(mockTable)).rejects.toThrow(mockError);
    
    expect(consoleSpy).toHaveBeenCalledWith(mockError);
    
    consoleSpy.mockRestore();
  });

  it("should sort months in descending order", async () => {
    const unsortedMonths = ["2023-10", "2023-12", "2023-11"];
    const expectedSortedMonths = ["2023-12", "2023-11", "2023-10"];
    
    vi.mocked(redis.smembers).mockResolvedValue(unsortedMonths);
    
    const result = await getUniqueMonths(mockTable);
    
    expect(result).toEqual(expectedSortedMonths);
  });
});