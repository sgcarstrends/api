import AdmZip from "adm-zip";

// Helper function to extract ZIP file
export const extractZipFile = async (
  zipFilePath: string,
  extractToPath: string,
): Promise<string> => {
  const zip = new AdmZip(zipFilePath);
  zip.extractAllTo(extractToPath, true);
  const entry = zip.getEntries().find((entry) => !entry.isDirectory);
  return entry ? entry.entryName : "";
};
