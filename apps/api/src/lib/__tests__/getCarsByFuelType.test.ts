import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCarsByFuelType } from "../getCarsByFuelType";
import db from "@api/config/db";
import { getLatestMonth } from "../getLatestMonth";
import { getTrailingTwelveMonths } from "@sgcarstrends/utils";
import { and, asc, between, desc, eq, ilike, or } from "drizzle-orm";
import { cars } from "@sgcarstrends/schema";

// Mock the cars schema
vi.mock("@sgcarstrends/schema", () => ({
  cars: {
    month: "month",
    make: "make",
    fuel_type: "fuel_type",
  }
}));

// Mock drizzle-orm
vi.mock("drizzle-orm", () => ({
  and: vi.fn(),
  asc: vi.fn(),
  between: vi.fn(),
  desc: vi.fn(),
  eq: vi.fn(),
  ilike: vi.fn(),
  or: vi.fn(),
}));

vi.mock("@api/config/db", () => ({
  default: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(),
        })),
      })),
    })),
  },
}));

vi.mock("../getLatestMonth", () => ({
  getLatestMonth: vi.fn(),
}));

vi.mock("@sgcarstrends/utils", () => ({
  getTrailingTwelveMonths: vi.fn(),
}));

describe("getCarsByFuelType", () => {
  const mockLatestMonth = "2023-12";
  const mockTrailingMonth = "2023-01";
  
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getLatestMonth).mockResolvedValue(mockLatestMonth);
    vi.mocked(getTrailingTwelveMonths).mockReturnValue(mockTrailingMonth);
    
    // Setup db chain mocks
    const mockWhere = vi.fn().mockReturnValue({
      orderBy: vi.fn(),
    });
    
    const mockFrom = vi.fn().mockReturnValue({
      where: mockWhere,
    });
    
    vi.mocked(db.select).mockReturnValue({
      from: mockFrom,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch cars by fuel type for specified month", async () => {
    const mockFuelType = "Electric";
    const mockMonth = "2023-10";
    const mockResults = [
      { month: mockMonth, make: "Tesla", number: "100", fuel_type: "Electric" },
      { month: mockMonth, make: "Nissan", number: "50", fuel_type: "Electric" },
    ];
    
    // Setup the orderBy to return our mock results
    vi.mocked(db.select().from().where().orderBy).mockResolvedValue(mockResults);
    
    const result = await getCarsByFuelType(mockFuelType, mockMonth);
    
    expect(getLatestMonth).toHaveBeenCalled();
    expect(db.select).toHaveBeenCalled();
    expect(db.select().from).toHaveBeenCalled();
    expect(db.select().from().where).toHaveBeenCalled();
    expect(db.select().from().where().orderBy).toHaveBeenCalled();
    
    expect(result).toHaveLength(2);
    expect(result[0].number).toBe(100);
    expect(result[1].number).toBe(50);
  });

  it("should fetch cars by fuel type for trailing 12 months when month not specified", async () => {
    const mockFuelType = "Electric";
    const mockResults = [
      { month: "2023-12", make: "Tesla", number: "100", fuel_type: "Electric" },
      { month: "2023-11", make: "Tesla", number: "90", fuel_type: "Electric" },
    ];
    
    // Setup the orderBy to return our mock results
    vi.mocked(db.select().from().where().orderBy).mockResolvedValue(mockResults);
    
    const result = await getCarsByFuelType(mockFuelType);
    
    expect(getLatestMonth).toHaveBeenCalled();
    expect(getTrailingTwelveMonths).toHaveBeenCalledWith(mockLatestMonth);
    expect(db.select).toHaveBeenCalled();
    expect(db.select().from).toHaveBeenCalled();
    expect(db.select().from().where).toHaveBeenCalled();
    expect(db.select().from().where().orderBy).toHaveBeenCalled();
    
    expect(result).toHaveLength(2);
  });

  it("should aggregate results by month and make", async () => {
    const mockFuelType = "Electric";
    const mockResults = [
      { month: "2023-12", make: "Tesla", number: "50", fuel_type: "Electric" },
      { month: "2023-12", make: "Tesla", number: "50", fuel_type: "Electric" },
      { month: "2023-12", make: "Nissan", number: "30", fuel_type: "Electric" },
    ];
    
    // Setup the orderBy to return our mock results
    vi.mocked(db.select().from().where().orderBy).mockResolvedValue(mockResults);
    
    const result = await getCarsByFuelType(mockFuelType);
    
    expect(result).toHaveLength(2);
    
    const teslaResult = result.find((car) => car.make === "Tesla");
    expect(teslaResult).toBeDefined();
    expect(teslaResult?.number).toBe(100);
    
    const nissanResult = result.find((car) => car.make === "Nissan");
    expect(nissanResult).toBeDefined();
    expect(nissanResult?.number).toBe(30);
  });

  it("should handle hybrid fuel types correctly", async () => {
    const mockFuelType = "Hybrid";
    const mockResults = [];
    
    // Setup the orderBy to return our mock results
    vi.mocked(db.select().from().where().orderBy).mockResolvedValue(mockResults);
    
    await getCarsByFuelType(mockFuelType);
    
    // We can't easily test the SQL filter, but we can verify the function was called 
    expect(or).toHaveBeenCalled();
  });

  it("should handle errors properly", async () => {
    const mockFuelType = "Electric";
    const mockError = new Error("Database error");
    
    // Setup the orderBy to throw our mock error
    vi.mocked(db.select().from().where().orderBy).mockRejectedValue(mockError);
    
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    await expect(getCarsByFuelType(mockFuelType)).rejects.toThrow(mockError);
    
    expect(consoleSpy).toHaveBeenCalledWith(mockError);
    
    consoleSpy.mockRestore();
  });
});