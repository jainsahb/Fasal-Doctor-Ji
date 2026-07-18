import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { fetchWithTimeout } from "../utils/fetchWithTimeout.js";

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "organic", "chemical", "prevention", "caution"],
  properties: {
    summary: { type: "string" },
    organic: { type: "array", items: { type: "string" }, minItems: 1 },
    chemical: { type: "array", items: { type: "string" }, minItems: 1 },
    prevention: { type: "array", items: { type: "string" }, minItems: 1 },
    caution: { type: "string" },
  },
};

export async function createLocalizedAdvisory({ crop, region, stage, language, identification }) {
  const prompt = [
    "Create practical crop-care guidance for a smallholder farmer in India.",
    `Reply in ${language === "hi" ? "Hindi" : "English"}.`,
    `Crop: ${crop}. Region/state: ${region}. Growth stage: ${stage}.`,
    `Image classifier result: ${identification.name} (${identification.scientificName}), confidence ${identification.confidence}%.`,
    `Reference information from the classifier: ${JSON.stringify(identification.details)}.`,
    "Keep each action brief. Do not invent pesticide doses or registration claims. For chemical actions, direct the farmer to a locally registered product's label. State that this is an AI screening, not a laboratory result.",
  ].join("\n");

  const response = await fetchWithTimeout("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.openaiApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: env.openaiModel,
      input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
      text: {
        format: { type: "json_schema", name: "crop_advisory", strict: true, schema: responseSchema },
      },
    }),
  });

  if (!response.ok) throw new AppError("The advisory service is unavailable. Please retry.", 502);

  const payload = await response.json();
  if (!payload.output_text) {
    throw new AppError("The advisory service returned an incomplete response.", 502);
  }

  try {
    return JSON.parse(payload.output_text);
  } catch {
    throw new AppError("The advisory service returned an invalid response.", 502);
  }
}
