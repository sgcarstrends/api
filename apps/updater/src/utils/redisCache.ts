import redis from "../config/redis";

/**
 * Caches a checksum value for a given file name
 *
 * @param fileName Name of the file to cache checksum for
 * @param checksum The checksum value to cache
 * @returns Promise resolving to true if successful, null if failed
 */
export const cacheChecksum = async (fileName: string, checksum: string) => {
  try {
    return redis.set(`checksum:${fileName}`, checksum);
  } catch (error) {
    console.error(`Error caching checksum: ${error}`);
    return null;
  }
};

/**
 * Retrieves a cached checksum value for a given file name
 *
 * @param fileName Name of the file to get checksum for
 * @returns Promise resolving to the cached checksum string or null if not found/error
 */
export const getCachedChecksum = async (fileName: string) => {
  try {
    return redis.get<string>(`checksum:${fileName}`);
  } catch (error) {
    console.error(`Error retrieving cached checksum: ${error}`);
    return null;
  }
};
