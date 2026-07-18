import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { fetchWithTimeout } from "../utils/fetchWithTimeout.js";

const requestedDetails = [
  "common_names",
  "description",
  "treatment",
  "symptoms",
  "severity",
  "spreading",
];

// Expected URL format:
// 'https://crop.kindwise.com/api/v1/identification?details=common_names,type,taxonomy,eppo_code,eppo_regulation_status,gbif_id,image,images,wiki_url,wiki_description,treatment,description,symptoms,severity,spreading&language=en'
// Actual URL:
// 'https://crop.kindwise.com/api/v1/identification?details=common_names%2Cdescription%2Ctreatment%2Csymptoms%2Cseverity%2Cspreading&language=en'

export async function identifyCropDisease(image, language) {
  const params = new URLSearchParams({
    details: requestedDetails.join(","),
  });

  if (language) {
    params.set("language", language);
  }
  const url = `${env.kindwiseEndpoint}/identification?${params.toString()}`;
  const imageBase64 = image.buffer.toString("base64");
  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": env.kindwiseApiKey,
    },
    body: JSON.stringify({
      images: [`data:${image.mimeType};base64,${imageBase64}`],
    }),
  });

  if (!response.ok) {
    throw new AppError(
      "The crop identification service is unavailable. Please retry.",
      502,
    );
  }

  const payload = await response.json();
  const suggestion = payload?.result?.disease?.suggestions?.[0];
  if (!suggestion) {
    throw new AppError(
      "We could not identify a likely crop issue in this photo.",
      422,
    );
  }

  return {
    name:
      suggestion.name ||
      suggestion.details?.common_name ||
      "Unknown crop issue",
    scientificName:
      suggestion.scientific_name ||
      suggestion.details?.scientific_name ||
      suggestion.name ||
      "Not available",
    confidence: Math.round((suggestion.probability || 0) * 100),
    details: suggestion.details || {},
  };
  // Test Comment
  
}
