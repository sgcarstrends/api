import { LTA_DATAMALL_BASE_URL } from "@/config";
import { coe } from "@/schema";
import type { COE } from "@/types";
import { updater } from "./updater";

export const updateCOE = () => {
  const filename = "COE Bidding Results.zip";
  const CSV_FILE = "M11-coe_results.csv";
  const url = `${LTA_DATAMALL_BASE_URL}/${filename}`;
  const keyFields: Array<keyof COE> = ["month", "bidding_no"];

  const parseNumericString = (value: string | number) => {
    if (typeof value === "string") {
      return Number.parseInt(value.replace(/,/g, ""), 10);
    }

    return value;
  };

  const parseNumericFields: Array<keyof COE> = [
    "quota",
    "bids_success",
    "bids_received",
  ];

  return updater<COE>({
    table: coe,
    url,
    csvFile: CSV_FILE,
    keyFields,
    csvTransformOptions: {
      fields: Object.fromEntries(
        parseNumericFields.map((field) => [field, parseNumericString]),
      ),
    },
  });
};

export const handler = async () => {
  const response = await updateCOE();
  return { statusCode: 200, body: response };
};
