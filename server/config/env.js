import "dotenv/config";

const requiredForDiagnosis = ["KINDWISE_API_KEY", "GROQ_API_KEY"];

export const env = Object.freeze({
  port: Number(process.env.PORT || 3001),
  kindwiseApiKey: process.env.KINDWISE_API_KEY || "",
  kindwiseEndpoint:
    process.env.KINDWISE_ENDPOINT ||
    "https://crop.kindwise.com/api/v1/identification",
  groqApiKey: process.env.GROQ_API_KEY || "",
  groqModel: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SECRET_KEY || "",
});

export function missingDiagnosisConfiguration() {
  return requiredForDiagnosis.filter((name) => !process.env[name]);
}

export function isDatabaseConfigured() {
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
}
