import { AWS_LAMBDA_TEMP_DIR } from "@updater/config";
import { downloadFile } from "@updater/utils/downloadFile";
import AdmZip from "adm-zip";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@updater/config", () => ({
  AWS_LAMBDA_TEMP_DIR: "/tmp",
}));

// Mock fetch
global.fetch = vi.fn();

// Mock AdmZip
vi.mock("adm-zip", () => {
  const mockEntries = [
    { 
      isDirectory: false, 
      entryName: "test.csv",
    },
    { 
      isDirectory: false, 
      entryName: "data.csv",
    },
    { 
      isDirectory: true, 
      entryName: "folder/",
    },
  ];
  
  return {
    default: class MockAdmZip {
      constructor() {}
      
      getEntries() {
        return mockEntries;
      }
      
      extractEntryTo(entry, path, maintainEntryPath, overwrite) {
        return true;
      }
    }
  };
});

describe("downloadFile", () => {
  const mockUrl = "https://example.com/test.zip";
  
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock successful fetch response
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
    } as unknown as Response);
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it("should fetch and extract files from a zip", async () => {
    const result = await downloadFile(mockUrl);
    
    expect(global.fetch).toHaveBeenCalledWith(mockUrl);
    expect(result).toBe("test.csv"); // Should return first file
  });
  
  it("should return the specific file when csvFile parameter is provided", async () => {
    const result = await downloadFile(mockUrl, "data");
    
    expect(global.fetch).toHaveBeenCalledWith(mockUrl);
    expect(result).toBe("data.csv");
  });
  
  it("should handle HTTP errors", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 404,
    } as unknown as Response);
    
    await expect(downloadFile(mockUrl)).rejects.toThrow("HTTP error! status: 404");
  });
  
  it("should handle fetch failures", async () => {
    const mockError = new Error("Network error");
    vi.mocked(global.fetch).mockRejectedValue(mockError);
    
    await expect(downloadFile(mockUrl)).rejects.toThrow(mockError);
  });
});