import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getLatestMonth } from "../getLatestMonth";
import db from "@api/config/db";

vi.mock("@api/config/db", () => ({
  default: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
  },
}));

describe("getLatestMonth", () => {
  const mockTable = { month: "month" } as any;
  
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return the latest month from the table", async () => {
    const mockMonth = "2023-12";
    
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockResolvedValue([{ month: mockMonth }]),
    } as any);

    const result = await getLatestMonth(mockTable);
    
    expect(db.select).toHaveBeenCalled();
    expect(result).toBe(mockMonth);
  });

  it("should return null when no data is found", async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockResolvedValue([{ month: null }]),
    } as any);
    
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    
    const result = await getLatestMonth(mockTable);
    
    expect(consoleSpy).toHaveBeenCalled();
    expect(result).toBeNull();
    
    consoleSpy.mockRestore();
  });

  it("should handle errors properly", async () => {
    const mockError = new Error("Database error");
    
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockRejectedValue(mockError),
    } as any);
    
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    await expect(getLatestMonth(mockTable)).rejects.toThrow(mockError);
    
    expect(consoleSpy).toHaveBeenCalledWith(mockError);
    
    consoleSpy.mockRestore();
  });
});