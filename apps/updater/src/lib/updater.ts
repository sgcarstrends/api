import path from "node:path";
import { createUniqueKey } from "@sgcarstrends/utils";
import { AWS_LAMBDA_TEMP_DIR } from "@updater/config";
import { db } from "@updater/db";
import { calculateChecksum } from "@updater/utils/calculateChecksum";
import { downloadFile } from "@updater/utils/downloadFile";
import {
  type CSVTransformOptions,
  processCSV,
} from "@updater/utils/processCSV";
import { cacheChecksum, getCachedChecksum } from "@updater/utils/redisCache";
import { type Table, getTableName } from "drizzle-orm";

export interface UpdaterConfig<T> {
  table: Table;
  url: string;
  csvFile?: string;
  keyFields: string[];
  csvTransformOptions?: CSVTransformOptions<T>;
}

export interface UpdaterResult {
  table: string;
  recordsProcessed: number;
  message: string;
  timestamp: string;
  checksum?: string;
}

const BATCH_SIZE = 5000;

export const updater = async <T>({
  table,
  url,
  csvFile,
  keyFields,
  csvTransformOptions = {},
}: UpdaterConfig<T>): Promise<UpdaterResult> => {
  try {
    const tableName = getTableName(table);

    // Download and extract file
    const extractedFileName = await downloadFile(url, csvFile);
    const destinationPath = path.join(AWS_LAMBDA_TEMP_DIR, extractedFileName);
    console.log("Destination path:", destinationPath);

    // Calculate checksum of the downloaded file
    const checksum = await calculateChecksum(destinationPath);
    console.log("Checksum:", checksum);

    // Get previously stored checksum
    const cachedChecksum = await getCachedChecksum(extractedFileName);
    console.log("Cached checksum:", cachedChecksum);

    if (!cachedChecksum) {
      console.log("No cached checksum found. This might be the first run.");

      await cacheChecksum(extractedFileName, checksum);
    } else if (cachedChecksum === checksum) {
      const timestamp = new Date().toISOString();
      const message = `File has not changed since last update (Checksum: ${checksum})`;

      console.log(message);

      return {
        table: tableName,
        recordsProcessed: 0,
        message,
        timestamp,
        checksum,
      };
    }

    await cacheChecksum(extractedFileName, checksum);
    console.log("Checksum has been changed.");

    // Process CSV with custom transformations
    const processedData = await processCSV(
      destinationPath,
      csvTransformOptions,
    );

    // Create a query to check for existing records
    const existingKeysQuery = await db
      .select({
        ...Object.fromEntries(keyFields.map((field) => [field, table[field]])),
      })
      .from(table);

    // Create a Set of existing keys for faster lookup
    const existingKeys = new Set(
      existingKeysQuery.map((record) => createUniqueKey(record, keyFields)),
    );

    // Check against the existing records for new non-duplicated entries
    const newRecords = processedData.filter((record) => {
      const identifier = createUniqueKey(record, keyFields);
      return !existingKeys.has(identifier);
    });

    // Return early when there are no new records to be added to the database
    if (newRecords.length === 0) {
      return {
        table: tableName,
        recordsProcessed: 0,
        message:
          "No new data to insert. The provided data matches the existing records.",
        timestamp: new Date().toISOString(),
      };
    }

    // Process in batches only if we have new records
    let totalInserted = 0;

    const start = performance.now();
    for (let i = 0; i < newRecords.length; i += BATCH_SIZE) {
      const batch = newRecords.slice(i, i + BATCH_SIZE);
      const inserted = await db.insert(table).values(batch).returning();
      totalInserted += inserted.length;
      console.log(
        `Inserted batch of ${inserted.length} records. Total: ${totalInserted}`,
      );
    }
    const end = performance.now();

    await cacheChecksum(extractedFileName, checksum);

    const response = {
      table: tableName,
      recordsProcessed: totalInserted,
      message: `${totalInserted} record(s) inserted in ${Math.round(end - start)}ms`,
      timestamp: new Date().toISOString(),
    };
    console.log(response);

    return response;
  } catch (e) {
    console.error("Error in updater:", e);
    throw e;
  }
};
