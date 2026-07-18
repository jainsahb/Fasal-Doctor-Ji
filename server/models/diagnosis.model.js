import { AppError } from "../utils/AppError.js";

const supportedLanguages = new Set(["en", "hi"]);

function requiredText(value, field) {
  const normalized = String(value || "").trim();
  if (!normalized) throw new AppError(`${field} is required.`, 400);
  return normalized;
}

export function toDiagnosisInput(file, body) {
  if (!file) throw new AppError("Please add a clear leaf or stem photo before scanning.", 400);
  return {
    image: { buffer: file.buffer, mimeType: file.mimetype, originalName: file.originalname },
    crop: requiredText(body.crop, "Crop"),
    region: requiredText(body.region, "State"),
    stage: requiredText(body.stage, "Crop stage"),
    language: supportedLanguages.has(body.language) ? body.language : "en",
  };
}

export function toStoredScan(input, diagnosis) {
  return {
    crop: input.crop,
    region: input.region,
    stage: input.stage,
    language: input.language,
    disease: diagnosis.disease,
    scientific_name: diagnosis.scientificName,
    confidence: diagnosis.confidence,
    result: diagnosis,
  };
}
