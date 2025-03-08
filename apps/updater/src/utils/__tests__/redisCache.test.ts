import redis from "@updater/config/redis";
import { cacheChecksum, getCachedChecksum } from "@updater/utils/redisCache";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock redis
vi.mock("@updater/config/redis", () => ({
  default: {
    set: vi.fn().mockResolvedValue(true),
    get: vi.fn().mockResolvedValue("abc123def456"),
  },
}));

describe("redisCache", () => {
  const fileName = "test-file.csv";
  const checksum = "abc123def456";
  
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Default mock implementations
    vi.mocked(redis.set).mockResolvedValue(true);
    vi.mocked(redis.get).mockResolvedValue(checksum);
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  describe("cacheChecksum", () => {
    it("should store a checksum in Redis", async () => {
      const result = await cacheChecksum(fileName, checksum);
      
      expect(redis.set).toHaveBeenCalledWith(`checksum:${fileName}`, checksum);
      expect(result).toBe(true);
    });
    
    it("should handle Redis errors gracefully", async () => {
      // Setup the mock to throw an error
      vi.mocked(redis.set).mockImplementation(() => {
        throw new Error("Redis connection error");
      });
      
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      const result = await cacheChecksum(fileName, checksum);
      
      expect(consoleSpy).toHaveBeenCalled();
      expect(result).toBeNull();
      
      consoleSpy.mockRestore();
    });
  });
  
  describe("getCachedChecksum", () => {
    it("should retrieve a checksum from Redis", async () => {
      const result = await getCachedChecksum(fileName);
      
      expect(redis.get).toHaveBeenCalledWith(`checksum:${fileName}`);
      expect(result).toBe(checksum);
    });
    
    it("should return null when the checksum is not found", async () => {
      vi.mocked(redis.get).mockResolvedValueOnce(null);
      
      const result = await getCachedChecksum(fileName);
      
      expect(result).toBeNull();
    });
    
    it("should handle Redis errors gracefully", async () => {
      // Setup the mock to throw an error
      vi.mocked(redis.get).mockImplementation(() => {
        throw new Error("Redis connection error");
      });
      
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      const result = await getCachedChecksum(fileName);
      
      expect(consoleSpy).toHaveBeenCalled();
      expect(result).toBeNull();
      
      consoleSpy.mockRestore();
    });
  });
});