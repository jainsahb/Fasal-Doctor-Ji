import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { fetchWithTimeout } from "../utils/fetchWithTimeout.js";

const requestedDetails = ["common_name", "description", "treatment", "symptoms", "severity", "spreading"];

export async function identifyCropDisease(image, language) {
  const imageBase64 = image.buffer.toString("base64");
  const response = await fetchWithTimeout(env.kindwiseEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Api-Key": env.kindwiseApiKey },
    body: JSON.stringify({
      images: [`data:${image.mimeType};base64,${imageBase64}`],
      details: requestedDetails,
      language,
    }),
  });

  if (!response.ok) {
    throw new AppError("The crop identification service is unavailable. Please retry.", 502);
  }

  const payload = await response.json();
  const suggestion = payload?.result?.disease?.suggestions?.[0];
  if (!suggestion) {
    throw new AppError("We could not identify a likely crop issue in this photo.", 422);
  }

  return {
    name: suggestion.name || suggestion.details?.common_name || "Unknown crop issue",
    scientificName: suggestion.scientific_name || suggestion.details?.scientific_name || suggestion.name || "Not available",
    confidence: Math.round((suggestion.probability || 0) * 100),
    details: suggestion.details || {},
  };
}
