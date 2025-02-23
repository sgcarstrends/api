import { AWS_LAMBDA_TEMP_DIR } from "@/config";
import AdmZip from "adm-zip";

export const downloadFile = async (url: string, csvFile?: string) => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const zip = new AdmZip(Buffer.from(arrayBuffer));
    const fileNames: string[] = [];

    for (const entry of zip.getEntries()) {
      if (!entry.isDirectory) {
        console.log("Found file in ZIP:", entry.entryName);
        fileNames.push(entry.entryName);

        // Extract to file system with full path
        zip.extractEntryTo(entry, AWS_LAMBDA_TEMP_DIR, true, true);
      }
    }

    return fileNames.find((name) => name.includes(csvFile)) || fileNames[0];
  } catch (error) {
    console.error("Error downloading or extracting file:", error);
    throw error;
  }
};
