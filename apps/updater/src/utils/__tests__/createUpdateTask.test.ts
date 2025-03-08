// Mock required modules before imports
import { vi } from "vitest";

// Mock Redis module to avoid SST Resource issues
vi.mock("@updater/config/redis", () => ({
  default: {
    set: vi.fn().mockResolvedValue(true),
  },
}));

// Mock trigger.dev SDK
vi.mock("@trigger.dev/sdk/v3", () => ({
  AbortTaskRunError: class AbortTaskRunError extends Error {
    constructor(error) {
      super(error.message);
      this.name = "AbortTaskRunError";
    }
  },
  logger: {
    log: vi.fn(),
    error: vi.fn(),
  },
  schedules: {
    task: vi.fn(),
  },
}));

// Now import the modules
import { createUpdateTask } from "@updater/utils/createUpdateTask";
import { AbortTaskRunError, logger, schedules } from "@trigger.dev/sdk/v3";
import redis from "@updater/config/redis";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("createUpdateTask", () => {
  const mockSchedulerName = "test-updater";
  const mockCron = { cron: "0 0 * * *" };
  
  let mockUpdaterFn;
  let taskConfig;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock updater function
    mockUpdaterFn = vi.fn().mockResolvedValue({
      recordsProcessed: 10,
      message: "Update successful",
      timestamp: new Date().toISOString(),
    });
    
    // Setup the task mock to capture config and return a mock task
    vi.mocked(schedules.task).mockImplementation((config) => {
      taskConfig = config;
      return { id: config.id };
    });
  });
  
  it("should create a scheduled task with the correct configuration", () => {
    const result = createUpdateTask(mockSchedulerName, mockCron, mockUpdaterFn);
    
    expect(schedules.task).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockSchedulerName,
        cron: mockCron,
      })
    );
    
    expect(result).toBeDefined();
  });
  
  it("should call the updater function when the task runs", async () => {
    createUpdateTask(mockSchedulerName, mockCron, mockUpdaterFn);
    
    // Execute the run function
    await taskConfig.run({}, { ctx: {} });
    
    expect(mockUpdaterFn).toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith(
      "Starting updater task",
      expect.any(Object)
    );
  });
  
  it("should update the last updated time on success", async () => {
    createUpdateTask(mockSchedulerName, mockCron, mockUpdaterFn);
    
    // Execute the onSuccess function
    await taskConfig.onSuccess();
    
    expect(redis.set).toHaveBeenCalledWith(
      `lastUpdated:${mockSchedulerName.toLowerCase()}`,
      expect.any(Number)
    );
    
    expect(logger.log).toHaveBeenCalledWith(
      "Last updated",
      expect.objectContaining({ timestamp: expect.any(Number) })
    );
  });
  
  it("should handle errors during task execution", async () => {
    const mockError = new Error("Updater failed");
    mockUpdaterFn.mockRejectedValue(mockError);
    
    createUpdateTask(mockSchedulerName, mockCron, mockUpdaterFn);
    
    try {
      await taskConfig.run({}, { ctx: {} });
      // If it doesn't throw, we should fail the test
      expect(true).toBe(false);
    } catch (error) {
      expect(error.name).toBe("AbortTaskRunError");
      expect(logger.error).toHaveBeenCalledWith(
        "Update task failed",
        expect.objectContaining({ error: mockError })
      );
    }
  });
  
  it("should handle task permanent failure", async () => {
    createUpdateTask(mockSchedulerName, mockCron, mockUpdaterFn);
    
    const mockError = new Error("Task failed permanently");
    
    // Execute the onFailure function
    await taskConfig.onFailure({}, mockError, { ctx: {} });
    
    expect(logger.error).toHaveBeenCalledWith(
      "Update Task Permanent Failure",
      expect.objectContaining({ error: mockError })
    );
  });
});