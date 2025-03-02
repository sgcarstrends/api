import fs from "node:fs";
import Papa from "papaparse";

export interface CSVTransformOptions<T> {
  fields?: { [K in keyof T]?: unknown };
}

export const processCSV = async <T>(
  filePath: string,
  options: CSVTransformOptions<T> = {},
): Promise<unknown[]> => {
  const fileContent = fs.readFileSync(filePath, "utf-8");

  const { fields = {} } = options;

  const { data } = Papa.parse<T>(fileContent, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transform: (value, field) => {
      // Check for specific field transformations
      if (fields[field]) {
        return fields[field](value);
      }

      // Default trim
      return typeof value === "string" ? value.trim() : value;
    },
  });

  return data;
};
