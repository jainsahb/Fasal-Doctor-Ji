import { missingDiagnosisConfiguration } from "../config/env.js";
import { toStoredScan } from "../models/diagnosis.model.js";
import { identifyCropDisease } from "./cropHealth.service.js";
import { createLocalizedAdvisory } from "./advisory.service.js";
import { saveScan } from "./scanHistory.service.js";
import { AppError } from "../utils/AppError.js";

export async function diagnoseCrop(input) {
  const missing = missingDiagnosisConfiguration();
  if (missing.length) {
    throw new AppError("The diagnosis service is not configured yet. Add the required API keys to the server environment.", 503);
  }

  const identification = await identifyCropDisease(input.image, input.language);
  const advisory = await createLocalizedAdvisory({ ...input, identification });
  const diagnosis = {
    disease: identification.name,
    scientificName: identification.scientificName,
    confidence: identification.confidence,
    crop: input.crop,
    region: input.region,
    stage: input.stage,
    ...advisory,
  };

  await saveScan(toStoredScan(input, diagnosis));
  return diagnosis;
}
