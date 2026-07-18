import { insertScan } from "../config/database.js";

export function saveScan(scan) {
  return insertScan(scan);
}
