import { isDatabaseConfigured, missingDiagnosisConfiguration } from "../config/env.js";

export function getHealth(_req, res) {
  const missing = missingDiagnosisConfiguration();
  res.status(missing.length ? 503 : 200).json({
    ok: missing.length === 0,
    services: {
      diagnosis: missing.length === 0 ? "ready" : "not_configured",
      database: isDatabaseConfigured() ? "ready" : "not_configured",
    },
  });
}
