import { LTA_DATAMALL_BASE_URL } from "@/config";
import { coePQP } from "@/schema";
import type { PQP } from "@/types";
import { updater } from "./updater";

export const updateCOEPQP = async () => {
  const filename = "COE Bidding Results.zip";
  const CSV_FILE = "M11-coe_results_pqp.csv";
  const url = `${LTA_DATAMALL_BASE_URL}/${filename}`;
  const keyFields: Array<keyof PQP> = ["month", "vehicle_class", "pqp"];

  const response = await updater<PQP>({
    table: coePQP,
    url,
    csvFile: CSV_FILE,
    keyFields,
  });
  console.log("response", response);

  return response;
};

export const handler = async () => {
  const response = await updateCOEPQP();
  return { statusCode: 200, body: response };
};
