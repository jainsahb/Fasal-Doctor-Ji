import { diagnoseCrop } from "../services/diagnosis.service.js";
import { toDiagnosisInput } from "../models/diagnosis.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createDiagnosis = asyncHandler(async (req, res) => {
  const input = toDiagnosisInput(req.file, req.body);
  const diagnosis = await diagnoseCrop(input);
  res.status(200).json(diagnosis);
});
