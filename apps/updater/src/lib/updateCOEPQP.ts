import { coePQP } from "@sgcarstrends/schema";
import { LTA_DATAMALL_BASE_URL } from "@updater/config";
import type { PQP } from "@updater/types";
import { updater } from "./updater";

export const updateCOEPQP = () => {
  const filename = "COE Bidding Results.zip";
  const CSV_FILE = "M11-coe_results_pqp.csv";
  const url = `${LTA_DATAMALL_BASE_URL}/${filename}`;
  const keyFields: Array<keyof PQP> = ["month", "vehicle_class", "pqp"];

  return updater<PQP>({
    table: coePQP,
    url,
    csvFile: CSV_FILE,
    keyFields,
  });
};

export const handler = async () => {
  const response = await updateCOEPQP();
  return { statusCode: 200, body: response };
};
