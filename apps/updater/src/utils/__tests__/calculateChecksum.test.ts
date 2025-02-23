import crypto from "node:crypto";
import { unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { calculateChecksum } from "@/utils/calculateChecksum";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("calculateChecksum", () => {
  const testFilePath = join(__dirname, "test-checksum-file.txt");

  beforeEach(async () => {
    // Create a test file before each test
    await writeFile(testFilePath, "Hello, world!");
  });

  afterEach(async () => {
    // Clean up the test file after each test
    await unlink(testFilePath);
  });

  it("should calculate the correct SHA-256 checksum for a file", async () => {
    // Manually calculate the expected checksum for comparison
    const expectedChecksum = crypto
      .createHash("sha256")
      .update("Hello, world!")
      .digest("hex");

    const calculatedChecksum = await calculateChecksum(testFilePath);

    expect(calculatedChecksum).toBe(expectedChecksum);
  });

  it("should return a 64-character hex string", async () => {
    const checksum = await calculateChecksum(testFilePath);

    expect(checksum).toMatch(/^[0-9a-f]{64}$/);
  });

  it("should throw an error for a non-existent file", async () => {
    const nonExistentFilePath = join(__dirname, "non-existent-file.txt");

    await expect(calculateChecksum(nonExistentFilePath)).rejects.toThrow(
      /no such file or directory/i,
    );
  });

  it("should handle large files efficiently", async () => {
    // Create a larger file
    const largeContent = "A".repeat(1024 * 1024); // 1MB of data
    await writeFile(testFilePath, largeContent);

    const startTime = Date.now();
    const checksum = await calculateChecksum(testFilePath);
    const duration = Date.now() - startTime;

    // Checksum should be calculated quickly and correctly
    expect(checksum).toBe(
      crypto.createHash("sha256").update(largeContent).digest("hex"),
    );
    expect(duration).toBeLessThan(1000); // Should complete in less than a second
  });
});
