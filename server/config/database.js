import { env, isDatabaseConfigured } from "./env.js";
import { AppError } from "../utils/AppError.js";

export async function insertScan(scan) {
  if (!isDatabaseConfigured()) return null;

  const response = await fetch(`${env.supabaseUrl}/rest/v1/scans`, {
    method: "POST",
    headers: {
      apikey: env.supabaseSecretKey,
      Authorization: `Bearer ${env.supabaseSecretKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(scan),
  });

  if (!response.ok)
    throw new AppError("Could not save this scan. Please retry.", 502);
  const [savedScan] = await response.json();
  return savedScan;
}
