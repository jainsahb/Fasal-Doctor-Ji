import "dotenv/config";

const requiredForDiagnosis = ["KINDWISE_API_KEY", "OPENAI_API_KEY"];

export const env = Object.freeze({
  port: Number(process.env.PORT || 3001),
  kindwiseApiKey: process.env.KINDWISE_API_KEY || "",
  kindwiseEndpoint:
    process.env.KINDWISE_ENDPOINT ||
    "https://crop.kindwise.com/api/v1/identification",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-5.6-luna",
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SECRET_KEY || "",
});

export function missingDiagnosisConfiguration() {
  return requiredForDiagnosis.filter((name) => !process.env[name]);
}

export function isDatabaseConfigured() {
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
}
